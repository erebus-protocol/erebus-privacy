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

  useEffect(() => {
    if (isOpen) {
      fetchTokens();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = tokens.filter(token =>
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTokens(filtered);
    } else {
      setFilteredTokens(tokens);
    }
  }, [searchQuery, tokens]);

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
              <div className="text-center py-12 text-gray-500">No tokens found</div>
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
                      </div>
                      <div className="text-sm text-gray-500">{token.name}</div>
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
