import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftRight, 
  Send, 
  Coins, 
  Network, 
  Clock, 
  Home,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';

const Sidebar = ({ balance, loading, walletAddress }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('swap');

  const menuItems = [
    { 
      id: 'swap', 
      label: 'Swap', 
      icon: ArrowLeftRight, 
      path: '/dashboard?tab=swap',
      description: 'Trade tokens' 
    },
    { 
      id: 'transfer-sol', 
      label: 'Transfer SOL', 
      icon: Send, 
      path: '/dashboard?tab=transfer-sol',
      description: 'Send SOL' 
    },
    { 
      id: 'transfer-token', 
      label: 'Transfer Token', 
      icon: Coins, 
      path: '/dashboard?tab=transfer-token',
      description: 'Send tokens' 
    },
    { 
      id: 'bridge', 
      label: 'Bridge', 
      icon: Network, 
      path: '/dashboard?tab=bridge',
      description: 'Cross-chain' 
    },
    { 
      id: 'history', 
      label: 'History', 
      icon: Clock, 
      path: '/dashboard?tab=history',
      description: 'Transactions' 
    },
  ];

  const handleMenuClick = (item) => {
    setActiveTab(item.id);
    // Trigger custom event untuk Dashboard component
    window.dispatchEvent(new CustomEvent('sidebar-navigate', { detail: item.id }));
    setIsOpen(false);
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--dark-surface)] border border-[var(--gold-accent)] rounded-lg hover:bg-[var(--gold-primary)] hover:text-black transition-colors"
        data-testid="mobile-menu-btn"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-40
          w-72 bg-[var(--dark-surface)] border-r border-[var(--dark-border)]
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        data-testid="sidebar"
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-[var(--dark-border)]">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_ed48b7a2-6a38-4200-8e89-4581c421d9ea/artifacts/q9tyi3wm_erebus-icon.svg" 
              alt="Erebus Icon" 
              className="h-10 w-10"
            />
            <img 
              src="https://customer-assets.emergentagent.com/job_ed48b7a2-6a38-4200-8e89-4581c421d9ea/artifacts/476tb5ea_erebus-text.svg" 
              alt="Erebus Protocol" 
              className="h-7"
            />
          </div>
          <p className="text-xs text-gray-500 mb-4">ZK Privacy Protocol</p>

          {/* Wallet Balance Info */}
          <div className="bg-gradient-to-br from-[var(--gold-primary)]/10 to-[var(--gold-secondary)]/10 rounded-lg p-3 border border-[var(--gold-accent)]/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Balance</span>
              {loading && (
                <div className="w-3 h-3 border-2 border-[var(--gold-primary)] border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <div className="text-lg font-bold text-[var(--gold-primary)]" data-testid="sidebar-balance">
              {loading ? '...' : `${balance.toFixed(4)} SOL`}
            </div>
            {walletAddress && (
              <div className="text-xs text-gray-500 font-mono mt-0.5">
                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-2">
            {/* Home Button */}
            <button
              onClick={handleHomeClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[var(--dark-bg)] hover:text-[var(--gold-primary)] transition-all group"
              data-testid="sidebar-home"
            >
              <Home className="h-5 w-5" />
              <div className="flex-1 text-left">
                <div className="font-medium">Home</div>
                <div className="text-xs opacity-70">Landing page</div>
              </div>
            </button>

            <div className="my-4 border-t border-[var(--dark-border)]"></div>

            {/* Menu Items */}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-secondary)] text-black shadow-lg' 
                      : 'text-gray-400 hover:bg-[var(--dark-bg)] hover:text-[var(--gold-primary)]'
                    }
                  `}
                  data-testid={`sidebar-${item.id}`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-black' : ''}`} />
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${isActive ? 'text-black' : ''}`}>
                      {item.label}
                    </div>
                    <div className={`text-xs ${isActive ? 'text-black/70' : 'opacity-70'}`}>
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Privacy Badge */}
        <div className="p-4 mx-4 mb-4 bg-gradient-to-br from-[var(--gold-primary)]/10 to-[var(--gold-secondary)]/10 rounded-lg border border-[var(--gold-accent)]/30">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-[var(--gold-primary)] rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-[var(--gold-primary)]">PRIVACY ENABLED</span>
          </div>
          <p className="text-xs text-gray-500">All transactions are private</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
