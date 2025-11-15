import { useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import '@solana/wallet-adapter-react-ui/styles.css';
import '@/App.css';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import DocsPage from './pages/DocsPage';
import { Toaster } from './components/ui/sonner';

const RPC_URL = 'https://rpc.ankr.com/solana/99ff114abbcb6a8388649bcbf14069aff2c679e5326d6a9e0a34871de3b00023';

function App() {
  const network = WalletAdapterNetwork.Mainnet;
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="App">
            <Toaster position="top-right" richColors />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/docs" element={<DocsPage />} />
              </Routes>
            </BrowserRouter>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;