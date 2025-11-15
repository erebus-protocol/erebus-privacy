import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Network, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

const BridgeComponent = () => {
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
        <div className="space-y-6">
          {/* Wormhole Connect Iframe */}
          <div className="relative" style={{ height: '650px' }}>
            <iframe
              src="https://connect.wormhole.com"
              title="Wormhole Connect"
              className="w-full h-full rounded-lg border border-[var(--dark-border)]"
              allow="clipboard-write"
              data-testid="wormhole-iframe"
            />
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--dark-bg)] rounded-lg border border-[var(--dark-border)]">
              <p className="text-[var(--gold-primary)] font-semibold mb-2">Supported Chains</p>
              <p className="text-sm text-gray-400">Solana, Ethereum, Polygon, Avalanche, BSC, Arbitrum, Optimism, and more</p>
            </div>
            <div className="p-4 bg-[var(--dark-bg)] rounded-lg border border-[var(--dark-border)]">
              <p className="text-[var(--gold-primary)] font-semibold mb-2">Supported Tokens</p>
              <p className="text-sm text-gray-400">SOL, ETH, USDC, USDT, wETH, wBTC, and 100+ tokens</p>
            </div>
          </div>

          {/* Alternative Portal Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => window.open('https://www.portalbridge.com', '_blank')}
              variant="outline"
              className="border-[var(--gold-primary)] text-[var(--gold-primary)] hover:bg-[var(--gold-primary)] hover:text-black"
              data-testid="open-portal-btn"
            >
              Open Portal Bridge
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Info Note */}
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-xs text-blue-400">
              🌉 Wormhole Connect powered by Wormhole Foundation. Bridge assets securely across multiple chains with low fees and fast finality.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BridgeComponent;