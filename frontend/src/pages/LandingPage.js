import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Shield, Lock, Zap, ArrowRight, Github, Twitter } from 'lucide-react';
import { Button } from '../components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();
  const { connected } = useWallet();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrollY > 50 ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(12px)' : 'none',
          borderBottom: scrollY > 50 ? '1px solid rgba(255, 215, 0, 0.1)' : 'none'
        }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_ed48b7a2-6a38-4200-8e89-4581c421d9ea/artifacts/q9tyi3wm_erebus-icon.svg" 
              alt="Erebus Icon" 
              className="h-10 w-10 animate-float"
            />
            <img 
              src="https://customer-assets.emergentagent.com/job_ed48b7a2-6a38-4200-8e89-4581c421d9ea/artifacts/476tb5ea_erebus-text.svg" 
              alt="Erebus Protocol" 
              className="h-8"
            />
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm hover:text-[var(--gold-primary)] transition-colors">Features</a>
            <a href="#about" className="text-sm hover:text-[var(--gold-primary)] transition-colors">About</a>
            {connected && (
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-secondary)] text-black font-semibold hover:opacity-90 px-6"
                data-testid="dashboard-nav-btn"
              >
                Dashboard
              </Button>
            )}
          </div>
        </div>
      </nav>

      <section className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--gold-primary)] opacity-10 blur-[120px] rounded-full animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--gold-secondary)] opacity-10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="mb-8 animate-fade-in">
            <img 
              src="https://customer-assets.emergentagent.com/job_ed48b7a2-6a38-4200-8e89-4581c421d9ea/artifacts/q9tyi3wm_erebus-icon.svg" 
              alt="Erebus" 
              className="h-24 w-24 mx-auto mb-6 animate-float"
            />
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-glow" style={{ color: 'var(--gold-primary)' }}>
            EREBUS PROTOCOL
          </h1>
          
          <p className="text-xl sm:text-2xl mb-4 text-gray-300 max-w-3xl mx-auto">
            Zero-Knowledge Privacy System on Solana
          </p>
          
          <p className="text-base sm:text-lg mb-12 text-gray-400 max-w-2xl mx-auto">
            Execute private swaps, transfers, and bridges with military-grade encryption. Your transactions, your privacy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <WalletMultiButton data-testid="hero-wallet-connect-btn" />
            <Button 
              variant="outline" 
              size="lg"
              className="border-[var(--gold-primary)] text-[var(--gold-primary)] hover:bg-[var(--gold-primary)] hover:text-black transition-all duration-300"
              data-testid="learn-more-btn"
            >
              Learn More <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
            <div className="stat-card">
              <div className="text-4xl font-bold text-[var(--gold-primary)] mb-2">100%</div>
              <div className="text-gray-400">Private Transactions</div>
            </div>
            <div className="stat-card">
              <div className="text-4xl font-bold text-[var(--gold-primary)] mb-2">&lt;2s</div>
              <div className="text-gray-400">Average Speed</div>
            </div>
            <div className="stat-card">
              <div className="text-4xl font-bold text-[var(--gold-primary)] mb-2">$0.001</div>
              <div className="text-gray-400">Transaction Fee</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6 bg-[var(--dark-surface)] relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16" style={{ color: 'var(--gold-primary)' }}>
            Powerful Privacy Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="feature-card" data-testid="feature-swap">
              <div className="feature-icon">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Private Swap</h3>
              <p className="text-gray-400">
                Swap tokens anonymously using Jupiter Aggregator integration.
              </p>
            </div>

            <div className="feature-card" data-testid="feature-transfer">
              <div className="feature-icon">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Anonymous Transfer</h3>
              <p className="text-gray-400">
                Transfer SOL and SPL tokens through our treasury system for complete privacy.
              </p>
            </div>

            <div className="feature-card" data-testid="feature-bridge">
              <div className="feature-icon">
                <Lock className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Cross-Chain Bridge</h3>
              <p className="text-gray-400">
                Bridge assets across chains privately using Wormhole integration.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16" style={{ color: 'var(--gold-primary)' }}>
            How It Works
          </h2>
          
          <div className="space-y-8">
            <div className="how-it-works-step">
              <div className="step-number">1</div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-[var(--gold-primary)]">Connect Wallet</h3>
                <p className="text-gray-400">Connect your Solana wallet using any supported adapter.</p>
              </div>
            </div>

            <div className="how-it-works-step">
              <div className="step-number">2</div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-[var(--gold-primary)]">Choose Operation</h3>
                <p className="text-gray-400">Select swap, transfer, or bridge operation.</p>
              </div>
            </div>

            <div className="how-it-works-step">
              <div className="step-number">3</div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-[var(--gold-primary)]">Private Execution</h3>
                <p className="text-gray-400">Your transaction is routed through our treasury system.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-[var(--dark-border)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_ed48b7a2-6a38-4200-8e89-4581c421d9ea/artifacts/q9tyi3wm_erebus-icon.svg" 
                alt="Erebus" 
                className="h-8 w-8"
              />
              <span className="text-lg font-semibold" style={{ color: 'var(--gold-primary)' }}>Erebus Protocol</span>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-[var(--gold-primary)] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[var(--gold-primary)] transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
            
            <div className="text-sm text-gray-500">
              © 2025 Erebus Protocol
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .feature-card {
          background: rgba(26, 26, 26, 0.8);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 16px;
          padding: 2rem;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          border-color: var(--gold-primary);
          box-shadow: 0 12px 32px rgba(255, 215, 0, 0.2);
        }

        .feature-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          margin-bottom: 1.5rem;
        }

        .how-it-works-step {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
          padding: 2rem;
          background: rgba(26, 26, 26, 0.5);
          border-radius: 16px;
          border: 1px solid rgba(255, 215, 0, 0.1);
        }

        .step-number {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
          color: #000;
          flex-shrink: 0;
        }

        .stat-card {
          padding: 1.5rem;
          background: rgba(26, 26, 26, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(255, 215, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;