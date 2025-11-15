import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Search, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TokenSearchModal = ({ isOpen, onClose, onSelectToken, currentToken }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tokens, setTokens] = useState([]);
  const [filteredTokens, setFilteredTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/token-list`);
      setTokens(response.data || []);
      setFilteredTokens(response.data || []);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchTokenByAddress = async (address) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/token-info/${address}`);
      if (response.data) {
        // Show the found token at the top
        setFilteredTokens([response.data]);
      }
    } catch (error) {
      console.error('Error searching token by address:', error);
      // Show "not found" message
      setFilteredTokens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTokens();
    }
  }, [isOpen]);

  useEffect(() => {
    const searchTokens = async () => {
      if (searchQuery) {
        // Check if it looks like a Solana address (32-44 characters, base58)
        const trimmedQuery = searchQuery.trim();
        const isAddress = trimmedQuery.length >= 32 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmedQuery);
        
        if (isAddress && trimmedQuery.length >= 32) {
          // Search by contract address
          await searchTokenByAddress(trimmedQuery);
        } else {
          // Regular search by symbol/name/address
          const filtered = tokens.filter(token =>
            token.symbol.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
            token.name.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
            token.address.toLowerCase().includes(trimmedQuery.toLowerCase())
          );
          setFilteredTokens(filtered);
        }
      } else {
        setFilteredTokens(tokens);
      }
    };

    // Debounce search
    const timer = setTimeout(searchTokens, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, tokens]);

  const handleSelectToken = (token) => {
    onSelectToken(token);
    onClose();
    setSearchQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--dark-surface)] border-[var(--gold-accent)] max-w-md" data-testid="token-search-modal">
        <DialogHeader>
          <DialogTitle className="text-[var(--gold-primary)]">Select Token</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name, symbol or address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[var(--dark-bg)] border-[var(--dark-border)] text-white"
              data-testid="token-search-input"
            />
          </div>

          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--gold-primary)]" />
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-2">
                  {searchQuery ? 'No tokens found' : 'Start typing to search'}
                </div>
                {searchQuery && searchQuery.length >= 32 && (
                  <div className="text-xs text-gray-600 mt-2">
                    Searched for: {searchQuery.slice(0, 8)}...{searchQuery.slice(-8)}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredTokens.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => handleSelectToken(token)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[var(--dark-bg)] rounded-lg transition-colors text-left"
                    data-testid={`token-item-${token.symbol}`}
                  >
                    <img
                      src={token.logoURI || 'https://via.placeholder.com/32'}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/32';
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{token.symbol}</span>
                        {token.tags && token.tags.includes('verified') && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                            Verified
                          </span>
                        )}
                        {token.tags && token.tags.includes('custom') && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{token.name}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{token.address.slice(0, 8)}...{token.address.slice(-8)}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenSearchModal;
