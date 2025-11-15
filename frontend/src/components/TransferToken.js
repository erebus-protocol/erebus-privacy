import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Loader2, Coins } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TransferToken = () => {
  const { publicKey } = useWallet();
  const [toAddress, setToAddress] = useState('');
  const [tokenMint, setTokenMint] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!toAddress || !tokenMint || !amount) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/transfer/token`, {
        from_address: publicKey.toBase58(),
        to_address: toAddress,
        token_mint: tokenMint,
        amount: parseFloat(amount),
        decimals: 9
      });

      toast.success('Token transfer initiated!', {
        description: response.data.note
      });

      setToAddress('');
      setTokenMint('');
      setAmount('');
    } catch (error) {
      toast.error('Transfer failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-[var(--dark-surface)] border-[var(--dark-border)]" data-testid="transfer-token-card">
      <CardHeader>
        <CardTitle className="text-[var(--gold-primary)] flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Private Token Transfer
        </CardTitle>
        <CardDescription className="text-gray-400">
          Transfer SPL tokens anonymously
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-white">Token Mint Address</Label>
          <Input
            type="text"
            placeholder="Enter SPL token mint address"
            value={tokenMint}
            onChange={(e) => setTokenMint(e.target.value)}
            className="bg-[var(--dark-bg)] border-[var(--dark-border)] text-white"
            data-testid="token-mint-input"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Recipient Address</Label>
          <Input
            type="text"
            placeholder="Enter Solana address"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="bg-[var(--dark-bg)] border-[var(--dark-border)] text-white"
            data-testid="token-recipient-input"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Amount</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-[var(--dark-bg)] border-[var(--dark-border)] text-white"
            data-testid="token-amount-input"
          />
        </div>

        <Button
          onClick={handleTransfer}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-secondary)] text-black font-semibold hover:opacity-90"
          data-testid="transfer-token-btn"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Transferring...
            </>
          ) : (
            <>
              <Coins className="mr-2 h-4 w-4" />
              Send Token Transfer
            </>
          )}
        </Button>

        <div className="p-4 bg-[var(--dark-bg)] rounded-lg border border-[var(--dark-border)]">
          <p className="text-xs text-gray-400">
            💡 Popular tokens: USDC (EPjFWdd...), USDT (Es9vMFrz...)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransferToken;