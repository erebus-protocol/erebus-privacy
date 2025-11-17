# 🛠️ Erebus Protocol - Developer Guide

Complete guide for integrating Erebus Protocol's privacy layer into your Solana applications.

---

## 🎯 Overview

Erebus Protocol provides a zero-knowledge privacy layer for Solana transactions. This guide will help you integrate privacy features into your application using our SDKs.

### What Erebus Protocol Offers

- **Private SOL Transfers** - Break on-chain links between sender and receiver
- **Private Token Transfers** - SPL token transfers with enhanced privacy
- **Token Metadata** - Multi-source token information (Jupiter → CryptoAPIs → On-chain)
- **Swap Integration** - Jupiter Aggregator for best rates
- **Real-time Data** - Balances, transaction history, and more

---

## 🚀 Getting Started

### Choose Your SDK

We provide official SDKs for multiple languages:

| Language | Installation | Documentation |
|----------|-------------|---------------|
| JavaScript/TypeScript | `npm install erebus-sdk` | [JS SDK Docs](./sdk/javascript/) |
| Python | `pip install erebus-sdk` | [Python SDK Docs](./sdk/python/) |

---

## 📦 Installation & Setup

### JavaScript/TypeScript

```bash
# Install SDK
npm install erebus-sdk

# Install Solana dependencies (for wallet integration)
npm install @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-wallets
```

**Setup:**
```javascript
import { ErebusClient } from 'erebus-sdk';

const client = new ErebusClient({
  apiUrl: 'https://api.erebusprotocol.io', // Or your self-hosted instance
  solanaRpcUrl: 'https://api.mainnet-beta.solana.com' // Optional
});
```

### Python

```bash
# Install SDK
pip install erebus-sdk

# Install Solana dependencies (for wallet integration)
pip install solders httpx
```

**Setup:**
```python
from erebus import ErebusClient

async with ErebusClient(api_url='https://api.erebusprotocol.io') as client:
    # Your code here
    pass
```

---

## 🔐 Private Transfer Integration

### Complete Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Step 1    │────▶│   Step 2    │────▶│   Step 3    │
│   Prepare   │     │     Pay     │     │   Execute   │
│  Transfer   │     │  Treasury   │     │ Destination │
└─────────────┘     └─────────────┘     └─────────────┘
```

### JavaScript Implementation

```javascript
import { ErebusClient } from 'erebus-sdk';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';

function PrivateTransferComponent() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const client = new ErebusClient({ apiUrl: 'https://api.erebusprotocol.io' });

  async function handlePrivateTransfer(toAddress, amount) {
    try {
      // ===== STEP 1: Prepare Transfer =====
      const prepare = await client.transfer.prepareSol({
        fromAddress: publicKey.toBase58(),
        toAddress: toAddress,
        amount: amount
      });

      console.log('Fee Breakdown:');
      console.log('  Transfer:', prepare.amount, 'SOL');
      console.log('  Privacy Fee:', prepare.feeAmount, 'SOL');
      console.log('  Total:', prepare.totalToPay, 'SOL');

      // ===== STEP 2: Pay to Treasury =====
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(prepare.treasuryAddress),
          lamports: Math.floor(prepare.totalToPay * 1e9)
        })
      );

      // User signs and sends payment
      const paymentSignature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(paymentSignature, 'confirmed');
      console.log('Payment confirmed:', paymentSignature);

      // ===== STEP 3: Execute Transfer =====
      const result = await client.transfer.executeSol({
        transferId: prepare.transferId,
        paymentSignature: paymentSignature,
        fromAddress: publicKey.toBase58()
      });

      console.log('Transfer complete!');
      console.log('Payment TX:', result.paymentExplorer);
      console.log('Destination TX:', result.destinationExplorer);

      return result;

    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    }
  }

  return (
    <button onClick={() => handlePrivateTransfer('dest_address', 0.5)}>
      Send Private Transfer
    </button>
  );
}
```

### Python Implementation

```python
from erebus import ErebusClient, TransferPrepareRequest, TransferExecuteRequest
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.system_program import transfer, TransferParams
from solders.transaction import Transaction
from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Confirmed

