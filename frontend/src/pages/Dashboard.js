import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Wallet, Activity } from 'lucide-react';
import SwapComponent from '../components/SwapComponent';
import TransferSOL from '../components/TransferSOL';
import TransferToken from '../components/TransferToken';
import BridgeComponent from '../components/BridgeComponent';
import TransactionHistory from '../components/TransactionHistory';

const Dashboard = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('swap');

  useEffect(() => {
    if (!connected) {
      navigate('/');
    }
  }, [connected, navigate]);

  useEffect(() => {
    if (publicKey && connected) {
      fetchBalance();
      const interval = setInterval(fetchBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [publicKey, connected]);

  const fetchBalance = async () => {
    try {
      if (!publicKey) return;
      const bal = await connection.getBalance(publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return null;
  }

  return (
    <div className="dashboard" data-testid="dashboard-container">
      <div className="dashboard-header">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="p-2 hover:bg-[var(--dark-surface)] rounded-lg transition-colors"
              data-testid="back-to-home-btn"
            >
              <ArrowLeft className="h-6 w-6 text-[var(--gold-primary)]" />
            </button>
            <div className="flex items-center gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_ed48b7a2-6a38-4200-8e89-4581c421d9ea/artifacts/q9tyi3wm_erebus-icon.svg" 
                alt="Erebus" 
                className="h-10 w-10"
              />
              <img 
                src="https://customer-assets.emergentagent.com/job_ed48b7a2-6a38-4200-8e89-4581c421d9ea/artifacts/476tb5ea_erebus-text.svg" 
                alt="Erebus Protocol" 
                className="h-8"
              />
            </div>
          </div>
          <WalletMultiButton />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="mb-8 bg-[var(--dark-surface)] border-[var(--gold-accent)]" data-testid="balance-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--gold-primary)]">
              <Wallet className="h-5 w-5" />
              Wallet Balance
            </CardTitle>
            <CardDescription className="text-gray-400">
              {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white" data-testid="sol-balance">
              {loading ? '...' : balance.toFixed(4)} SOL
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-[var(--dark-surface)] border border-[var(--dark-border)] mb-6">
            <TabsTrigger 
              value="swap" 
              className="data-[state=active]:bg-[var(--gold-primary)] data-[state=active]:text-black"
              data-testid="tab-swap"
            >
              Swap
            </TabsTrigger>
            <TabsTrigger 
              value="transfer-sol" 
              className="data-[state=active]:bg-[var(--gold-primary)] data-[state=active]:text-black"
              data-testid="tab-transfer-sol"
            >
              Transfer SOL
            </TabsTrigger>
            <TabsTrigger 
              value="transfer-token" 
              className="data-[state=active]:bg-[var(--gold-primary)] data-[state=active]:text-black"
              data-testid="tab-transfer-token"
            >
              Transfer Token
            </TabsTrigger>
            <TabsTrigger 
              value="bridge" 
              className="data-[state=active]:bg-[var(--gold-primary)] data-[state=active]:text-black"
              data-testid="tab-bridge"
            >
              Bridge
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-[var(--gold-primary)] data-[state=active]:text-black"
              data-testid="tab-history"
            >
              <Activity className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="swap">
            <SwapComponent />
          </TabsContent>

          <TabsContent value="transfer-sol">
            <TransferSOL onSuccess={fetchBalance} />
          </TabsContent>

          <TabsContent value="transfer-token">
            <TransferToken />
          </TabsContent>

          <TabsContent value="bridge">
            <BridgeComponent />
          </TabsContent>

          <TabsContent value="history">
            <TransactionHistory />
          </TabsContent>
        </Tabs>
      </div>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: #0a0a0a;
        }

        .dashboard-header {
          background: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 215, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 40;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;