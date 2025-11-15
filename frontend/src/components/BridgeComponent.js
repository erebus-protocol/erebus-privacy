import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Network } from 'lucide-react';
import WormholeConnect from '@wormhole-foundation/wormhole-connect';

const BridgeComponent = () => {
  const wormholeConfig = {
    network: 'Mainnet',
    chains: ['Solana', 'Ethereum', 'Polygon', 'Avalanche', 'Bsc'],
    ui: {
      title: 'Erebus Bridge',
      defaultInputs: {
        fromChain: 'Solana',
      },
    },
  };

  const wormholeTheme = {
    mode: 'dark',
    primary: '#FFD700', // Gold
    secondary: '#FFA500',
    background: '#0a0a0a',
    text: '#ffffff',
  };

  return (
    <Card className="bg-[var(--dark-surface)] border-[var(--dark-border)]" data-testid="bridge-card">
      <CardHeader>
        <CardTitle className="text-[var(--gold-primary)] flex items-center gap-2">
          <Network className="h-5 w-5" />
          Cross-Chain Bridge
        </CardTitle>
        <CardDescription className="text-gray-400">
          Bridge assets across chains using Wormhole Connect
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="wormhole-connect-container" data-testid="wormhole-widget">
          <WormholeConnect config={wormholeConfig} theme={wormholeTheme} />
        </div>

        <div className="mt-6 p-4 bg-[var(--dark-bg)] rounded-lg border border-[var(--dark-border)]">
          <p className="text-xs text-gray-400">
            🌉 Bridge tokens between Solana and other chains securely through Wormhole.
          </p>
        </div>
      </CardContent>

      <style jsx>{`
        .wormhole-connect-container {
          min-height: 500px;
          border-radius: 12px;
          overflow: hidden;
        }
        
        /* Override Wormhole Connect styles to match Erebus theme */
        :global(.wormhole-connect) {
          background: transparent !important;
        }
      `}</style>
    </Card>
  );
};

export default BridgeComponent;