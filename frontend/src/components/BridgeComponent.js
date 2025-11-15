import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Network } from 'lucide-react';

const BridgeComponent = () => {
  const wormholeRef = useRef(null);

  useEffect(() => {
    if (wormholeRef.current && !wormholeRef.current.hasChildNodes()) {
      const script = document.createElement('script');
      script.src = 'https://www.unpkg.com/@wormhole-foundation/wormhole-connect@0.3.3/dist/main.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (window.WormholeConnect && wormholeRef.current) {
          window.WormholeConnect.default({
            target: wormholeRef.current,
            config: {
              env: 'mainnet',
              networks: ['solana', 'ethereum', 'polygon', 'avalanche', 'bsc'],
              tokens: ['SOL', 'ETH', 'USDC', 'USDT'],
              mode: 'dark',
              customTheme: {
                primary: '#FFD700',
                secondary: '#FFA500',
                background: '#1a1a1a',
                text: '#ffffff'
              }
            }
          });
        }
      };

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, []);

  return (
    <Card className="bg-[var(--dark-surface)] border-[var(--dark-border)]" data-testid="bridge-card">
      <CardHeader>
        <CardTitle className="text-[var(--gold-primary)] flex items-center gap-2">
          <Bridge className="h-5 w-5" />
          Cross-Chain Bridge
        </CardTitle>
        <CardDescription className="text-gray-400">
          Bridge assets across chains using Wormhole
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          ref={wormholeRef} 
          id="wormhole-connect" 
          className="min-h-[500px] rounded-lg"
          data-testid="wormhole-widget"
        >
          <div className="flex items-center justify-center h-[500px]">
            <div className="text-center space-y-4">
              <Bridge className="h-16 w-16 mx-auto text-[var(--gold-primary)] animate-pulse" />
              <p className="text-gray-400">Loading Wormhole Bridge...</p>
              <p className="text-xs text-gray-500">If the widget doesn't load, please refresh the page</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[var(--dark-bg)] rounded-lg border border-[var(--dark-border)]">
          <p className="text-xs text-gray-400">
            🌉 Bridge tokens between Solana and other chains privately.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BridgeComponent;