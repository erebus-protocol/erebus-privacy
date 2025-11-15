import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TransferSOL = ({ onSuccess }) => {
  const { publicKey } = useWallet();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!toAddress || !amount) {
      toast.error('Please fill all fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/transfer/sol`, {
        from_address: publicKey.toBase58(),
        to_address: toAddress,
        amount: parseFloat(amount)
      });

      toast.success('SOL transferred privately!', {
        description: `Signature: ${response.data.signature.slice(0, 16)}...`
      });

      setToAddress('');
      setAmount('');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Transfer failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-[var(--dark-surface)] border-[var(--dark-border)]" data-testid="transfer-sol-card">
      <CardHeader>
        <CardTitle className="text-[var(--gold-primary)] flex items-center gap-2">
          <Send className="h-5 w-5" />
          Private SOL Transfer
        </CardTitle>
        <CardDescription className="text-gray-400">
          Transfer SOL anonymously through treasury system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-white">Recipient Address</Label>
          <Input
            type="text"
            placeholder="Enter Solana address"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="bg-[var(--dark-bg)] border-[var(--dark-border)] text-white"
            data-testid="recipient-address-input"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Amount (SOL)</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.001"
            className="bg-[var(--dark-bg)] border-[var(--dark-border)] text-white"
            data-testid="sol-amount-input"
          />
        </div>

        <Button
          onClick={handleTransfer}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-secondary)] text-black font-semibold hover:opacity-90"
          data-testid="transfer-sol-btn"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Transferring...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Private Transfer
            </>
          )}
        </Button>

        <div className="p-4 bg-[var(--dark-bg)] rounded-lg border border-[var(--dark-border)] space-y-2">
          <p className="text-xs text-gray-400">
            🔒 Privacy Flow:
          </p>
          <p className="text-xs text-gray-500">
            Your Address → Treasury Wallet → Recipient
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransferSOL;