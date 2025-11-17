# Erebus Protocol - Python SDK

Official Python SDK for Erebus Protocol's zero-knowledge privacy layer on Solana.

## Installation

```bash
pip install erebus-sdk
```

## Quick Start

```python
import asyncio
from erebus import ErebusClient, TransferPrepareRequest

async def main():
    async with ErebusClient(api_url='https://api.erebusprotocol.io') as client:
        # Prepare private SOL transfer
        transfer = await client.prepare_sol_transfer(
            TransferPrepareRequest(
                from_address='your_wallet',
                to_address='destination_wallet',
                amount=0.5
            )
        )
        
        print(f'Total to pay: {transfer.total_to_pay} SOL')

if __name__ == '__main__':
    asyncio.run(main())
```

## Documentation

See [SDK Documentation](../README.md) for complete API reference and examples.

## License

MIT
