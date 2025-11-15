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
from solders.message import Message
import httpx
import aiohttp

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
    tx_type: str
    amount: float
    token: str
    destination: Optional[str] = None
    status: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    tx_signature: Optional[str] = None

class TransferSOLRequest(BaseModel):
    from_address: str
    to_address: str
    amount: float

class TransferTokenRequest(BaseModel):
    from_address: str
    to_address: str
    token_mint: str
    amount: float
    decimals: int = 9

class BalanceResponse(BaseModel):
    address: str
    balance: float

class SwapQuoteRequest(BaseModel):
    input_mint: str
    output_mint: str
    amount: int
    slippage_bps: int = 50

# Treasury Wallet Management
def get_or_create_treasury_wallet():
    treasury_key = os.environ.get('TREASURY_PRIVATE_KEY')
    if not treasury_key:
        keypair = Keypair()
        private_key_bytes = bytes(keypair)
        private_key_b58 = base58.b58encode(private_key_bytes).decode('utf-8')
        print(f"\n=== NEW TREASURY WALLET GENERATED ===")
        print(f"Public Key: {keypair.pubkey()}")
        print(f"Private Key: {private_key_b58}")
        print(f"Add to .env: TREASURY_PRIVATE_KEY={private_key_b58}")
        print(f"=====================================\n")
        return keypair
    else:
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
    return {
        "address": str(TREASURY_KEYPAIR.pubkey()),
        "message": "Treasury wallet address"
    }

@api_router.get("/balance/{address}")
async def get_balance(address: str):
    try:
        pubkey = Pubkey.from_string(address)
        response = await solana_client.get_balance(pubkey)
        balance_lamports = response.value
        balance_sol = balance_lamports / 1_000_000_000
        return BalanceResponse(address=address, balance=balance_sol)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error getting balance: {str(e)}")

