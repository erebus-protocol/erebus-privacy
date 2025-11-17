"""Erebus SDK - Python Example

This example demonstrates how to use the Erebus SDK to perform
private SOL transfers with zero-knowledge privacy
"""

import asyncio
from erebus import ErebusClient, TransferPrepareRequest, TransferExecuteRequest


async def private_sol_transfer():
    """Example 1: Private SOL Transfer"""
    print("\n=== Private SOL Transfer ===\n")

    async with ErebusClient(api_url="http://localhost:8001") as client:
        # Step 1: Prepare transfer and get fee breakdown
        print("Step 1: Preparing transfer...")
        prepare_request = TransferPrepareRequest(
            from_address="YourWalletAddress",
            to_address="DestinationWalletAddress",
            amount=0.5  # 0.5 SOL
        )
        
        prepare_result = await client.prepare_sol_transfer(prepare_request)
        
        print(f"Transfer ID: {prepare_result.transfer_id}")
        print("Fee Breakdown:")
        print(f"  - Transfer Amount: {prepare_result.amount} SOL")
        print(f"  - Privacy Fee: {prepare_result.fee_amount} SOL")
        print(f"  - Total to Pay: {prepare_result.total_to_pay} SOL")
        print(f"  - Treasury Address: {prepare_result.treasury_address}")

        # Step 2: User pays to treasury (using wallet)
        print(f"\nStep 2: Please pay {prepare_result.total_to_pay} SOL to treasury")
        print(f"Treasury: {prepare_result.treasury_address}")
        
        # Simulate payment transaction
        payment_signature = "your_payment_signature_here"

        # Step 3: Execute transfer (backend forwards to destination)
        print("\nStep 3: Executing transfer...")
        execute_request = TransferExecuteRequest(
            transfer_id=prepare_result.transfer_id,
            payment_signature=payment_signature,
            from_address="YourWalletAddress"
        )
        
        execute_result = await client.execute_sol_transfer(execute_request)

        print("\n✅ Transfer Complete!")
        print(f"Payment TX: {execute_result.payment_explorer}")
        print(f"Destination TX: {execute_result.destination_explorer}")


async def get_token_info():
    """Example 2: Get Token Information"""
    print("\n=== Token Information ===\n")

    async with ErebusClient(api_url="http://localhost:8001") as client:
        # Get popular token list
        tokens = await client.get_token_list()
        print(f"Found {len(tokens)} popular tokens")
        print(f"Top 5 tokens: {[t.symbol for t in tokens[:5]]}")

        # Get specific token info
        sol_mint = "So11111111111111111111111111111111111111112"
        token_info = await client.get_token_info(sol_mint)
        print("\nSOL Token Info:")
        print(f"  - Symbol: {token_info.symbol}")
        print(f"  - Name: {token_info.name}")
        print(f"  - Decimals: {token_info.decimals}")


async def get_balance():
    """Example 3: Get Wallet Balance"""
    print("\n=== Wallet Balance ===\n")

    async with ErebusClient(api_url="http://localhost:8001") as client:
        address = "YourWalletAddress"
        
        # Get SOL balance
        sol_balance = await client.get_sol_balance(address)
        print(f"SOL Balance: {sol_balance} SOL")

        # Get all tokens in wallet
        wallet_tokens = await client.get_wallet_tokens(address)
        print(f"\nTokens in wallet: {len(wallet_tokens.get('tokens', []))}")


async def get_swap_quote():
    """Example 4: Get Swap Quote"""
    print("\n=== Swap Quote ===\n")

    async with ErebusClient(api_url="http://localhost:8001") as client:
        from erebus import SwapQuoteRequest
        
        quote_request = SwapQuoteRequest(
            input_mint="So11111111111111111111111111111111111111112",  # SOL
            output_mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",  # USDC
            amount=1000000000,  # 1 SOL in lamports
            slippage_bps=50  # 0.5% slippage
        )
        
        quote = await client.get_swap_quote(quote_request)

        print("Swap 1 SOL for USDC")
        print(f"  - Input: {quote.get('inputAmount')}")
        print(f"  - Output: {quote.get('outputAmount')}")
        print(f"  - Price Impact: {quote.get('priceImpactPct')}%")


async def get_transaction_history():
    """Example 5: Get Transaction History"""
    print("\n=== Transaction History ===\n")

    async with ErebusClient(api_url="http://localhost:8001") as client:
        address = "YourWalletAddress"
        transactions = await client.get_transaction_history(address, limit=10)

        print(f"Last {len(transactions)} transactions:")
        for i, tx in enumerate(transactions, 1):
            print(f"{i}. {tx.get('tx_type')} - {tx.get('amount')} {tx.get('token')}")
            print(f"   Status: {tx.get('status')} - {tx.get('timestamp')}")


async def main():
    """Run all examples"""
    print("🔒 Erebus Protocol SDK - Python Examples\n")
    print("============================================")

    # Uncomment the example you want to run
    # await private_sol_transfer()
    # await get_token_info()
    # await get_balance()
    # await get_swap_quote()
    # await get_transaction_history()

    print("\n✅ Examples completed!")


if __name__ == "__main__":
    asyncio.run(main())
