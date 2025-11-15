import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Wallet } from 'lucide-react';
import Sidebar from '../components/Sidebar';
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

  useEffect(() => {
    // Listen for sidebar navigation events
    const handleSidebarNavigate = (e) => {
      setActiveTab(e.detail);
    };

    window.addEventListener('sidebar-navigate', handleSidebarNavigate);
    return () => window.removeEventListener('sidebar-navigate', handleSidebarNavigate);
  }, []);

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

  const renderContent = () => {
    switch (activeTab) {
      case 'swap':
        return <SwapComponent />;
      case 'transfer-sol':
        return <TransferSOL onSuccess={fetchBalance} />;
      case 'transfer-token':
        return <TransferToken />;
      case 'bridge':
        return <BridgeComponent />;
      case 'history':
        return <TransactionHistory />;
      default:
        return <SwapComponent />;
    }
  };

  return (
    <div className="dashboard flex h-screen overflow-hidden" data-testid="dashboard-container">
      {/* Sidebar */}
      <Sidebar 
        balance={balance} 
        loading={loading} 
        walletAddress={publicKey?.toBase58()} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="dashboard-header">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-sm text-gray-400">Erebus Protocol - ZK Privacy System</p>
              </div>
            </div>
            <WalletMultiButton />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Active Tab Content */}
            <div className="animate-fade-in">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          background: #0a0a0a;
        }

        .dashboard-header {
          background: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 215, 0, 0.1);
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;