import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Loader2, Send, Info } from 'lucide-react';
import { toast } from 'sonner';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

const TransferSOL = ({ onSuccess }) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [estimatedFee, setEstimatedFee] = useState(0.000005); // Default 5000 lamports
  const [balanceLoading, setBalanceLoading] = useState(true);

  useEffect(() => {
    if (publicKey) {
      fetchBalance();
    }
  }, [publicKey]);

  useEffect(() => {
    if (toAddress && amount) {
      estimateFee();
    }
  }, [toAddress, amount]);

  const fetchBalance = async () => {
    try {
      setBalanceLoading(true);
      const bal = await connection.getBalance(publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setBalanceLoading(false);
    }
  };

  const estimateFee = async () => {
    try {
      if (!toAddress || !amount) return;
      
      // Validate recipient address
      try {
        new PublicKey(toAddress);
      } catch {
        return;
      }

      // Get recent blockhash for fee estimation
      const { feeCalculator } = await connection.getRecentBlockhashAndContext();
      
      // Estimate fee (usually 5000 lamports for simple transfer)
      const estimatedFeeInLamports = 5000;
      setEstimatedFee(estimatedFeeInLamports / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error estimating fee:', error);
      setEstimatedFee(0.000005); // Default fallback
    }
  };

  const validateInputs = () => {
    if (!toAddress) {
      toast.error('Please enter recipient address');
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter valid amount');
      return false;
    }

    // Validate address format
    try {
      new PublicKey(toAddress);
    } catch {
      toast.error('Invalid Solana address');
      return false;
    }

    // Check sufficient balance
    const totalNeeded = parseFloat(amount) + estimatedFee;
    if (totalNeeded > balance) {
      toast.error(`Insufficient balance. Need ${totalNeeded.toFixed(6)} SOL (including fees)`);
      return false;
    }

    return true;
  };

  const handleTransfer = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const recipientPubkey = new PublicKey(toAddress);
      const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);

      // Create transfer instruction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: lamports,
        })
      );

      // Send transaction
      const signature = await sendTransaction(transaction, connection);

      toast.success('Transfer submitted!', {
        description: 'Waiting for confirmation...'
      });

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      toast.success('SOL transferred successfully!', {
        description: `Signature: ${signature.slice(0, 16)}...`,
        action: {
          label: 'View',
          onClick: () => window.open(`https://solscan.io/tx/${signature}`, '_blank')
        }
      });

      // Reset form
      setToAddress('');
      setAmount('');
      
      // Refresh balance
      await fetchBalance();
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Transfer failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalCost = amount ? (parseFloat(amount) + estimatedFee).toFixed(6) : '0.00';
  const remainingBalance = amount ? (balance - parseFloat(amount) - estimatedFee).toFixed(6) : balance.toFixed(6);

  return (
    <Card className="bg-[var(--dark-surface)] border-[var(--dark-border)]" data-testid="transfer-sol-card">
      <CardHeader>
        <CardTitle className="text-[var(--gold-primary)] flex items-center gap-2">
          <Send className="h-5 w-5" />
          Transfer SOL
        </CardTitle>
        <CardDescription className="text-gray-400">
          Send SOL directly from your wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="p-4 bg-[#1a2332] rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Available Balance</span>
            {balanceLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <span className="text-lg font-semibold text-white" data-testid="available-balance">
                {balance.toFixed(6)} SOL
              </span>
            )}
          </div>
        </div>

        {/* Recipient Address */}
        <div className="space-y-2">
          <Label className="text-white">Recipient Address</Label>
          <Input
            type="text"
            placeholder="Enter Solana address"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="bg-[var(--dark-bg)] border-[var(--dark-border)] text-white font-mono text-sm"
            data-testid="recipient-address-input"
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-white">Amount (SOL)</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAmount((balance - estimatedFee - 0.001).toFixed(6))}
              className="text-[var(--gold-primary)] hover:text-[var(--gold-secondary)] h-auto p-0 text-xs"
              data-testid="max-amount-btn"
            >
              MAX
            </Button>
          </div>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.001"
            className="bg-[var(--dark-bg)] border-[var(--dark-border)] text-white text-lg"
            data-testid="sol-amount-input"
          />
        </div>

        {/* Fee Estimation */}
        {amount && parseFloat(amount) > 0 && (
          <div className="p-4 bg-[var(--dark-bg)] rounded-lg border border-[var(--dark-border)] space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-[var(--gold-primary)]" />
              <span className="text-sm font-semibold text-white">Transaction Summary</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="text-white" data-testid="summary-amount">{parseFloat(amount).toFixed(6)} SOL</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Network Fee (estimated)</span>
                <span className="text-white" data-testid="summary-fee">{estimatedFee.toFixed(6)} SOL</span>
              </div>
              
              <div className="border-t border-[var(--dark-border)] pt-2 mt-2"></div>
              
              <div className="flex justify-between font-semibold">
                <span className="text-white">Total Cost</span>
                <span className="text-[var(--gold-primary)]" data-testid="summary-total">{totalCost} SOL</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Remaining Balance</span>
                <span className={remainingBalance < 0 ? "text-red-400" : "text-gray-300"} data-testid="summary-remaining">
                  {remainingBalance} SOL
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Button */}
        <Button
          onClick={handleTransfer}
          disabled={loading || !amount || parseFloat(amount) <= 0}
          className="w-full bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-secondary)] text-black font-semibold hover:opacity-90 h-12"
          data-testid="transfer-sol-btn"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Transferring...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Transfer SOL
            </>
          )}
        </Button>

        {/* Info Note */}
        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-xs text-blue-400">
            💡 Transaction executed directly from your wallet. Fees are estimated and may vary.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransferSOL;