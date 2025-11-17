# 🔒 Erebus Protocol SDK Documentation

Official Software Development Kits for integrating Erebus Protocol's zero-knowledge privacy layer into your applications.

## 📦 Available SDKs

- **JavaScript/TypeScript SDK** - For web and Node.js applications
- **Python SDK** - For backend services and scripts

---

## 🚀 Quick Start

### JavaScript/TypeScript

**Installation:**
```bash
npm install erebus-sdk
# or
yarn add erebus-sdk
```

**Basic Usage:**
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

**Basic Usage:**
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

## 📚 API Reference

### Privacy Transfer

#### Prepare SOL Transfer

**JavaScript:**
```javascript
const result = await client.transfer.prepareSol({
  fromAddress: string,
  toAddress: string,
  amount: number
});
```

**Python:**
```python
result = await client.prepare_sol_transfer(
    TransferPrepareRequest(
        from_address: str,
        to_address: str,
        amount: float
    )
)
```

**Response:**
```json
{
  "transferId": "uuid",
  "amount": 0.5,
  "feeAmount": 0.0025,
  "totalToPay": 0.5025,
  "treasuryAddress": "treasury_wallet_address",
  "breakdown": {
    "transferAmount": 0.5,
    "privacyFee": 0.0025,
    "estimatedNetworkFee": 0.000005,
    "total": 0.5025
  }
}
```

#### Execute SOL Transfer

**JavaScript:**
```javascript
const result = await client.transfer.executeSol({
  transferId: string,
  paymentSignature: string,
  fromAddress: string
});
```

**Python:**
```python
result = await client.execute_sol_transfer(
    TransferExecuteRequest(
        transfer_id: str,
        payment_signature: str,
        from_address: str
    )
)
```

**Response:**
```json
{
  "success": true,
  "transferId": "uuid",
  "paymentSignature": "sig1...",
  "destinationSignature": "sig2...",
  "amount": 0.5,
  "destination": "destination_address",
  "paymentExplorer": "https://solscan.io/tx/sig1...",
  "destinationExplorer": "https://solscan.io/tx/sig2..."
}
```

---

### Token Metadata

#### Get Token List

**JavaScript:**
```javascript
const tokens = await client.tokens.getList();
```

**Python:**
```python
tokens = await client.get_token_list()
```

**Response:**
```json
[
  {
    "address": "So11111111111111111111111111111111111111112",
    "symbol": "SOL",
    "name": "Wrapped SOL",
    "decimals": 9,
    "logoURI": "https://...",
    "tags": ["verified"]
  }
]
```

#### Get Token Info

**JavaScript:**
```javascript
const token = await client.tokens.getInfo('mint_address');
```

**Python:**
```python
token = await client.get_token_info('mint_address')
```

#### Get Token Metadata (CryptoAPIs)

**JavaScript:**
```javascript
const metadata = await client.tokens.getMetadata('mint_address', 'mainnet');
```

**Python:**
```python
metadata = await client.get_token_metadata('mint_address', 'mainnet')
```

#### Get Wallet Tokens

**JavaScript:**
```javascript
const walletTokens = await client.tokens.getWalletTokens('wallet_address');
```

**Python:**
```python
wallet_tokens = await client.get_wallet_tokens('wallet_address')
```

---

### Balance

#### Get SOL Balance

**JavaScript:**
```javascript
const balance = await client.balance.getSol('wallet_address');
```

**Python:**
```python
balance = await client.get_sol_balance('wallet_address')
```

**Response:** `number` (SOL amount)

#### Get Token Balance

**JavaScript:**
```javascript
const balance = await client.balance.getToken('wallet_address', 'token_mint');
```

**Python:**
```python
balance = await client.get_token_balance('wallet_address', 'token_mint')
```

---

### Swap (Jupiter Integration)

#### Get Swap Quote

**JavaScript:**
```javascript
const quote = await client.swap.getQuote({
  inputMint: 'SOL_MINT',
  outputMint: 'USDC_MINT',
  amount: 1000000000, // 1 SOL in lamports
  slippageBps: 50 // 0.5%
});
```

**Python:**
```python
from erebus import SwapQuoteRequest

quote = await client.get_swap_quote(
    SwapQuoteRequest(
        input_mint='SOL_MINT',
        output_mint='USDC_MINT',
        amount=1000000000,
        slippage_bps=50
    )
)
```

---

### Transaction History

#### Get Transaction History

**JavaScript:**
```javascript
const transactions = await client.transactions.getHistory('wallet_address', 50);
```

**Python:**
```python
transactions = await client.get_transaction_history('wallet_address', limit=50)
```

**Response:**
```json
{
  "transactions": [
    {
      "tx_type": "private_transfer_sol",
      "amount": 0.5,
      "token": "SOL",
      "destination": "address...",
      "status": "completed",
      "timestamp": "2024-01-01T00:00:00Z",
      "tx_signature": "sig..."
    }
  ]
}
```

---

### Treasury

#### Get Treasury Address

