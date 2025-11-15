import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Book, Code, Shield, Lock, Zap, ArrowLeft, Copy, Check,
  ChevronRight, Terminal, FileCode, Key, Database
} from 'lucide-react';
import { Button } from '../components/ui/button';

const DocsPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('getting-started');
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: Book },
    { id: 'core-concepts', label: 'Core Concepts', icon: Shield },
    { id: 'api-reference', label: 'API Reference', icon: Code },
    { id: 'sdk-integration', label: 'SDK Integration', icon: Terminal },
    { id: 'examples', label: 'Examples', icon: FileCode },
  ];

  const apiEndpoints = [
    {
      method: 'POST',
      endpoint: '/deposit',
      description: 'Create a private deposit',
      params: [
        { name: 'amount', type: 'number', required: true, desc: 'Amount to deposit in lamports' },
        { name: 'token', type: 'string', required: true, desc: 'SPL token address or "SOL"' },
        { name: 'commitment', type: 'string', required: true, desc: 'Pedersen commitment' },
      ]
    },
    {
      method: 'POST',
      endpoint: '/withdraw',
      description: 'Withdraw from private pool',
      params: [
        { name: 'proof', type: 'string', required: true, desc: 'ZK proof of ownership' },
        { name: 'nullifier', type: 'string', required: true, desc: 'Nullifier hash' },
        { name: 'recipient', type: 'string', required: true, desc: 'Recipient wallet address' },
      ]
    },
    {
      method: 'POST',
      endpoint: '/swap',
      description: 'Execute private token swap',
      params: [
        { name: 'inputToken', type: 'string', required: true, desc: 'Input token address' },
        { name: 'outputToken', type: 'string', required: true, desc: 'Output token address' },
        { name: 'amount', type: 'number', required: true, desc: 'Input amount' },
        { name: 'proof', type: 'string', required: true, desc: 'ZK proof' },
      ]
    },
    {
      method: 'GET',
      endpoint: '/balance/{commitment}',
      description: 'Get private balance',
      params: [
        { name: 'commitment', type: 'string', required: true, desc: 'User commitment hash' },
      ]
    },
    {
      method: 'GET',
      endpoint: '/pool/info',
      description: 'Get pool statistics',
      params: []
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-[var(--gold-primary)]">Getting Started</h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                Welcome to Erebus Protocol documentation. Learn how to integrate privacy-preserving transactions into your dApp.
              </p>
            </div>

            <div className="doc-section">
              <h2 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Quick Start</h2>
              <div className="space-y-4">
                <div className="step-doc">
                  <div className="step-number-doc">1</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Install Dependencies</h3>
                    <div className="code-block-doc">
                      <button 
                        onClick={() => copyToClipboard('npm install @erebus/sdk @solana/web3.js', 'install')}
                        className="copy-btn-doc"
                      >
                        {copiedCode === 'install' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <pre className="code-pre">npm install @erebus/sdk @solana/web3.js</pre>
                    </div>
                  </div>
                </div>

                <div className="step-doc">
                  <div className="step-number-doc">2</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Initialize Client</h3>
                    <div className="code-block-doc">
                      <button 
                        onClick={() => copyToClipboard(`import { ErebusClient } from '@erebus/sdk';

const client = new ErebusClient({
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  apiBaseUrl: 'https://erebusprotocol.com/api/v2'
});`, 'init')}
                        className="copy-btn-doc"
                      >
                        {copiedCode === 'init' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <pre className="code-pre">{`import { ErebusClient } from '@erebus/sdk';

const client = new ErebusClient({
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  apiBaseUrl: 'https://erebusprotocol.com/api/v2'
});`}</pre>
                    </div>
                  </div>
                </div>

                <div className="step-doc">
                  <div className="step-number-doc">3</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Make Your First Deposit</h3>
                    <div className="code-block-doc">
                      <button 
                        onClick={() => copyToClipboard(`const deposit = await client.deposit({
  amount: 1000000000, // 1 SOL in lamports
  token: 'SOL'
});

console.log('Commitment:', deposit.commitment);
console.log('Secret:', deposit.secret); // Store securely!`, 'deposit')}
                        className="copy-btn-doc"
                      >
                        {copiedCode === 'deposit' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <pre className="code-pre">{`const deposit = await client.deposit({
  amount: 1000000000, // 1 SOL in lamports
  token: 'SOL'
});

console.log('Commitment:', deposit.commitment);
console.log('Secret:', deposit.secret); // Store securely!`}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="doc-section">
              <h2 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Requirements</h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-400">
                  <ChevronRight className="h-5 w-5 text-[var(--gold-primary)] mt-0.5" />
                  <span>Node.js 16+ or latest LTS version</span>
                </li>
                <li className="flex items-start gap-2 text-gray-400">
                  <ChevronRight className="h-5 w-5 text-[var(--gold-primary)] mt-0.5" />
                  <span>Solana wallet (Phantom, Solflare, etc.)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-400">
                  <ChevronRight className="h-5 w-5 text-[var(--gold-primary)] mt-0.5" />
                  <span>Basic understanding of Zero-Knowledge proofs</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'core-concepts':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-[var(--gold-primary)]">Core Concepts</h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                Understanding the cryptographic primitives behind Erebus Protocol.
              </p>
            </div>

            <div className="doc-section">
              <h2 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Zero-Knowledge Proofs</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Erebus uses zk-SNARKs (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge) to enable private transactions. 
                Users can prove they own funds without revealing which specific deposit belongs to them.
              </p>
              <div className="concept-card">
                <h3 className="text-xl font-semibold mb-2 text-white">How It Works</h3>
                <ol className="space-y-2 text-gray-400">
                  <li>1. User deposits funds and receives a commitment</li>
                  <li>2. Commitment is stored on-chain in anonymity set</li>
                  <li>3. User generates ZK proof of ownership</li>
                  <li>4. Funds can be withdrawn to any address without linking</li>
                </ol>
              </div>
            </div>

            <div className="doc-section">
              <h2 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Pedersen Commitments</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Commitments hide the amount and owner of funds using elliptic curve cryptography.
              </p>
              <div className="code-block-doc">
                <pre className="code-pre">{`commitment = value × G + randomness × H

Where:
- G, H are generator points on the curve
- value is the amount being committed
- randomness is a secret random number`}</pre>
              </div>
            </div>

            <div className="doc-section">
              <h2 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Nullifiers</h2>
              <p className="text-gray-400 leading-relaxed">
                Nullifiers prevent double-spending while maintaining privacy. Each commitment can only be spent once, 
                but the nullifier doesn't reveal which commitment it corresponds to.
              </p>
            </div>

            <div className="doc-section">
              <h2 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Anonymity Set</h2>
              <p className="text-gray-400 leading-relaxed">
                The larger the anonymity set (total deposits), the stronger the privacy guarantees. 
                Your transaction is hidden among all other deposits in the pool.
              </p>
            </div>
          </div>
        );

      case 'api-reference':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-[var(--gold-primary)]">API Reference</h1>
              <p className="text-gray-400 text-lg leading-relaxed mb-4">
                Complete API documentation for Erebus Protocol v2
              </p>
              <div className="api-base-url">
                <Key className="h-5 w-5 text-[var(--gold-primary)]" />
                <span className="text-sm text-gray-500">Base URL:</span>
                <code className="text-[var(--gold-primary)]">https://erebusprotocol.com/api/v2</code>
              </div>
            </div>

            <div className="doc-section">
              <h2 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Authentication</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                All requests must include a valid signature from your Solana wallet.
              </p>
              <div className="code-block-doc">
                <pre className="code-pre">{`Headers:
  X-Wallet-Address: <your_wallet_address>
  X-Signature: <signed_message>
  Content-Type: application/json`}</pre>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Endpoints</h2>
              
              {apiEndpoints.map((endpoint, index) => (
                <div key={index} className="api-endpoint-card">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`method-badge method-${endpoint.method.toLowerCase()}`}>
                      {endpoint.method}
                    </span>
                    <code className="text-[var(--gold-primary)] text-lg">{endpoint.endpoint}</code>
                  </div>
                  <p className="text-gray-400 mb-4">{endpoint.description}</p>
                  
                  {endpoint.params.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Parameters:</h4>
                      <div className="params-table">
                        {endpoint.params.map((param, pidx) => (
                          <div key={pidx} className="param-row">
                            <div className="flex items-center gap-2">
                              <code className="text-[var(--gold-primary)] text-sm">{param.name}</code>
                              {param.required && <span className="required-badge">required</span>}
                            </div>
                            <span className="text-gray-500 text-sm">{param.type}</span>
                            <span className="text-gray-400 text-sm">{param.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Example Request:</h4>
                    <div className="code-block-doc">
                      <pre className="code-pre text-sm">{`curl -X ${endpoint.method} https://erebusprotocol.com/api/v2${endpoint.endpoint} \\
  -H "Content-Type: application/json" \\
  -H "X-Wallet-Address: YourWalletAddress" \\
  -d '${JSON.stringify(
    endpoint.params.reduce((acc, p) => ({ ...acc, [p.name]: `<${p.name}>` }), {}),
    null,
    2
  )}'`}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'sdk-integration':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-[var(--gold-primary)]">SDK Integration</h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                Integrate Erebus Protocol into your application with our official SDK.
              </p>
            </div>

            <div className="doc-section">
              <h2 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">JavaScript/TypeScript SDK</h2>
              <div className="code-block-doc">
                <button 
                  onClick={() => copyToClipboard('npm install @erebus/sdk', 'sdk-install')}
                  className="copy-btn-doc"
                >
                  {copiedCode === 'sdk-install' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
                <pre className="code-pre">npm install @erebus/sdk</pre>
              </div>
            </div>

            <div className="doc-section">
              <h2 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Complete Example</h2>
              <div className="code-block-doc">
                <button 
                  onClick={() => copyToClipboard(`import { ErebusClient } from '@erebus/sdk';
import { Connection, Keypair } from '@solana/web3.js';

// Initialize
const connection = new Connection('https://api.mainnet-beta.solana.com');
const wallet = Keypair.generate(); // Or use your wallet

const erebus = new ErebusClient({
  connection,
  wallet,
  apiBaseUrl: 'https://erebusprotocol.com/api/v2'
});

// Deposit
const { commitment, secret, txId } = await erebus.deposit({
  amount: 1_000_000_000, // 1 SOL
  token: 'SOL'
});

console.log('Deposit successful!');
console.log('Commitment:', commitment);
console.log('Secret:', secret); // IMPORTANT: Store this securely!

// Later: Withdraw
const withdrawTx = await erebus.withdraw({
  commitment,
  secret,
  recipient: 'RecipientWalletAddress...',
  amount: 1_000_000_000
});

console.log('Withdraw TX:', withdrawTx);`, 'complete-example')}
                  className="copy-btn-doc"
                >
                  {copiedCode === 'complete-example' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
                <pre className="code-pre">{`import { ErebusClient } from '@erebus/sdk';
import { Connection, Keypair } from '@solana/web3.js';

// Initialize
const connection = new Connection('https://api.mainnet-beta.solana.com');
const wallet = Keypair.generate(); // Or use your wallet

const erebus = new ErebusClient({
  connection,
  wallet,
  apiBaseUrl: 'https://erebusprotocol.com/api/v2'
});

// Deposit
const { commitment, secret, txId } = await erebus.deposit({
  amount: 1_000_000_000, // 1 SOL
  token: 'SOL'
});

console.log('Deposit successful!');
console.log('Commitment:', commitment);
console.log('Secret:', secret); // IMPORTANT: Store this securely!

// Later: Withdraw
const withdrawTx = await erebus.withdraw({
  commitment,
  secret,
  recipient: 'RecipientWalletAddress...',
  amount: 1_000_000_000
});

console.log('Withdraw TX:', withdrawTx);`}</pre>
              </div>
            </div>

            <div className="doc-section">
              <h2 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">React Integration</h2>
              <div className="code-block-doc">
                <pre className="code-pre">{`import { useErebus } from '@erebus/react';

function MyComponent() {
  const { deposit, withdraw, balance } = useErebus();
  
  const handleDeposit = async () => {
    const result = await deposit({
      amount: 1_000_000_000,
      token: 'SOL'
    });
    
    // Store commitment & secret
    localStorage.setItem('commitment', result.commitment);
    localStorage.setItem('secret', result.secret);
  };
  
  return (
    <button onClick={handleDeposit}>
      Deposit Privately
    </button>
  );
}`}</pre>
              </div>
            </div>
          </div>
        );

      case 'examples':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-[var(--gold-primary)]">Code Examples</h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                Real-world examples and use cases.
              </p>
            </div>

            <div className="doc-section">
              <h2 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Private Token Swap</h2>
              <div className="code-block-doc">
                <pre className="code-pre">{`// Swap USDC to SOL privately
const swap = await erebus.privateSwap({
  inputToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  outputToken: 'SOL',
  inputAmount: 100_000_000, // 100 USDC
  slippage: 0.5 // 0.5%
});

console.log('Swap completed:', swap.txId);
console.log('Output amount:', swap.outputAmount);`}</pre>
              </div>
            </div>

            <div className="doc-section">
              <h2 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Private Transfer</h2>
              <div className="code-block-doc">
                <pre className="code-pre">{`// Transfer SOL privately
const transfer = await erebus.privateTransfer({
  recipient: 'RecipientAddress...',
  amount: 500_000_000, // 0.5 SOL
  token: 'SOL'
});

console.log('Transfer successful:', transfer.txId);
// Recipient receives funds without link to sender`}</pre>
              </div>
            </div>

            <div className="doc-section">
              <h2 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Check Private Balance</h2>
              <div className="code-block-doc">
                <pre className="code-pre">{`// Query your private balance
const balance = await erebus.getBalance({
  commitment: storedCommitment,
  secret: storedSecret
});

console.log('Private SOL balance:', balance.sol);
console.log('Private USDC balance:', balance.tokens['USDC']);`}</pre>
              </div>
            </div>

            <div className="doc-section">
              <h2 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Error Handling</h2>
              <div className="code-block-doc">
                <pre className="code-pre">{`try {
  const deposit = await erebus.deposit({
    amount: 1_000_000_000,
    token: 'SOL'
  });
  
  // Success handling
  console.log('Deposit successful:', deposit);
  
} catch (error) {
  if (error.code === 'INSUFFICIENT_BALANCE') {
    console.error('Not enough balance');
  } else if (error.code === 'INVALID_PROOF') {
    console.error('ZK proof generation failed');
  } else {
    console.error('Unexpected error:', error);
  }
}`}</pre>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="docs-page min-h-screen bg-[var(--dark-bg)] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-[var(--gold-primary)]/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-[var(--gold-primary)] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center gap-3">
            <Book className="h-6 w-6 text-[var(--gold-primary)]" />
            <span className="text-xl font-bold text-[var(--gold-primary)]">Documentation</span>
          </div>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black hover:opacity-90"
          >
            Launch App
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 shrink-0">
            <nav className="sticky top-24 space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeSection === section.id
                        ? 'bg-[var(--gold-primary)]/10 border border-[var(--gold-primary)]/30 text-[var(--gold-primary)]'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {renderContent()}
          </main>
        </div>
      </div>

      <style jsx>{`
        .doc-section {
          padding: 2rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 215, 0, 0.1);
          border-radius: 16px;
        }

        .step-doc {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }

        .step-number-doc {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          font-weight: bold;
          flex-shrink: 0;
        }

        .code-block-doc {
          position: relative;
          background: #000;
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 0.75rem;
          overflow-x: auto;
        }

        .code-pre {
          margin: 0;
          color: #e5e7eb;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .copy-btn-doc {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          padding: 0.5rem;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 6px;
          color: var(--gold-primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .copy-btn-doc:hover {
          background: rgba(255, 215, 0, 0.2);
        }

        .concept-card {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 215, 0, 0.15);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .api-base-url {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 12px;
        }

        .api-endpoint-card {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 215, 0, 0.1);
          border-radius: 16px;
          padding: 2rem;
          transition: all 0.3s;
        }

        .api-endpoint-card:hover {
          border-color: var(--gold-primary);
          background: rgba(0, 0, 0, 0.5);
        }

        .method-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .method-post {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .method-get {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .params-table {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 215, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        .param-row {
          display: grid;
          grid-template-columns: 1fr auto 2fr;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(255, 215, 0, 0.05);
        }

        .param-row:last-child {
          border-bottom: none;
        }

        .required-badge {
          padding: 0.125rem 0.5rem;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 4px;
          font-size: 0.625rem;
          color: #ef4444;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
};

export default DocsPage;
