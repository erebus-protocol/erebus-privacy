import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Shield, Lock, Zap, ArrowRight, Github, Twitter, Sparkles } from 'lucide-react';
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
      {/* Announcement Bar */}
      <div className="announcement-bar fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black py-3 px-6 text-center text-sm font-medium">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span>Erebus Protocol Beta Version is Now Live! Experience the power of zero-knowledge privacy on Solana.</span>
        </div>
      </div>

      <nav className="fixed top-12 left-0 right-0 z-50 transition-all duration-300"
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
            <a href="#home" className="text-sm hover:text-[var(--gold-primary)] transition-colors">HOME</a>
            <a href="#features" className="text-sm hover:text-[var(--gold-primary)] transition-colors">FEATURES</a>
            <a href="#docs" className="text-sm hover:text-[var(--gold-primary)] transition-colors">DOCS</a>
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

      <section id="home" className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: '0.4', filter: 'brightness(0.8)' }}
          >
            <source src="https://customer-assets.emergentagent.com/job_erebus-finance/artifacts/40q569i0_Gold-Particles-Wave-2025-10-16-23-56-55-Utc%281%29.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h1 className="hero-headline text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 tracking-wider" style={{ 
            color: 'var(--gold-primary)',
            fontFamily: 'Georgia, "Times New Roman", serif',
            textShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
            letterSpacing: '0.05em'
          }}>
            THE UNDERWORLD<br />OF PRIVACY
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl mb-12 text-[var(--gold-primary)] max-w-3xl mx-auto italic font-light leading-relaxed" style={{
            textShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
          }}>
            Secure and private transactions using zero-knowledge cryptography.
            Protect your financial data with advanced privacy technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="outline" 
              size="lg"
              className="hero-btn border-2 text-black bg-gradient-to-r from-[#D4AF37] to-[#FFD700] hover:from-[#FFD700] hover:to-[#D4AF37] transition-all duration-300 px-8 py-6 text-lg font-semibold rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)]"
              data-testid="learn-more-btn"
            >
              Learn More
            </Button>
            
            {/* Wallet Adapter Button styled as custom button */}
            <div className="wallet-connect-wrapper">
              <WalletMultiButton className="hero-wallet-btn" data-testid="hero-wallet-connect-btn" />
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
        .announcement-bar {
          animation: slideDown 0.5s ease-out;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .hero-headline {
          animation: fadeInUp 1s ease-out;
        }

        .hero-btn {
          animation: fadeInUp 1.2s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .wallet-connect-wrapper :global(.wallet-adapter-button) {
          background: linear-gradient(to right, #D4AF37, #FFD700) !important;
          color: #000 !important;
          font-weight: 600 !important;
          border: 2px solid transparent !important;
          border-radius: 9999px !important;
          padding: 1.5rem 2rem !important;
          font-size: 1.125rem !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.4) !important;
          animation: fadeInUp 1.2s ease-out;
        }

        .wallet-connect-wrapper :global(.wallet-adapter-button:hover) {
          background: linear-gradient(to right, #FFD700, #D4AF37) !important;
          transform: translateY(-2px);
        }

        .wallet-connect-wrapper :global(.wallet-adapter-button-trigger) {
          background: linear-gradient(to right, #D4AF37, #FFD700) !important;
        }

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