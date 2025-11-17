import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Loader2, Send, Info, Shield, CheckCircle2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TransferSOL = ({ onSuccess }) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  
  // Privacy protocol states
  const [feeBreakdown, setFeeBreakdown] = useState(null);
  const [transferId, setTransferId] = useState(null);
  const [step, setStep] = useState(1); // 1: Input, 2: Payment, 3: Complete
  const [paymentSignature, setPaymentSignature] = useState(null);
  const [destinationSignature, setDestinationSignature] = useState(null);

  useEffect(() => {
    if (publicKey) {
      fetchBalance();
    }
  }, [publicKey]);

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

    return true;
  };

  const handlePrepareTransfer = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      // Step 1: Prepare transfer and get fee breakdown
      const response = await axios.post(`${API}/transfer/sol/prepare`, {
        from_address: publicKey.toBase58(),
        to_address: toAddress,
        amount: parseFloat(amount)
      });

      const data = response.data;
      setFeeBreakdown(data);
      setTransferId(data.transfer_id);

      // Check if user has enough balance to pay total
      if (data.total_to_pay > balance) {
        toast.error(`Insufficient balance. You need ${data.total_to_pay.toFixed(6)} SOL (including ${data.fee_amount.toFixed(6)} SOL privacy fee)`);
        return;
      }

      setStep(2);
      toast.success('Transfer prepared! Please review the fee breakdown.');

    } catch (error) {
      console.error('Prepare transfer error:', error);
      toast.error(error.response?.data?.detail || 'Failed to prepare transfer');
    } finally {
      setLoading(false);
    }
  };

  const handlePayToTreasury = async () => {
    setLoading(true);
    try {
      const treasuryPubkey = new PublicKey(feeBreakdown.treasury_address);
      const amountLamports = Math.floor(feeBreakdown.total_to_pay * LAMPORTS_PER_SOL);

      // Create transaction to pay treasury
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          lamports: amountLamports,
        })
      );

      // Send transaction
      const signature = await sendTransaction(transaction, connection);

      toast.success('Payment submitted to Treasury!', {
        description: 'Waiting for confirmation...'
      });

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error('Payment transaction failed');
      }

      setPaymentSignature(signature);
      toast.success('Payment confirmed! Executing transfer to destination...');

      // Step 2: Execute transfer from treasury to destination
      await executeTransferToDestination(signature);

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed');
      setLoading(false);
    }
  };

  const executeTransferToDestination = async (paymentSig) => {
    try {
      const response = await axios.post(`${API}/transfer/sol/execute`, {
        transfer_id: transferId,
        payment_signature: paymentSig,
        from_address: publicKey.toBase58()
      });

      const data = response.data;
      setDestinationSignature(data.destination_signature);
      setStep(3);

      toast.success('Private transfer completed!', {
        description: `${amount} SOL sent to destination`,
        action: {
          label: 'View',
          onClick: () => window.open(`https://solscan.io/tx/${data.destination_signature}`, '_blank')
        }
      });

      // Refresh balance
      await fetchBalance();

      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Execute transfer error:', error);
      toast.error(error.response?.data?.detail || 'Failed to execute transfer to destination');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setToAddress('');
    setAmount('');
    setFeeBreakdown(null);
    setTransferId(null);
    setStep(1);
    setPaymentSignature(null);
    setDestinationSignature(null);
  };

  return (
    <Card className="bg-[var(--dark-surface)] border-[var(--dark-border)]" data-testid="transfer-sol-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[var(--gold-primary)] flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Private Transfer SOL
            </CardTitle>
            <CardDescription className="text-gray-400">
              Zero-knowledge privacy protocol with 0.5% fee
            </CardDescription>
          </div>
          {balanceLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          ) : (
            <div className="text-right">
              <div className="text-xs text-gray-500">Balance</div>
              <div className="text-lg font-semibold text-white">{balance.toFixed(4)} SOL</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[var(--gold-primary)]' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step >= 1 ? 'border-[var(--gold-primary)] bg-[var(--gold-primary)]/20' : 'border-gray-600'
            }`}>
              {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : '1'}
            </div>
            <span className="text-sm font-medium">Input</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-700 mx-2" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[var(--gold-primary)]' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step >= 2 ? 'border-[var(--gold-primary)] bg-[var(--gold-primary)]/20' : 'border-gray-600'
            }`}>
              {step > 2 ? <CheckCircle2 className="h-5 w-5" /> : '2'}
            </div>
            <span className="text-sm font-medium">Pay</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-700 mx-2" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[var(--gold-primary)]' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step >= 3 ? 'border-[var(--gold-primary)] bg-[var(--gold-primary)]/20' : 'border-gray-600'
            }`}>
              {step >= 3 ? <CheckCircle2 className="h-5 w-5" /> : '3'}
            </div>
            <span className="text-sm font-medium">Done</span>
          </div>
        </div>

        {/* Step 1: Input Form */}
        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label className="text-white">Recipient Address</Label>
              <Input
                type="text"
                placeholder="Enter Solana address"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className="bg-[var(--dark-bg)] border-[var(--dark-border)] text-white font-mono text-sm"
                data-testid="sol-recipient-input"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-white">Amount (SOL)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAmount((balance * 0.99).toFixed(6))}
                  className="text-[var(--gold-primary)] hover:text-[var(--gold-secondary)] h-auto p-0 text-xs"
                  data-testid="max-sol-btn"
                >
                  MAX
                </Button>
              </div>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-[var(--dark-bg)] border-[var(--dark-border)] text-white text-lg"
                data-testid="sol-amount-input"
              />
            </div>

            <Button
              onClick={handlePrepareTransfer}
              disabled={loading || !amount || !toAddress}
              className="w-full bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-secondary)] text-black font-semibold hover:opacity-90 h-12"
              data-testid="prepare-transfer-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Continue
                </>
              )}
            </Button>
          </>
        )}

        {/* Step 2: Fee Breakdown & Payment */}
        {step === 2 && feeBreakdown && (
          <>
            <div className="bg-[#1a2332] rounded-lg p-4 space-y-3">
              <h3 className="text-[var(--gold-primary)] font-semibold flex items-center gap-2">
                <Info className="h-4 w-4" />
                Fee Breakdown
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Transfer Amount:</span>
                  <span className="text-white font-semibold">{feeBreakdown.amount} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Privacy Fee (0.5%):</span>
                  <span className="text-yellow-400 font-semibold">+{feeBreakdown.fee_amount.toFixed(6)} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Network Fee:</span>
                  <span className="text-gray-400">~{feeBreakdown.network_fee} SOL</span>
                </div>
                <div className="h-px bg-gray-700 my-2" />
                <div className="flex justify-between text-base">
                  <span className="text-white font-semibold">Total to Pay:</span>
                  <span className="text-[var(--gold-primary)] font-bold">{feeBreakdown.total_to_pay.toFixed(6)} SOL</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
              <p className="text-xs text-blue-400 flex items-start gap-2">
                <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  You will pay <span className="font-semibold">{feeBreakdown.total_to_pay.toFixed(6)} SOL</span> to Treasury wallet. 
                  After confirmation, <span className="font-semibold">{feeBreakdown.amount} SOL</span> will be automatically sent to the destination address.
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Back
              </Button>
              <Button
                onClick={handlePayToTreasury}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-secondary)] text-black font-semibold hover:opacity-90"
                data-testid="pay-treasury-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Pay to Treasury
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <>
            <div className="text-center space-y-4 py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--gold-primary)] mb-2">Transfer Complete!</h3>
                <p className="text-gray-400 text-sm">Your private transfer has been executed successfully</p>
              </div>
            </div>

            <div className="bg-[#1a2332] rounded-lg p-4 space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount Sent:</span>
                  <span className="text-white font-semibold">{amount} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">To Address:</span>
                  <span className="text-white font-mono text-xs">{toAddress.substring(0, 8)}...{toAddress.substring(toAddress.length - 8)}</span>
                </div>
                <div className="h-px bg-gray-700 my-2" />
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Payment TX:</span>
                    <a
                      href={`https://solscan.io/tx/${paymentSignature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--gold-primary)] hover:text-[var(--gold-secondary)] flex items-center gap-1 text-xs"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Destination TX:</span>
                    <a
                      href={`https://solscan.io/tx/${destinationSignature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--gold-primary)] hover:text-[var(--gold-secondary)] flex items-center gap-1 text-xs"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={resetForm}
              className="w-full bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-secondary)] text-black font-semibold hover:opacity-90"
              data-testid="new-transfer-btn"
            >
              New Transfer
            </Button>
          </>
        )}

        {/* Info Note */}
        {step === 1 && (
          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <p className="text-xs text-purple-400">
              🔒 Zero-knowledge privacy: Your transfer goes through our Treasury wallet, breaking the on-chain link between sender and receiver.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransferSOL;
