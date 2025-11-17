# 🔒 Erebus Protocol

> Zero-Knowledge Privacy SDK for Solana Blockchain

[![Solana](https://img.shields.io/badge/Solana-Blockchain-9945FF?style=for-the-badge&logo=solana)](https://solana.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-SDK-F7DF1E?style=for-the-badge&logo=javascript)](./sdk/javascript)
[![Python](https://img.shields.io/badge/Python-SDK-3776AB?style=for-the-badge&logo=python)](./sdk/python)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

## 📖 Overview

**Erebus Protocol** provides official SDKs for integrating zero-knowledge privacy features into your Solana applications. Break on-chain links between sender and receiver with our simple-to-use developer tools.

### 🎯 Key Features

- **🔐 Private SOL Transfers** - Transfer SOL through treasury wallet with 0.5% fee
- **🪙 Private Token Transfers** - Transfer SPL tokens with full privacy
- **💱 Token Swap Integration** - Jupiter Aggregator for best swap rates
- **📊 Token Metadata** - Multi-source metadata with fallback (Jupiter → CryptoAPIs → On-chain)
- **💰 Real-time Balances** - Live balance tracking for SOL and tokens
- **📱 Easy Integration** - Simple SDK for JavaScript/TypeScript and Python

---

## 🚀 Quick Start

### JavaScript/TypeScript

**Installation:**
```bash
npm install erebus-sdk
# or
yarn add erebus-sdk
```

**Usage:**
```javascript
const { ErebusClient } = require('erebus-sdk');

const client = new ErebusClient({
  apiUrl: 'https://api.erebusprotocol.io'
});

// Prepare private SOL transfer
const transfer = await client.transfer.prepareSol({
  fromAddress: 'your_wallet_address',
  toAddress: 'destination_wallet_address',
  amount: 0.5
});

console.log('Total to pay:', transfer.totalToPay, 'SOL');
console.log('Privacy fee:', transfer.feeAmount, 'SOL');
```

### Python

**Installation:**
```bash
pip install erebus-sdk
```

**Usage:**
```python
from erebus import ErebusClient, TransferPrepareRequest

async with ErebusClient(api_url='https://api.erebusprotocol.io') as client:
    # Prepare private SOL transfer
    transfer = await client.prepare_sol_transfer(
        TransferPrepareRequest(
            from_address='your_wallet_address',
            to_address='destination_wallet_address',
            amount=0.5
        )
    )
    
    print(f'Total to pay: {transfer.total_to_pay} SOL')
    print(f'Privacy fee: {transfer.fee_amount} SOL')
```

---

## 🏗️ How It Works

### Privacy Protocol Flow

```
┌─────────┐          ┌─────────────┐          ┌──────────────┐
│  User   │  Step 1  │   Treasury  │  Step 2  │ Destination  │
│ Wallet  ├─────────►│   Wallet    ├─────────►│    Wallet    │
└─────────┘          └─────────────┘          └──────────────┘
   Pay                  Verify &                  Receive
 Amount+Fee            Auto-forward                Amount
```

**Process:**
1. User sends **Amount + Fee** to Treasury wallet
2. Backend verifies on-chain payment
3. Treasury automatically forwards **Amount** to destination wallet
4. User receives 2 transaction signatures (payment & destination)

**Privacy Benefit:**
- On-chain observer only sees: User → Treasury, Treasury → Destination
- Direct link between user and destination is broken

---

## 📚 Documentation

### For Developers

- **[Developer Guide](./DEVELOPER.md)** - Complete integration guide with code examples
- **[SDK Documentation](./sdk/README.md)** - Comprehensive API reference
- **[JavaScript Examples](./sdk/examples/javascript-example.js)** - Full code examples
- **[Python Examples](./sdk/examples/python-example.py)** - Full code examples

### SDK Features

| Feature | JavaScript | Python |
|---------|-----------|--------|
| Private SOL Transfer | ✅ | ✅ |
| Private Token Transfer | ✅ | ✅ |
| Token Metadata | ✅ | ✅ |
| Balance Queries | ✅ | ✅ |
| Swap Quotes | ✅ | ✅ |
| Transaction History | ✅ | ✅ |
| TypeScript Support | ✅ | ✅ (Type hints) |
| Async/Await | ✅ | ✅ |

---

## 💰 Fee Structure

| Transfer Type | Fee | Minimum Fee |
|--------------|-----|-------------|
| SOL Transfer | 0.5% | 0.001 SOL |
| Token Transfer | Fixed | 0.002 SOL |

*Network fees (~0.000005 SOL) apply separately*

---

## 🔧 API Endpoints

### Base URLs

- **Production:** `https://api.erebusprotocol.io/api`
- **Devnet:** `https://devnet-api.erebusprotocol.io/api`

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/transfer/sol/prepare` | POST | Prepare SOL transfer |
| `/transfer/sol/execute` | POST | Execute SOL transfer |
| `/transfer/token/prepare` | POST | Prepare token transfer |
| `/transfer/token/execute` | POST | Execute token transfer |
| `/token-list` | GET | Get popular tokens |
| `/token-info/{mint}` | GET | Get token info |
| `/token-metadata/cryptoapis/{mint}` | GET | Get token metadata |
| `/wallet-tokens/{address}` | GET | Get wallet tokens |
| `/balance/{address}` | GET | Get SOL balance |
| `/swap/quote` | POST | Get swap quote |
| `/transactions/{address}` | GET | Get transaction history |
| `/treasury/address` | GET | Get treasury address |

Full API documentation: [https://api.erebusprotocol.io/docs](https://api.erebusprotocol.io/docs)

---

## 💡 Example: Complete Private Transfer

### JavaScript

```javascript
import { ErebusClient } from 'erebus-sdk';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';

const client = new ErebusClient({ apiUrl: 'https://api.erebusprotocol.io' });

async function privateTransfer(toAddress, amount) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  // Step 1: Prepare transfer
  const prepare = await client.transfer.prepareSol({
    fromAddress: publicKey.toBase58(),
    toAddress: toAddress,
    amount: amount
  });

  // Step 2: Pay to treasury
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: new PublicKey(prepare.treasuryAddress),
      lamports: Math.floor(prepare.totalToPay * 1e9)
    })
  );

  const signature = await sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature);

  // Step 3: Execute transfer
  const result = await client.transfer.executeSol({
    transferId: prepare.transferId,
    paymentSignature: signature,
    fromAddress: publicKey.toBase58()
  });

  console.log('Transfer complete!');
  console.log('Destination TX:', result.destinationExplorer);
}
```

### Python

```python
from erebus import ErebusClient, TransferPrepareRequest, TransferExecuteRequest
from solana.rpc.async_api import AsyncClient
from solders.keypair import Keypair

