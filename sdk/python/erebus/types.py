"""Type definitions for Erebus SDK"""

from dataclasses import dataclass
from typing import Optional, List


@dataclass
class TransferPrepareRequest:
    from_address: str
    to_address: str
    amount: float


@dataclass
class FeeBreakdown:
    transfer_amount: float
    privacy_fee: float
    estimated_network_fee: float
    total: float


@dataclass
class TransferPrepareResponse:
    transfer_id: str
    amount: float
    fee_amount: float
    total_to_pay: float
    treasury_address: str
    breakdown: FeeBreakdown


@dataclass
class TransferExecuteRequest:
    transfer_id: str
    payment_signature: str
    from_address: str


@dataclass
class TransferExecuteResponse:
    success: bool
    transfer_id: str
    payment_signature: str
    destination_signature: str
    amount: float
    destination: str
    payment_explorer: str
    destination_explorer: str


@dataclass
class TokenInfo:
    address: str
    symbol: str
    name: str
    decimals: int
    logo_uri: Optional[str] = None
    tags: Optional[List[str]] = None


@dataclass
class SwapQuoteRequest:
    input_mint: str
    output_mint: str
    amount: int
    slippage_bps: int = 50
