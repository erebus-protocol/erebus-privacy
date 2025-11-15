import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ExternalLink, Clock, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TransactionHistory = () => {
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (publicKey) {
      fetchTransactions();
    }
  }, [publicKey]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/transactions/${publicKey.toBase58()}`);
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'swap': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'transfer_sol': return 'bg-[var(--gold-primary)]/20 text-[var(--gold-primary)] border-[var(--gold-primary)]/50';
      case 'transfer_token': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'bridge': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <Card className="bg-[var(--dark-surface)] border-[var(--dark-border)]">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--gold-primary)]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[var(--dark-surface)] border-[var(--dark-border)]" data-testid="transaction-history-card">
      <CardHeader>
        <CardTitle className="text-[var(--gold-primary)] flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Transaction History
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your private transaction records
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12" data-testid="no-transactions">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No transactions yet</p>
            <p className="text-sm text-gray-500 mt-2">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx, index) => (
              <div
                key={tx.id || index}
                className="p-4 bg-[var(--dark-bg)] rounded-lg border border-[var(--dark-border)] hover:border-[var(--gold-accent)] transition-colors"
                data-testid={`transaction-item-${index}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getTypeColor(tx.tx_type)}>
                        {tx.tx_type?.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500">{formatDate(tx.timestamp)}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-white font-medium">
                        {tx.amount} {tx.token}
                      </p>
                      {tx.destination && (
                        <p className="text-xs text-gray-400">
                          To: {tx.destination.slice(0, 8)}...{tx.destination.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                  {tx.tx_signature && tx.tx_signature !== 'mock_token_transfer' && (
                    <a
                      href={`https://solscan.io/tx/${tx.tx_signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--gold-primary)] hover:text-[var(--gold-secondary)] transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <div className="pt-2 border-t border-[var(--dark-border)]">
                  <p className="text-xs text-gray-500">
                    Status: <span className="text-green-400">{tx.status}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;