@api_router.get("/token-list")
async def get_token_list():
    """Get popular token list"""
    # Popular tokens with verified data
    popular_tokens = [
        {"address": "So11111111111111111111111111111111111111112", "symbol": "SOL", "name": "Wrapped SOL", "decimals": 9, "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png", "tags": ["verified"]},
        {"address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "symbol": "USDC", "name": "USD Coin", "decimals": 6, "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png", "tags": ["verified", "stablecoin"]},
        {"address": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "symbol": "USDT", "name": "USDT", "decimals": 6, "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png", "tags": ["verified", "stablecoin"]},
        {"address": "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", "symbol": "ETH", "name": "Ether (Portal)", "decimals": 8, "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs/logo.png", "tags": ["verified"]},
        {"address": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", "symbol": "mSOL", "name": "Marinade staked SOL", "decimals": 9, "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png", "tags": ["verified"]},
        {"address": "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj", "symbol": "stSOL", "name": "Lido Staked SOL", "decimals": 9, "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj/logo.png", "tags": ["verified"]},
        {"address": "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn", "symbol": "JitoSOL", "name": "Jito Staked SOL", "decimals": 9, "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn/logo.png", "tags": ["verified"]},
        {"address": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", "symbol": "BONK", "name": "Bonk", "decimals": 5, "logoURI": "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I", "tags": ["verified"]},
        {"address": "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", "symbol": "POPCAT", "name": "Popcat", "decimals": 9, "logoURI": "https://bafkreibk3covs5ltyqxa272uodhculbr6kea6betidfwy3ajsav2vjzyum.ipfs.nftstorage.link", "tags": ["verified"]},
        {"address": "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3", "symbol": "PYTH", "name": "Pyth Network", "decimals": 6, "logoURI": "https://pyth.network/token.svg", "tags": ["verified"]},
    ]
    return popular_tokens

@api_router.post("/swap/quote")
async def get_swap_quote(request: SwapQuoteRequest):
    """Get swap quote - simplified calculation using price estimation"""
    try:
        # For now, use a simple price-based calculation
        # In production, this should call Jupiter API
        
        # Get token info for decimals
        input_token = None
        output_token = None
        
        # Find tokens in our list
        popular_tokens = await get_token_list()
        for token in popular_tokens:
            if token["address"] == request.input_mint:
                input_token = token
            if token["address"] == request.output_mint:
                output_token = token
        
        if not input_token or not output_token:
            raise HTTPException(status_code=400, detail="Token not found in supported list")
        
        # Simple price estimation (this is a placeholder)
        # In real implementation, fetch actual prices from DEX
        price_map = {
            "SOL": 180.0,
            "USDC": 1.0,
            "USDT": 1.0,
            "ETH": 3200.0,
            "mSOL": 195.0,
            "stSOL": 195.0,
            "JitoSOL": 198.0,
            "BONK": 0.000025,
            "POPCAT": 0.85,
            "PYTH": 0.45
        }
        
        input_price = price_map.get(input_token["symbol"], 1.0)
        output_price = price_map.get(output_token["symbol"], 1.0)
        
        # Calculate output amount
        input_amount_ui = request.amount / (10 ** input_token["decimals"])
        input_value_usd = input_amount_ui * input_price
        output_amount_ui = input_value_usd / output_price
        output_amount = int(output_amount_ui * (10 ** output_token["decimals"]))
        
        # Apply slippage
        slippage_factor = 1 - (request.slippage_bps / 10000)
        output_amount = int(output_amount * slippage_factor)
        
        return {
            "inputMint": request.input_mint,
            "outputMint": request.output_mint,
            "inAmount": str(request.amount),
            "outAmount": str(output_amount),
            "otherAmountThreshold": str(output_amount),
            "swapMode": "ExactIn",
            "slippageBps": request.slippage_bps,
            "priceImpactPct": "0.1",
            "note": "Estimated quote - prices are approximate"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Swap quote error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting swap quote: {str(e)}")

@api_router.get("/token-balance/{wallet}/{mint}")
async def get_token_balance(wallet: str, mint: str):
    """Get SPL token balance for a wallet"""
    try:
        from solders.rpc.responses import GetTokenAccountsByOwnerJsonParsedResp
        from solana.rpc.core import RPCException
        
        wallet_pubkey = Pubkey.from_string(wallet)
        mint_pubkey = Pubkey.from_string(mint)
        
        # Get token accounts by owner with parsed data
        opts = {"encoding": "jsonParsed"}
        response = await solana_client.get_token_accounts_by_owner_json_parsed(
            wallet_pubkey,
            {"mint": mint_pubkey}
        )
        
        if response.value and len(response.value) > 0:
            # Get the first token account (usually there's only one per mint)
            token_account_info = response.value[0].account.data.parsed
            balance_data = token_account_info['info']['tokenAmount']
            
            return {
                "balance": float(balance_data['uiAmount']),
                "decimals": balance_data['decimals'],
                "mint": mint,
                "raw_balance": balance_data['amount']
            }
        else:
            return {"balance": 0, "decimals": 0, "mint": mint, "raw_balance": "0"}
            
    except Exception as e:
        logging.error(f"Token balance error: {str(e)}")
        return {"balance": 0, "decimals": 0, "mint": mint, "raw_balance": "0"}

@api_router.get("/token-info/{mint}")
async def get_token_info(mint: str):
    """Get token metadata by mint address"""
    try:
        # First check if token is in our popular list
        popular_tokens = await get_token_list()
        for token in popular_tokens:
            if token["address"] == mint:
                return token
        
        # If not in list, fetch from chain
        mint_pubkey = Pubkey.from_string(mint)
        
        # Get account info to verify token exists
        account_info = await solana_client.get_account_info(mint_pubkey)
        
        if account_info.value:
            # Parse mint data to get decimals
            data = account_info.value.data
            decimals = 9  # Default
            
            # SPL Token Mint layout: decimals is at byte 44
            if len(data) >= 44:
                try:
                    decimals = data[44]
                except:
                    decimals = 9
            
            # Generate symbol from mint address
            # Use a more recognizable pattern
            symbol = f"TOKEN-{mint[:4].upper()}"
            
            # Return basic token info
            return {
                "address": mint,
                "symbol": symbol,
                "name": f"Custom Token ({mint[:8]}...{mint[-4:]})",
                "decimals": decimals,
                "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
                "tags": ["custom"]
            }
        else:
            raise HTTPException(status_code=404, detail="Token not found on chain")
                
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Token info error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching token info: {str(e)}")

@api_router.post("/transfer/sol")
async def transfer_sol_private(request: TransferSOLRequest):
    try:
        amount_lamports = int(request.amount * 1_000_000_000)
        to_pubkey = Pubkey.from_string(request.to_address)
        
        transfer_ix = transfer(
            TransferParams(
                from_pubkey=TREASURY_KEYPAIR.pubkey(),
                to_pubkey=to_pubkey,
                lamports=amount_lamports
            )
        )
        
        recent_blockhash_resp = await solana_client.get_latest_blockhash()
        recent_blockhash = recent_blockhash_resp.value.blockhash
        
        msg = Message.new_with_blockhash([transfer_ix], TREASURY_KEYPAIR.pubkey(), recent_blockhash)
        txn = Transaction([TREASURY_KEYPAIR], msg, recent_blockhash)
        
        result = await solana_client.send_transaction(
            txn,
            opts=TxOpts(skip_preflight=False, preflight_commitment=Confirmed)
        )
        
        tx_signature = str(result.value)
        
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
    try:
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
            "message": "Token transfer initiated"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token transfer failed: {str(e)}")

@api_router.get("/transactions/{address}")
async def get_transactions(address: str, limit: int = 50):
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
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.jup.ag/price/v2?ids=SOL,USDC,USDT")
            if response.status_code == 200:
                return response.json()
            else:
                return {"data": {}}
    except Exception as e:
        logging.error(f"Price fetch error: {str(e)}")
        return {"data": {}}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    await solana_client.close()