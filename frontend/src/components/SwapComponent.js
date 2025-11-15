import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ArrowDownUp, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import TokenSearchModal from './TokenSearchModal';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DEFAULT_TOKENS = {
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    address: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  }
};

const SwapComponent = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  
  const [fromToken, setFromToken] = useState(DEFAULT_TOKENS.USDC);
  const [toToken, setToToken] = useState(DEFAULT_TOKENS.SOL);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [fromBalance, setFromBalance] = useState(0);
  const [toBalance, setToBalance] = useState(0);
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalances();
    }
  }, [connected, publicKey, fromToken, toToken]);

  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      const timer = setTimeout(() => {
        getQuote();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken]);

  const fetchBalances = async () => {
    try {
      // Fetch FROM token balance
      if (fromToken.symbol === 'SOL') {
        const bal = await connection.getBalance(publicKey);
        setFromBalance(bal / LAMPORTS_PER_SOL);
      } else {
        const response = await axios.get(`${API}/token-balance/${publicKey.toBase58()}/${fromToken.address}`);
        setFromBalance(response.data.balance || 0);
      }
      
      // Fetch TO token balance
      if (toToken.symbol === 'SOL') {
        const bal = await connection.getBalance(publicKey);
        setToBalance(bal / LAMPORTS_PER_SOL);
      } else {
        const response = await axios.get(`${API}/token-balance/${publicKey.toBase58()}/${toToken.address}`);
        setToBalance(response.data.balance || 0);
      }
    } catch (error) {
      console.error('Balance fetch error:', error);
    }
  };

  const getQuote = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;

    setQuoting(true);
    try {
      const amount = parseFloat(fromAmount) * Math.pow(10, fromToken.decimals);
      const response = await axios.post(`${API}/swap/quote`, {
        input_mint: fromToken.address,
        output_mint: toToken.address,
        amount: Math.floor(amount),
        slippage_bps: 50
      });

      if (response.data && response.data.outAmount) {
        const outAmount = response.data.outAmount / Math.pow(10, toToken.decimals);
        setToAmount(outAmount.toFixed(6));
      }
    } catch (error) {
      console.error('Quote error:', error);
    } finally {
      setQuoting(false);
    }
  };

  const handleSwap = async () => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Please enter valid amount');
      return;
    }

    setLoading(true);
    try {
      toast.info('Swap feature coming soon!');
    } catch (error) {
      toast.error('Swap failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const switchTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    const tempBalance = fromBalance;
    
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    setFromBalance(toBalance);
    setToBalance(tempBalance);
  };

  return (
    <>
      <Card className="bg-[var(--dark-surface)] border-[var(--dark-border)] max-w-md mx-auto" data-testid="swap-card">
        <CardContent className="p-6 space-y-4">
          {/* Selling Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Selling</span>
              {connected && (
                <span className="text-xs text-gray-500">
                  Balance: {fromBalance.toFixed(4)} {fromToken.symbol}
                </span>
              )}
            </div>
            
            <div className="bg-[#1a2332] rounded-2xl p-4 space-y-3">
              <button
                onClick={() => setShowFromModal(true)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                data-testid="select-from-token-btn"
              >
                <img src={fromToken.logoURI} alt={fromToken.symbol} className="w-6 h-6 rounded-full" />
                <span className="text-white font-semibold text-lg">{fromToken.symbol}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              
              <Input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="bg-transparent border-none text-3xl font-semibold text-white p-0 h-auto focus-visible:ring-0"
                data-testid="from-amount-input"
              />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">$0</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFromAmount(fromBalance.toString())}
                  className="text-[var(--gold-primary)] hover:text-[var(--gold-secondary)] h-auto p-0 text-xs"
                  data-testid="max-btn"
                >
                  MAX
                </Button>
              </div>
            </div>
          </div>

          {/* Switch Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={switchTokens}
              className="rounded-full bg-[var(--dark-bg)] hover:bg-[var(--gold-primary)] hover:text-black border border-[var(--dark-border)] transition-all"
              data-testid="switch-tokens-btn"
            >
              <ArrowDownUp className="h-5 w-5" />
            </Button>
          </div>

          {/* Buying Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Buying</span>
              {connected && (
                <span className="text-xs text-gray-500">
                  Balance: {toBalance.toFixed(4)} {toToken.symbol}
                </span>
              )}
            </div>
            
            <div className="bg-[#1a2332] rounded-2xl p-4 space-y-3">
              <button
                onClick={() => setShowToModal(true)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                data-testid="select-to-token-btn"
              >
                <img src={toToken.logoURI} alt={toToken.symbol} className="w-6 h-6 rounded-full" />
                <span className="text-white font-semibold text-lg">{toToken.symbol}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              
              <div className="text-3xl font-semibold text-white">
                {quoting ? (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                ) : (
                  toAmount || '0.00'
                )}
              </div>
              
              <span className="text-sm text-gray-500">$0</span>
            </div>
          </div>

          {/* Connect/Swap Button */}
          {!connected ? (
            <Button
              disabled
              className="w-full bg-[#c7f284] hover:bg-[#b8e375] text-black font-semibold h-14 text-lg rounded-2xl"
              data-testid="connect-wallet-prompt"
            >
              Connect Wallet to Swap
            </Button>
          ) : (
            <Button
              onClick={handleSwap}
              disabled={loading || !fromAmount || parseFloat(fromAmount) <= 0}
              className="w-full bg-[#c7f284] hover:bg-[#b8e375] text-black font-semibold h-14 text-lg rounded-2xl disabled:opacity-50"
              data-testid="execute-swap-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Swapping...
                </>
              ) : (
                'Swap'
              )}
            </Button>
          )}

          {/* Privacy Note */}
          <div className="text-center text-xs text-gray-500">
            🔒 Private swap powered by Jupiter & Erebus Protocol
          </div>
        </CardContent>
      </Card>

      {/* Token Search Modals */}
      <TokenSearchModal
        isOpen={showFromModal}
        onClose={() => setShowFromModal(false)}
        onSelectToken={setFromToken}
        currentToken={fromToken}
      />
      <TokenSearchModal
        isOpen={showToModal}
        onClose={() => setShowToModal(false)}
        onSelectToken={setToToken}
        currentToken={toToken}
      />
    </>
  );
};

export default SwapComponent;