async def private_transfer(wallet: Keypair, to_address: str, amount: float):
    """Perform a private SOL transfer"""
    
    # Initialize clients
    solana_client = AsyncClient("https://api.mainnet-beta.solana.com")
    
    async with ErebusClient(api_url='https://api.erebusprotocol.io') as erebus:
        try:
            # ===== STEP 1: Prepare Transfer =====
            prepare = await erebus.prepare_sol_transfer(
                TransferPrepareRequest(
                    from_address=str(wallet.pubkey()),
                    to_address=to_address,
                    amount=amount
                )
            )

            print(f'Fee Breakdown:')
            print(f'  Transfer: {prepare.amount} SOL')
            print(f'  Privacy Fee: {prepare.fee_amount} SOL')
            print(f'  Total: {prepare.total_to_pay} SOL')

            # ===== STEP 2: Pay to Treasury =====
            treasury_pubkey = Pubkey.from_string(prepare.treasury_address)
            lamports = int(prepare.total_to_pay * 1e9)

            # Create transaction
            transfer_ix = transfer(
                TransferParams(
                    from_pubkey=wallet.pubkey(),
                    to_pubkey=treasury_pubkey,
                    lamports=lamports
                )
            )

            # Get recent blockhash
            recent_blockhash = await solana_client.get_latest_blockhash()
            
            # Build and sign transaction
            txn = Transaction([transfer_ix], recent_blockhash.value.blockhash)
            txn.sign([wallet], recent_blockhash.value.blockhash)

            # Send transaction
            result = await solana_client.send_transaction(txn)
            payment_signature = str(result.value)

            # Wait for confirmation
            await solana_client.confirm_transaction(payment_signature, Confirmed)
            print(f'Payment confirmed: {payment_signature}')

            # ===== STEP 3: Execute Transfer =====
            execute_result = await erebus.execute_sol_transfer(
                TransferExecuteRequest(
                    transfer_id=prepare.transfer_id,
                    payment_signature=payment_signature,
                    from_address=str(wallet.pubkey())
                )
            )

            print('Transfer complete!')
            print(f'Payment TX: {execute_result.payment_explorer}')
            print(f'Destination TX: {execute_result.destination_explorer}')

            return execute_result

        except Exception as e:
            print(f'Transfer failed: {e}')
            raise

# Usage
import asyncio

wallet = Keypair()  # Your wallet keypair
asyncio.run(private_transfer(wallet, 'destination_address', 0.5))
```

---

## 📊 Token Metadata Integration

### Get Token Information

**JavaScript:**
```javascript
// Get popular tokens
const tokens = await client.tokens.getList();

// Get specific token
const solInfo = await client.tokens.getInfo('So11111111111111111111111111111111111111112');

// Get tokens in wallet
const walletTokens = await client.tokens.getWalletTokens('wallet_address');
```

**Python:**
```python
# Get popular tokens
tokens = await client.get_token_list()

# Get specific token
sol_info = await client.get_token_info('So11111111111111111111111111111111111111112')

# Get tokens in wallet
wallet_tokens = await client.get_wallet_tokens('wallet_address')
```

---

## 💱 Swap Integration

### Get Best Swap Rate

**JavaScript:**
```javascript
const quote = await client.swap.getQuote({
  inputMint: 'So11111111111111111111111111111111111111112', // SOL
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amount: 1000000000, // 1 SOL in lamports
  slippageBps: 50 // 0.5% slippage
});

console.log('Output amount:', quote.outputAmount);
console.log('Price impact:', quote.priceImpactPct, '%');
```

**Python:**
```python
from erebus import SwapQuoteRequest

quote = await client.get_swap_quote(
    SwapQuoteRequest(
        input_mint='So11111111111111111111111111111111111111112',
        output_mint='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amount=1000000000,
        slippage_bps=50
    )
)

