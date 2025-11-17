import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Loader2, Coins, RefreshCw, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import axios from 'axios';
import { ScrollArea } from './ui/scroll-area';
import { getTokenMetadata } from '../utils/tokenMetadata';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TransferToken = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletTokens, setWalletTokens] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [selectedToken, setSelectedToken] = useState(null);
  const [showTokenList, setShowTokenList] = useState(false);

  useEffect(() => {
    if (publicKey) {
      fetchWalletTokens();
    }
  }, [publicKey]);

  const fetchWalletTokens = async () => {
    if (!publicKey || !connection) return;
    
    try {
      setLoadingTokens(true);
      
      // Fetch all SPL token accounts for this wallet
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      // Parse and format token data
      const tokens = [];
      
      for (const account of tokenAccounts.value) {
        const parsedInfo = account.account.data.parsed.info;
        const mintAddress = parsedInfo.mint;
        const tokenAmount = parsedInfo.tokenAmount;
        
        // Only include tokens with balance > 0
        if (parseFloat(tokenAmount.uiAmount) > 0) {
          // Get token metadata using new utility with fallback
          const tokenInfo = await getTokenMetadata(mintAddress);
          
          tokens.push({
            address: mintAddress,
            symbol: tokenInfo.symbol || 'Unknown',
            name: tokenInfo.name || 'Unknown Token',
            decimals: tokenAmount.decimals,
            balance: parseFloat(tokenAmount.uiAmount),
            logoURI: tokenInfo.logoURI || null, // Fixed: use logoURI consistently
            tags: tokenInfo.tags || [],
            source: tokenInfo.source
          });
        }
      }

      setWalletTokens(tokens);
      
      if (tokens.length > 0) {
        setSelectedToken(tokens[0]);
      } else {
        toast.info('No tokens found in wallet');
      }
    } catch (error) {
      console.error('Error fetching wallet tokens:', error);
      toast.error('Failed to load tokens from wallet');
    } finally {
      setLoadingTokens(false);
    }
  };

  const getTokenInfo = async (mintAddress) => {
    // Check cache first
    if (tokenMetadataCache[mintAddress]) {
      return tokenMetadataCache[mintAddress];
    }

    try {
      // Strategy 1: Try backend API first (fastest for known tokens)
      try {
        const response = await axios.get(`${API}/token/info/${mintAddress}`, { timeout: 3000 });
        if (response.data && response.data.symbol) {
          const tokenData = {
            symbol: response.data.symbol,
            name: response.data.name || response.data.symbol,
            logo: response.data.logoURI || null
          };
          tokenMetadataCache[mintAddress] = tokenData;
          return tokenData;
        }
      } catch (backendError) {
        console.log(`Backend token info not found for ${mintAddress}, trying external APIs`);
      }

      // Strategy 2: Try Jupiter Token List API (comprehensive)
      try {
        const jupiterResponse = await fetch('https://token.jup.ag/all');
        const jupiterTokens = await jupiterResponse.json();
        
        const tokenInfo = jupiterTokens.find(t => t.address === mintAddress);
        if (tokenInfo) {
          const tokenData = {
            symbol: tokenInfo.symbol,
            name: tokenInfo.name,
            logo: tokenInfo.logoURI || null
          };
          tokenMetadataCache[mintAddress] = tokenData;
          return tokenData;
        }
      } catch (jupiterError) {
        console.log(`Jupiter API error: ${jupiterError.message}`);
      }

      // Strategy 3: Try Solana Token Registry (official list)
      try {
        const registryResponse = await fetch(
          'https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json',
          { cache: 'force-cache' }
        );
        const registryData = await registryResponse.json();
        
        const tokenInfo = registryData.tokens.find(t => t.address === mintAddress);
        if (tokenInfo) {
          const tokenData = {
            symbol: tokenInfo.symbol,
            name: tokenInfo.name,
            logo: tokenInfo.logoURI || null
          };
          tokenMetadataCache[mintAddress] = tokenData;
          return tokenData;
        }
      } catch (registryError) {
        console.log(`Token registry error: ${registryError.message}`);
      }


    } catch (error) {
      console.error(`Error fetching token info for ${mintAddress}:`, error);
    }
    
    // Fallback: Use shortened address as symbol
    const fallbackData = {
      symbol: mintAddress.substring(0, 4) + '...' + mintAddress.substring(mintAddress.length - 4),
      name: 'Unknown Token',
      logo: null
    };
    tokenMetadataCache[mintAddress] = fallbackData;
    return fallbackData;
  };

  const handleTransfer = async () => {
    if (!selectedToken) {
      toast.error('Please select a token');
      return;
    }

    if (!toAddress) {
      toast.error('Please enter recipient address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter valid amount');
      return;
    }

    // Validate recipient address
    try {
      new PublicKey(toAddress);
    } catch {
      toast.error('Invalid recipient address');
      return;
    }

    // Check sufficient balance
    if (parseFloat(amount) > selectedToken.balance) {
      toast.error(`Insufficient balance. You have ${selectedToken.balance} ${selectedToken.symbol}`);
      return;
    }

    setLoading(true);
    try {
      const mintPubkey = new PublicKey(selectedToken.address);
      const recipientPubkey = new PublicKey(toAddress);
      
      // Get associated token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(mintPubkey, publicKey);
      const toTokenAccount = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

      // Convert amount to raw units
      const transferAmount = Math.floor(parseFloat(amount) * Math.pow(10, selectedToken.decimals));

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        publicKey,
        transferAmount
      );

      const transaction = new Transaction().add(transferInstruction);

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

      toast.success(`${selectedToken.symbol} transferred successfully!`, {
        description: `Signature: ${signature.slice(0, 16)}...`,
        action: {
          label: 'View',
          onClick: () => window.open(`https://solscan.io/tx/${signature}`, '_blank')
        }
      });

      // Reset form and refresh
      setToAddress('');
      setAmount('');
      await fetchWalletTokens();

    } catch (error) {
      console.error('Transfer error:', error);
      
      if (error.message.includes('0x1')) {
        toast.error('Recipient does not have a token account. They need to create one first.');
      } else {
        toast.error('Transfer failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-[var(--dark-surface)] border-[var(--dark-border)]" data-testid="transfer-token-card">
      <CardHeader>
        <CardTitle className="text-[var(--gold-primary)] flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Transfer Token
        </CardTitle>
        <CardDescription className="text-gray-400">
          Send SPL tokens from your wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Token Selection */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-white">Select Token</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchWalletTokens}
              disabled={loadingTokens}
              className="text-[var(--gold-primary)] hover:text-[var(--gold-secondary)] h-auto p-0"
            >
              <RefreshCw className={`h-4 w-4 ${loadingTokens ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {loadingTokens ? (
            <div className="flex items-center justify-center p-8 bg-[#1a2332] rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--gold-primary)]" />
              <span className="ml-2 text-gray-400">Loading your tokens...</span>
            </div>
          ) : walletTokens.length === 0 ? (
            <div className="text-center p-8 bg-[#1a2332] rounded-lg">
              <Coins className="h-12 w-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400">No tokens found in your wallet</p>
              <p className="text-xs text-gray-500 mt-2">Make sure you have SPL tokens with balance</p>
            </div>
          ) : (
            <>
              {/* Selected Token Display */}
              <button
                onClick={() => setShowTokenList(!showTokenList)}
                className="w-full p-4 bg-[#1a2332] rounded-lg flex items-center justify-between hover:bg-[#1f2937] transition-colors"
                data-testid="token-selector-btn"
              >
                {selectedToken ? (
                  <div className="flex items-center gap-3">
                    <img src={selectedToken.logoURI} alt={selectedToken.symbol} className="w-10 h-10 rounded-full" />
                    <div className="text-left">
                      <div className="font-semibold text-white">{selectedToken.symbol}</div>
                      <div className="text-sm text-gray-400">Balance: {selectedToken.balance.toFixed(6)}</div>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400">Select a token</span>
                )}
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showTokenList ? 'rotate-180' : ''}`} />
              </button>

              {/* Token List Dropdown */}
              {showTokenList && (
                <ScrollArea className="h-[200px] border border-[var(--dark-border)] rounded-lg bg-[var(--dark-bg)]">
                  <div className="p-2">
                    {walletTokens.map((token) => (
                      <button
                        key={token.address}
                        onClick={() => {
                          setSelectedToken(token);
                          setShowTokenList(false);
                        }}
                        className="w-full p-3 flex items-center gap-3 hover:bg-[#1a2332] rounded-lg transition-colors"
                        data-testid={`token-option-${token.symbol}`}
                      >
                        <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full" />
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{token.symbol}</span>
                            {token.tags && token.tags.includes('verified') && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Verified</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">{token.name}</div>
                          <div className="text-xs text-gray-500">Balance: {token.balance.toFixed(6)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </>
          )}
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
            data-testid="token-recipient-input"
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-white">Amount</Label>
            {selectedToken && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAmount(selectedToken.balance.toString())}
                className="text-[var(--gold-primary)] hover:text-[var(--gold-secondary)] h-auto p-0 text-xs"
                data-testid="max-token-btn"
              >
                MAX
              </Button>
            )}
          </div>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-[var(--dark-bg)] border-[var(--dark-border)] text-white text-lg"
            data-testid="token-amount-input"
          />
          {selectedToken && amount && (
            <p className="text-xs text-gray-400">
              {parseFloat(amount) > selectedToken.balance ? (
                <span className="text-red-400">Insufficient balance</span>
              ) : (
                <span>Remaining: {(selectedToken.balance - parseFloat(amount)).toFixed(6)} {selectedToken.symbol}</span>
              )}
            </p>
          )}
        </div>

        {/* Transfer Button */}
        <Button
          onClick={handleTransfer}
          disabled={loading || !selectedToken || !amount || parseFloat(amount) <= 0}
          className="w-full bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-secondary)] text-black font-semibold hover:opacity-90 h-12"
          data-testid="transfer-token-btn"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Transferring...
            </>
          ) : (
            <>
              <Coins className="mr-2 h-5 w-5" />
              Transfer Token
            </>
          )}
        </Button>

        {/* Info Note */}
        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-xs text-blue-400">
            💡 Only tokens with balance in your wallet are shown. Network fees will be deducted from your SOL balance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransferToken;