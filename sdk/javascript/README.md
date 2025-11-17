# Erebus Protocol - JavaScript SDK

Official JavaScript/TypeScript SDK for Erebus Protocol's zero-knowledge privacy layer on Solana.

## Installation

```bash
npm install erebus-sdk
# or
yarn add erebus-sdk
```

## Quick Start

```javascript
const { ErebusClient } = require('erebus-sdk');

const client = new ErebusClient({
  apiUrl: 'https://api.erebusprotocol.io'
});

// Prepare private SOL transfer
const transfer = await client.transfer.prepareSol({
  fromAddress: 'your_wallet',
  toAddress: 'destination_wallet',
  amount: 0.5
});

console.log('Total to pay:', transfer.totalToPay, 'SOL');
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import { ErebusClient, TransferPrepareRequest } from 'erebus-sdk';

const client = new ErebusClient({
  apiUrl: 'https://api.erebusprotocol.io'
});
```

## Documentation

See [SDK Documentation](../README.md) for complete API reference and examples.

## License

MIT