print(f'Output amount: {quote["outputAmount"]}')
print(f'Price impact: {quote["priceImpactPct"]}%')
```

---

## 🏗️ Self-Hosting

Want to run your own Erebus instance?

### Requirements

- Node.js 16+
- Python 3.9+
- MongoDB
- Solana RPC access

### Setup

```bash
# Clone repository
git clone https://github.com/erebus-protocol/erebus-privacy.git
cd erebus-privacy

# Setup backend
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
uvicorn server:app --host 0.0.0.0 --port 8001

# Setup frontend (in another terminal)
cd frontend
yarn install
cp .env.example .env
# Edit .env with backend URL
yarn start
```

**Configuration:**

Backend `.env`:
```bash
MONGO_URL="mongodb://localhost:27017"
DB_NAME="erebus_protocol"
TREASURY_PRIVATE_KEY="your_base58_private_key"
CRYPTOAPIS_API_KEY="your_cryptoapis_key"
```

Frontend `.env`:
```bash
REACT_APP_BACKEND_URL="http://localhost:8001"
```

---

## 🔒 Security Considerations

### For Developers

✅ **DO:**
- Store private keys in environment variables
- Use HTTPS for all API calls in production
- Validate all user inputs
- Handle errors gracefully
- Test on devnet before mainnet
- Keep SDK updated
- Implement rate limiting

❌ **DON'T:**
- Hardcode private keys or API keys
- Trust client-side data without validation
- Expose treasury wallet private key
- Skip error handling
- Ignore security updates

### For Self-Hosted Instances

1. **Treasury Wallet Security**
   - Store private key in secure vault
   - Use HSM for production
   - Implement withdrawal limits
   - Monitor treasury balance

2. **API Security**
   - Use API keys for authentication
   - Implement rate limiting
   - Enable CORS restrictions
   - Use HTTPS only

3. **Database Security**
   - Enable MongoDB authentication
   - Use encrypted connections
   - Regular backups
   - Access control

---

## 💰 Fee Structure

| Transfer Type | Fee | Minimum |
|--------------|-----|---------|
| SOL Transfer | 0.5% of amount | 0.001 SOL |
| Token Transfer | Fixed | 0.002 SOL |

Network fees (~0.000005 SOL) apply separately.

---

## 📖 API Reference

### Base URL

Production: `https://api.erebusprotocol.io/api`
Devnet: `https://devnet-api.erebusprotocol.io/api`

### Endpoints

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

Full API documentation: [OpenAPI Spec](https://api.erebusprotocol.io/docs)

---

## 🧪 Testing

### Test on Devnet

```javascript
// Point to devnet
const client = new ErebusClient({
  apiUrl: 'https://devnet-api.erebusprotocol.io',
  solanaRpcUrl: 'https://api.devnet.solana.com'
});

// Use devnet tokens
const DEVNET_SOL = 'So11111111111111111111111111111111111111112';
```

### Unit Tests

**JavaScript:**
```bash
cd sdk/javascript
npm test
```

**Python:**
```bash
cd sdk/python
pytest
```

---

## 🤝 Community & Support

- **GitHub**: [erebus-protocol/erebus-privacy](https://github.com/erebus-protocol/erebus-privacy)
- **Issues**: [Report bugs](https://github.com/erebus-protocol/erebus-privacy/issues)
- **Discussions**: [Ask questions](https://github.com/erebus-protocol/erebus-privacy/discussions)
- **Discord**: [Join community](https://discord.gg/erebus)

---

## 📚 Additional Resources

- [SDK Documentation](./sdk/README.md)
- [JavaScript Examples](./sdk/examples/javascript-example.js)
- [Python Examples](./sdk/examples/python-example.py)
- [API Reference](https://api.erebusprotocol.io/docs)
- [Architecture Guide](./README.md#architecture)

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

<div align=\"center\">

**Questions? Open an issue or join our Discord!**

</div>
