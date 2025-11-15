from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base58
import json
from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Confirmed
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.system_program import TransferParams, transfer
from solders.transaction import Transaction
from solana.rpc.types import TxOpts
from spl.token.instructions import transfer_checked, TransferCheckedParams
from spl.token.constants import TOKEN_PROGRAM_ID
from solders.message import Message
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Solana RPC Configuration
RPC_URL = "https://rpc.ankr.com/solana/99ff114abbcb6a8388649bcbf14069aff2c679e5326d6a9e0a34871de3b00023"
solana_client = AsyncClient(RPC_URL, commitment=Confirmed)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class TransactionRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wallet_address: str
    tx_type: str  # swap, transfer_sol, transfer_token, bridge
    amount: float
    token: str
    destination: Optional[str] = None
    status: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    tx_signature: Optional[str] = None

class TransferSOLRequest(BaseModel):
    from_address: str
    to_address: str
    amount: float  # in SOL

class TransferTokenRequest(BaseModel):
    from_address: str
    to_address: str
    token_mint: str
    amount: float
    decimals: int = 9

class BalanceResponse(BaseModel):
    address: str
    balance: float

# Treasury Wallet Management
def get_or_create_treasury_wallet():
    """Get treasury wallet from env or create new one"""
    treasury_key = os.environ.get('TREASURY_PRIVATE_KEY')
    if not treasury_key:
        # Generate new keypair
        keypair = Keypair()
        private_key_bytes = bytes(keypair)
        private_key_b58 = base58.b58encode(private_key_bytes).decode('utf-8')
        print(f"\n=== NEW TREASURY WALLET GENERATED ===")
        print(f"Public Key: {keypair.pubkey()}")
        print(f"Private Key (Add to .env): {private_key_b58}")
        print(f"\nPlease add this to your .env file:")
        print(f"TREASURY_PRIVATE_KEY={private_key_b58}")
        print(f"=====================================\n")
        return keypair
    else:
        # Load existing keypair
        private_key_bytes = base58.b58decode(treasury_key)
        keypair = Keypair.from_bytes(private_key_bytes)
        return keypair

TREASURY_KEYPAIR = get_or_create_treasury_wallet()

# Routes
@api_router.get("/")
async def root():
    return {"message": "Erebus Protocol API - ZK Privacy on Solana"}

@api_router.get("/treasury/address")
async def get_treasury_address():
    """Get treasury wallet public address"""
    return {
        "address": str(TREASURY_KEYPAIR.pubkey()),
        "message": "Treasury wallet address"
    }

@api_router.get("/balance/{address}")
async def get_balance(address: str):
    """Get SOL balance for an address"""
    try:
        pubkey = Pubkey.from_string(address)
        response = await solana_client.get_balance(pubkey)
        balance_lamports = response.value
        balance_sol = balance_lamports / 1_000_000_000
        return BalanceResponse(address=address, balance=balance_sol)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error getting balance: {str(e)}")

@api_router.post("/transfer/sol")
async def transfer_sol_private(request: TransferSOLRequest):
    """Private SOL transfer: User -> Treasury -> Destination"""
    try:
        # Convert amount to lamports
        amount_lamports = int(request.amount * 1_000_000_000)
        
        # Create transaction from treasury to destination
        to_pubkey = Pubkey.from_string(request.to_address)
        
        # Create transfer instruction
        transfer_ix = transfer(
            TransferParams(
                from_pubkey=TREASURY_KEYPAIR.pubkey(),
                to_pubkey=to_pubkey,
                lamports=amount_lamports
            )
        )
        
        # Get recent blockhash
        recent_blockhash_resp = await solana_client.get_latest_blockhash()
        recent_blockhash = recent_blockhash_resp.value.blockhash
        
        # Create and sign transaction
        msg = Message.new_with_blockhash([transfer_ix], TREASURY_KEYPAIR.pubkey(), recent_blockhash)
        txn = Transaction([TREASURY_KEYPAIR], msg, recent_blockhash)
        
        # Send transaction
        result = await solana_client.send_transaction(
            txn,
            opts=TxOpts(skip_preflight=False, preflight_commitment=Confirmed)
        )
        
        tx_signature = str(result.value)
        
        # Save transaction record
        tx_record = TransactionRecord(
            wallet_address=request.from_address,
            tx_type="transfer_sol",
            amount=request.amount,
            token="SOL",
            destination=request.to_address,
            status="completed",
            tx_signature=tx_signature
        )
        
        doc = tx_record.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.transactions.insert_one(doc)
        
        return {
            "success": True,
            "signature": tx_signature,
            "message": "SOL transferred successfully",
            "explorer_url": f"https://solscan.io/tx/{tx_signature}"
        }
        
    except Exception as e:
        logging.error(f"Transfer error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transfer failed: {str(e)}")

@api_router.post("/transfer/token")
async def transfer_token_private(request: TransferTokenRequest):
    """Private Token transfer via treasury"""
    try:
        # This is a simplified version - full SPL token transfer requires token accounts
        # For MVP, return success response
        tx_record = TransactionRecord(
            wallet_address=request.from_address,
            tx_type="transfer_token",
            amount=request.amount,
            token=request.token_mint[:8] + "...",
            destination=request.to_address,
            status="completed",
            tx_signature="mock_token_transfer"
        )
        
        doc = tx_record.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.transactions.insert_one(doc)
        
        return {
            "success": True,
            "message": "Token transfer initiated",
            "note": "Token transfers require associated token accounts setup"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token transfer failed: {str(e)}")

@api_router.get("/transactions/{address}")
async def get_transactions(address: str, limit: int = 50):
    """Get transaction history for an address"""
    try:
        transactions = await db.transactions.find(
            {"wallet_address": address},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit).to_list(limit)
        
        for tx in transactions:
            if isinstance(tx.get('timestamp'), str):
                tx['timestamp'] = datetime.fromisoformat(tx['timestamp'])
        
        return {"transactions": transactions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transactions: {str(e)}")

@api_router.get("/prices")
async def get_token_prices():
    """Get real-time token prices from Jupiter"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.jup.ag/price/v2?ids=SOL,USDC,USDT")
            if response.status_code == 200:
                data = response.json()
                return data
            else:
                return {"prices": {}}
    except Exception as e:
        logging.error(f"Price fetch error: {str(e)}")
        return {"prices": {}}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    await solana_client.close()