async def private_transfer(wallet: Keypair, to_address: str, amount: float):
    async with ErebusClient(api_url='https://api.erebusprotocol.io') as client:
        # Step 1: Prepare transfer
        prepare = await client.prepare_sol_transfer(
            TransferPrepareRequest(
                from_address=str(wallet.pubkey()),
                to_address=to_address,
                amount=amount
            )
        )

        # Step 2: Pay to treasury (using Solana SDK)
        payment_signature = await send_to_treasury(wallet, prepare)

        # Step 3: Execute transfer
        result = await client.execute_sol_transfer(
            TransferExecuteRequest(
                transfer_id=prepare.transfer_id,
                payment_signature=payment_signature,
                from_address=str(wallet.pubkey())
            )
        )

        print('Transfer complete!')
        print(f'Destination TX: {result.destination_explorer}')
```

See full examples in [Developer Guide](./DEVELOPER.md)

---

## 🛡️ Security

### Best Practices

✅ Private keys stored in environment variables  
✅ API keys proxied through backend  
✅ On-chain payment verification before execution  
✅ Transaction status tracking in database  
✅ Input validation on both client and server  
✅ Proper error handling with HTTP status codes  

### Important Notes

⚠️ **Test on Devnet First** - Always test on devnet before using mainnet  
⚠️ **Secure Your Keys** - Never expose private keys in code  
⚠️ **Rate Limiting** - Implement rate limiting in production  
⚠️ **Audit Required** - Code not audited for production use  

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Solana](https://solana.com) - High-performance blockchain
- [Jupiter Aggregator](https://jup.ag) - Best swap rates
- [CryptoAPIs.io](https://cryptoapis.io) - Token metadata service
- [Phantom Wallet](https://phantom.app) - User-friendly Solana wallet

---

## 📧 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/erebus-protocol/erebus-privacy/issues)
- **Discussions**: [Ask questions](https://github.com/erebus-protocol/erebus-privacy/discussions)
- **Documentation**: [Developer Guide](./DEVELOPER.md) | [SDK Docs](./sdk/README.md)

---

<div align="center">

**Built with ❤️ for Solana Privacy**

⭐ Star this repo if you find it useful!

</div>
