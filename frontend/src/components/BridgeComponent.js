import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Network, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

const BridgeComponent = () => {
  const openWormholeBridge = () => {
    window.open('https://www.portalbridge.com/#/transfer', '_blank');
  };

  return (
    <Card className="bg-[var(--dark-surface)] border-[var(--dark-border)]" data-testid="bridge-card">
      <CardHeader>
        <CardTitle className="text-[var(--gold-primary)] flex items-center gap-2">
          <Network className="h-5 w-5" />
          Cross-Chain Bridge
        </CardTitle>
        <CardDescription className="text-gray-400">
          Bridge assets across chains using Wormhole Portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-[500px] space-y-8" data-testid="wormhole-widget">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--gold-primary)] blur-3xl opacity-20"></div>
              <Network className="relative h-32 w-32 mx-auto text-[var(--gold-primary)]" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Wormhole Bridge Integration</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Bridge tokens between Solana and other EVM chains securely through Wormhole Portal
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm">
              <div className="p-4 bg-[var(--dark-bg)] rounded-lg border border-[var(--dark-border)]">
                <p className="text-[var(--gold-primary)] font-semibold mb-1">Supported Chains</p>
                <p className="text-gray-500">Ethereum, BSC, Polygon, Avalanche, and more</p>
              </div>
              <div className="p-4 bg-[var(--dark-bg)] rounded-lg border border-[var(--dark-border)]">
                <p className="text-[var(--gold-primary)] font-semibold mb-1">Supported Tokens</p>
                <p className="text-gray-500">SOL, ETH, USDC, USDT, and more</p>
              </div>
            </div>

            <Button
              onClick={openWormholeBridge}
              className="bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-secondary)] text-black font-semibold hover:opacity-90"
              size="lg"
              data-testid="open-wormhole-btn"
            >
              Open Wormhole Portal
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[var(--dark-bg)] rounded-lg border border-[var(--dark-border)]">
          <p className="text-xs text-gray-400">
            🌉 Bridge tokens between Solana and other chains privately through Wormhole's trusted infrastructure.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BridgeComponent;