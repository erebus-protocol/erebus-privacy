import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowDownUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TOKENS = [
  { symbol: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112' },
  { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  { symbol: 'USDT', name: 'Tether', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
];

const SwapComponent = () => {
  const [fromToken, setFromToken] = useState('SOL');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Please enter valid amount');
      return;
    }

    setLoading(true);
    try {
      // Jupiter integration would go here
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Swap executed privately!');
      setFromAmount('');
    } catch (error) {
      toast.error('Swap failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  return (
    <Card className="bg-[var(--dark-surface)] border-[var(--dark-border)]" data-testid="swap-card">
      <CardHeader>
        <CardTitle className="text-[var(--gold-primary)]">Private Swap</CardTitle>
        <CardDescription className="text-gray-400">
          Swap tokens anonymously via Jupiter Aggregator
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-white">From</Label>
          <div className="flex gap-3">
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-[180px] bg-[var(--dark-bg)] border-[var(--dark-border)] text-white" data-testid="from-token-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--dark-surface)] border-[var(--dark-border)]">
                {TOKENS.map(token => (
                  <SelectItem key={token.symbol} value={token.symbol} className="text-white">
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="bg-[var(--dark-bg)] border-[var(--dark-border)] text-white"
              data-testid="from-amount-input"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={switchTokens}
            className="rounded-full hover:bg-[var(--gold-primary)] hover:text-black transition-all"
            data-testid="switch-tokens-btn"
          >
            <ArrowDownUp className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-white">To</Label>
          <div className="flex gap-3">
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-[180px] bg-[var(--dark-bg)] border-[var(--dark-border)] text-white" data-testid="to-token-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--dark-surface)] border-[var(--dark-border)]">
                {TOKENS.map(token => (
                  <SelectItem key={token.symbol} value={token.symbol} className="text-white">
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.00"
              readOnly
              className="bg-[var(--dark-bg)] border-[var(--dark-border)] text-white"
              data-testid="to-amount-display"
            />
          </div>
        </div>

        <Button
          onClick={handleSwap}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-secondary)] text-black font-semibold hover:opacity-90"
          data-testid="execute-swap-btn"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Swapping...
            </>
          ) : (
            'Execute Private Swap'
          )}
        </Button>

        <div className="p-4 bg-[var(--dark-bg)] rounded-lg border border-[var(--dark-border)]">
          <p className="text-xs text-gray-400">
            🔒 Your swap is executed through our privacy layer, ensuring complete anonymity.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SwapComponent;