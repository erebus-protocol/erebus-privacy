# 🔒 Erebus Protocol

> Zero-Knowledge Privacy Layer for Solana Blockchain

[![Solana](https://img.shields.io/badge/Solana-Blockchain-9945FF?style=for-the-badge&logo=solana)](https://solana.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)

## 📖 Overview

**Erebus Protocol** is a privacy-focused application for the Solana blockchain that enables users to perform SOL and SPL token transfers with enhanced privacy through a treasury wallet mechanism. Using zero-knowledge privacy concepts, this protocol breaks the on-chain link between sender and receiver.

### 🎯 Key Features

- **🔐 Private SOL Transfers** - Transfer SOL through treasury wallet with 0.5% fee
- **🪙 Private Token Transfers** - Transfer SPL tokens with full privacy
- **💱 Token Swap Integration** - Jupiter Aggregator for best swap rates
- **📊 Token Metadata** - Multi-source metadata with fallback (Jupiter → CryptoAPIs → On-chain)
- **💰 Real-time Balances** - Live balance tracking for SOL and tokens
- **🎨 Modern UI/UX** - Dark theme with gold accents, Lottie animations
- **📱 Wallet Integration** - Support for Phantom, Solflare, and other wallets

---

## 🏗️ Architecture

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

### Tech Stack

**Frontend:**
- React 18 + TailwindCSS
- Solana Wallet Adapter
- @solana/web3.js + @solana/spl-token
- Lottie animations
- Axios for API calls

**Backend:**
- FastAPI (Python)
- Motor (Async MongoDB driver)
- Solana Python SDK
- HTTPX for external APIs

**Blockchain:**
- Solana Mainnet/Devnet
- Jupiter Aggregator API
- CryptoAPIs.io for token metadata

**Database:**
- MongoDB for transaction history & pending transfers

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ & Yarn
- Python 3.9+
- MongoDB
- Solana wallet (Phantom recommended)

### Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/erebus-protocol/erebus-privacy.git
   cd erebus-privacy
   ```

2. **Setup Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   
   # Create .env file
   cat > .env << EOF
   MONGO_URL="mongodb://localhost:27017"
   DB_NAME="erebus_protocol"
   CORS_ORIGINS="*"
   TREASURY_PRIVATE_KEY="your_treasury_private_key_base58"
   CRYPTOAPIS_API_KEY="your_cryptoapis_key"
   EOF
   
   # Run backend
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   yarn install
   
   # Create .env file
   cat > .env << EOF
   REACT_APP_BACKEND_URL="http://localhost:8001"
   EOF
   
   # Run frontend
   yarn start
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001/docs

---

## 📚 API Documentation

### Privacy Transfer Endpoints

#### 1. Prepare SOL Transfer
```http
POST /api/transfer/sol/prepare
Content-Type: application/json

{
  "from_address": "user_wallet_address",
  "to_address": "destination_wallet_address",
  "amount": 0.5
}
```

**Response:**
```json
{
  "transfer_id": "uuid",
  "amount": 0.5,
  "fee_amount": 0.0025,
  "total_to_pay": 0.5025,
  "treasury_address": "treasury_wallet_address",
  "breakdown": {
    "transfer_amount": 0.5,
    "privacy_fee": 0.0025,
    "estimated_network_fee": 0.000005,
    "total": 0.5025
  }
}
```

#### 2. Execute SOL Transfer
```http
POST /api/transfer/sol/execute
Content-Type: application/json

{
  "transfer_id": "uuid_from_prepare",
  "payment_signature": "transaction_signature",
  "from_address": "user_wallet_address"
}
```

**Response:**
```json
{
  "success": true,
  "payment_signature": "sig1...",
  "destination_signature": "sig2...",
  "amount": 0.5,
  "destination": "destination_address"
}
```

### Token Metadata Endpoints

#### Get Token Metadata (Multi-source)
```http
GET /api/token-metadata/cryptoapis/{mint_address}?network=mainnet
```

### Other Endpoints

- `GET /api/token-list` - Popular tokens list
- `GET /api/token-info/{mint}` - Token info by mint
- `GET /api/balance/{address}` - Get SOL balance
- `GET /api/wallet-tokens/{address}` - Get all tokens in wallet
- `POST /api/swap/quote` - Get swap quote from Jupiter
- `GET /api/transactions/{address}` - Transaction history

Full API documentation available at: http://localhost:8001/docs

---

## 💰 Fee Structure

| Transfer Type | Fee | Minimum Fee |
|--------------|-----|-------------|
| SOL Transfer | 0.5% | 0.001 SOL |
| Token Transfer | Fixed | 0.002 SOL |

*Network fees (~0.000005 SOL) apply separately*

---

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```bash
MONGO_URL="mongodb://localhost:27017"
DB_NAME="erebus_protocol"
CORS_ORIGINS="*"
TREASURY_PRIVATE_KEY="base58_encoded_private_key"
CRYPTOAPIS_API_KEY="your_api_key"
```

**Frontend (.env):**
```bash
REACT_APP_BACKEND_URL="http://localhost:8001"
```

### Generating Treasury Wallet

Run the backend once, and it will auto-generate a treasury wallet. Copy the private key to `.env`:

```bash
python -c "from solders.keypair import Keypair; import base58; kp = Keypair(); print(f'Public: {kp.pubkey()}\nPrivate: {base58.b58encode(bytes(kp)).decode()}')"
```

---

## 🎨 Features Deep Dive

### 1. Private SOL Transfer

**UI Flow:**
- **Step 1:** User inputs amount and destination address
- **Step 2:** Review fee breakdown and pay to treasury
- **Step 3:** View both transaction signatures

**Privacy Benefit:**
- On-chain observer only sees: User → Treasury, Treasury → Destination
- Direct link between user and destination is broken

### 2. Token Metadata System

3-tier fallback mechanism:
1. **Jupiter Token List** (Primary) - Comprehensive, fast, cached
2. **CryptoAPIs.io** (Fallback) - For tokens not in Jupiter
3. **On-chain** (Final) - Basic info parsed from blockchain

### 3. Token Swap

Integrated with Jupiter Aggregator:
- Best price aggregation
- Multiple DEX routing
- Slippage protection
- Client-side execution for reliability

---

## 🛡️ Security Considerations

### Best Practices Implemented

✅ Private keys stored in environment variables  
✅ API keys proxied through backend  
✅ On-chain payment verification before execution  
✅ Transaction status tracking in database  
✅ Input validation on both frontend and backend  
✅ Error handling with proper HTTP status codes  

### Important Notes

⚠️ **Not Production Ready**: This is a proof-of-concept  
⚠️ **Treasury Security**: Secure your treasury private key  
⚠️ **Audit Required**: Code not audited for production use  
⚠️ **Network**: Test on devnet first before mainnet  

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

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and community support

---

<div align="center">

**Built with ❤️ for Solana Privacy**

⭐ Star this repo if you find it useful!

</div>
