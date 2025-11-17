"""Erebus Protocol Client"""

import httpx
from typing import List, Optional, Dict, Any
from .types import (
    TransferPrepareRequest,
    TransferPrepareResponse,
    TransferExecuteRequest,
    TransferExecuteResponse,
    TokenInfo,
    SwapQuoteRequest,
    FeeBreakdown,
)


class ErebusClient:
    """Main client for interacting with Erebus Protocol API"""

    def __init__(self, api_url: str, timeout: float = 30.0):
        """
        Initialize Erebus client

        Args:
            api_url: Base URL of Erebus API (e.g., "http://localhost:8001")
            timeout: Request timeout in seconds
        """
        self.api_url = api_url.rstrip("/")
        self.base_url = f"{self.api_url}/api"
        self.timeout = timeout
        self.client = httpx.AsyncClient(timeout=timeout)

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    # Transfer API

    async def prepare_sol_transfer(self, request: TransferPrepareRequest) -> TransferPrepareResponse:
        """
        Prepare SOL transfer - Step 1
        Calculate fees and get payment details

        Args:
            request: Transfer preparation request

        Returns:
            Transfer preparation response with fee breakdown
        """
        response = await self.client.post(
            f"{self.base_url}/transfer/sol/prepare",
            json={
                "from_address": request.from_address,
                "to_address": request.to_address,
                "amount": request.amount,
            },
        )
        response.raise_for_status()
        data = response.json()

        return TransferPrepareResponse(
            transfer_id=data["transfer_id"],
            amount=data["amount"],
            fee_amount=data["fee_amount"],
            total_to_pay=data["total_to_pay"],
            treasury_address=data["treasury_address"],
            breakdown=FeeBreakdown(
                transfer_amount=data["breakdown"]["transfer_amount"],
                privacy_fee=data["breakdown"]["privacy_fee"],
                estimated_network_fee=data["breakdown"]["estimated_network_fee"],
                total=data["breakdown"]["total"],
            ),
        )

    async def execute_sol_transfer(self, request: TransferExecuteRequest) -> TransferExecuteResponse:
        """
        Execute SOL transfer - Step 2
        After user pays to treasury, backend forwards to destination

        Args:
            request: Transfer execution request with payment signature

        Returns:
            Transfer execution response with both signatures
        """
        response = await self.client.post(
            f"{self.base_url}/transfer/sol/execute",
            json={
                "transfer_id": request.transfer_id,
                "payment_signature": request.payment_signature,
                "from_address": request.from_address,
            },
        )
        response.raise_for_status()
        data = response.json()

        return TransferExecuteResponse(
            success=data["success"],
            transfer_id=data["transfer_id"],
            payment_signature=data["payment_signature"],
            destination_signature=data["destination_signature"],
            amount=data["amount"],
            destination=data["destination"],
            payment_explorer=data["payment_explorer"],
            destination_explorer=data["destination_explorer"],
        )

    async def prepare_token_transfer(
        self,
        from_address: str,
        to_address: str,
        token_mint: str,
        amount: float,
        decimals: int,
    ) -> Dict[str, Any]:
        """Prepare token transfer"""
        response = await self.client.post(
            f"{self.base_url}/transfer/token/prepare",
            json={
                "from_address": from_address,
                "to_address": to_address,
                "token_mint": token_mint,
                "amount": amount,
                "decimals": decimals,
            },
        )
        response.raise_for_status()
        return response.json()

    async def execute_token_transfer(self, request: TransferExecuteRequest) -> Dict[str, Any]:
        """Execute token transfer"""
        response = await self.client.post(
            f"{self.base_url}/transfer/token/execute",
            json={
                "transfer_id": request.transfer_id,
                "payment_signature": request.payment_signature,
                "from_address": request.from_address,
            },
        )
        response.raise_for_status()
        return response.json()

    # Token API

    async def get_token_list(self) -> List[TokenInfo]:
        """Get popular token list"""
        response = await self.client.get(f"{self.base_url}/token-list")
        response.raise_for_status()
        data = response.json()

        return [
            TokenInfo(
                address=token["address"],
                symbol=token["symbol"],
                name=token["name"],
                decimals=token["decimals"],
                logo_uri=token.get("logoURI"),
                tags=token.get("tags"),
            )
            for token in data
        ]

    async def get_token_info(self, mint: str) -> TokenInfo:
        """Get token info by mint address"""
        response = await self.client.get(f"{self.base_url}/token-info/{mint}")
        response.raise_for_status()
        data = response.json()

        return TokenInfo(
            address=data["address"],
            symbol=data["symbol"],
            name=data["name"],
            decimals=data["decimals"],
            logo_uri=data.get("logoURI"),
            tags=data.get("tags"),
        )

    async def get_token_metadata(self, mint: str, network: str = "mainnet") -> Dict[str, Any]:
        """Get token metadata from CryptoAPIs"""
        response = await self.client.get(
            f"{self.base_url}/token-metadata/cryptoapis/{mint}?network={network}"
        )
        response.raise_for_status()
        return response.json()

    async def get_wallet_tokens(self, address: str) -> Dict[str, Any]:
        """Get all tokens in wallet"""
        response = await self.client.get(f"{self.base_url}/wallet-tokens/{address}")
        response.raise_for_status()
        return response.json()

    # Swap API

    async def get_swap_quote(self, request: SwapQuoteRequest) -> Dict[str, Any]:
        """Get swap quote from Jupiter"""
        response = await self.client.post(
            f"{self.base_url}/swap/quote",
            json={
                "input_mint": request.input_mint,
                "output_mint": request.output_mint,
                "amount": request.amount,
                "slippage_bps": request.slippage_bps,
            },
        )
        response.raise_for_status()
        return response.json()

    # Balance API

    async def get_sol_balance(self, address: str) -> float:
        """Get SOL balance"""
        response = await self.client.get(f"{self.base_url}/balance/{address}")
        response.raise_for_status()
        data = response.json()
        return data["balance"]

    async def get_token_balance(self, wallet: str, mint: str) -> Dict[str, Any]:
        """Get token balance"""
        response = await self.client.get(f"{self.base_url}/token-balance/{wallet}/{mint}")
        response.raise_for_status()
        return response.json()

    # Transaction API

    async def get_transaction_history(self, address: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get transaction history"""
        response = await self.client.get(f"{self.base_url}/transactions/{address}?limit={limit}")
        response.raise_for_status()
        data = response.json()
        return data["transactions"]

    # Treasury API

    async def get_treasury_address(self) -> str:
        """Get treasury wallet address"""
        response = await self.client.get(f"{self.base_url}/treasury/address")
        response.raise_for_status()
        data = response.json()
        return data["address"]