**JavaScript:**
```javascript
const treasuryAddress = await client.treasury.getAddress();
```

**Python:**
```python
treasury_address = await client.get_treasury_address()
```

---

## 🎯 Complete Examples

### Private SOL Transfer (Full Flow)

**JavaScript:**
```javascript
const { ErebusClient } = require('erebus-sdk');
const { Connection, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');

const client = new ErebusClient({
  apiUrl: 'https://api.erebusprotocol.io'
});

async function privateTransfer() {
  // Step 1: Prepare transfer
  const prepare = await client.transfer.prepareSol({
    fromAddress: wallet.publicKey.toBase58(),
    toAddress: destinationAddress,
    amount: 0.5
  });

  console.log(`Pay ${prepare.totalToPay} SOL to ${prepare.treasuryAddress}`);

  // Step 2: Pay to treasury using Solana wallet
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(prepare.treasuryAddress),
      lamports: prepare.totalToPay * 1e9
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);

  // Step 3: Execute transfer (backend forwards to destination)
  const result = await client.transfer.executeSol({
    transferId: prepare.transferId,
    paymentSignature: signature,
    fromAddress: wallet.publicKey.toBase58()
  });

  console.log('Transfer complete!');
  console.log('Payment TX:', result.paymentExplorer);
  console.log('Destination TX:', result.destinationExplorer);
}
```

**Python:**
```python
from erebus import ErebusClient, TransferPrepareRequest, TransferExecuteRequest
from solders.keypair import Keypair
from solders.system_program import transfer, TransferParams
from solders.transaction import Transaction
from solana.rpc.async_api import AsyncClient

async def private_transfer():
    async with ErebusClient(api_url='https://api.erebusprotocol.io') as client:
        # Step 1: Prepare transfer
        prepare = await client.prepare_sol_transfer(
            TransferPrepareRequest(
                from_address=str(wallet.pubkey()),
                to_address=destination_address,
                amount=0.5
            )
        )

        print(f"Pay {prepare.total_to_pay} SOL to {prepare.treasury_address}")

        # Step 2: Pay to treasury using Solana
        # (Use your preferred Solana Python library)
        signature = await send_payment_to_treasury(prepare)

        # Step 3: Execute transfer
        result = await client.execute_sol_transfer(
            TransferExecuteRequest(
                transfer_id=prepare.transfer_id,
                payment_signature=signature,
                from_address=str(wallet.pubkey())
            )
        )

        print('Transfer complete!')
        print(f'Payment TX: {result.payment_explorer}')
        print(f'Destination TX: {result.destination_explorer}')
```

---

## ⚙️ Configuration

### JavaScript

```javascript
const client = new ErebusClient({
  apiUrl: 'https://api.erebusprotocol.io',
  solanaRpcUrl: 'https://api.mainnet-beta.solana.com' // Optional
});
```

### Python

```python
client = ErebusClient(
    api_url='https://api.erebusprotocol.io',
    timeout=30.0  # Request timeout in seconds
)
```

---

## 🔧 Error Handling

### JavaScript

```javascript
try {
  const result = await client.transfer.prepareSol({...});
} catch (error) {
  if (error.response) {
    // API error
    console.error('API Error:', error.response.status);
    console.error('Message:', error.response.data.detail);
  } else {
    // Network error
    console.error('Network Error:', error.message);
  }
}
```

### Python

```python
import httpx

try:
    result = await client.prepare_sol_transfer(...)
except httpx.HTTPStatusError as e:
    # API error
    print(f'API Error: {e.response.status_code}')
    print(f'Message: {e.response.json().get("detail")}')
except httpx.RequestError as e:
    # Network error
    print(f'Network Error: {e}')
```

---

## 💰 Fee Structure

| Transfer Type | Fee | Minimum Fee |
|--------------|-----|-------------|
| SOL Transfer | 0.5% | 0.001 SOL |
| Token Transfer | Fixed | 0.002 SOL |

*Network fees (~0.000005 SOL) apply separately*

---

## 🔒 Security Best Practices

1. **Never expose private keys** in your code
2. **Use environment variables** for API URLs and sensitive data
3. **Validate all inputs** before sending to API
4. **Handle errors gracefully** and provide user feedback
5. **Test on devnet** before using mainnet
6. **Keep SDK updated** to latest version

---

## 📖 Additional Resources

- [Full API Documentation](https://docs.erebusprotocol.io)
- [GitHub Repository](https://github.com/erebus-protocol/erebus-privacy)
- [Example Applications](./examples/)
- [TypeScript Definitions](./javascript/src/index.ts)

---

## 🤝 Support

- **GitHub Issues**: [Report bugs](https://github.com/erebus-protocol/erebus-privacy/issues)
- **Documentation**: [docs.erebusprotocol.io](https://docs.erebusprotocol.io)
- **Community**: [Discord](https://discord.gg/erebus)

---

## 📝 License

MIT License - see [LICENSE](../LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for Solana Privacy**

</div>
