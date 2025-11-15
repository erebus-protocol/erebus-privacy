import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Shield, Lock, Zap, ArrowRight, Github, Twitter, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import Lottie from 'lottie-react';
import secureLockAnimation from '../assets/secure-lock.json';
import bitcoinExchangeAnimation from '../assets/bitcoin-exchange.json';
import moneyTransferAnimation from '../assets/money-transfer.json';

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
            <button 
              onClick={() => navigate('/docs')}
              className="text-sm hover:text-[var(--gold-primary)] transition-colors"
            >
              DOCS
            </button>
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
            style={{ opacity: '0.6', filter: 'brightness(1.1)' }}
          >
            <source src="https://customer-assets.emergentagent.com/job_erebus-finance/artifacts/i102lnpk_Looped-Particles-2025-10-17-00-14-36-Utc.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h1 className="hero-headline hero-headline-shine text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 tracking-wider leading-tight" style={{ 
            fontFamily: 'Georgia, "Times New Roman", serif',
            letterSpacing: '0.05em',
            marginTop: '100px'
          }}>
            THE UNDERWORLD<br />OF PRIVACY
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl mb-12 text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
            Secure and private transactions using zero-knowledge cryptography.<br />
            Protect your financial data with advanced privacy technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!connected ? (
              <>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="hero-btn border-2 text-black bg-gradient-to-r from-[#D4AF37] to-[#FFD700] hover:from-[#FFD700] hover:to-[#D4AF37] transition-all duration-300 px-8 py-6 text-lg font-semibold rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                  data-testid="learn-more-btn"
                >
                  Learn More
                </Button>
                
                <div className="wallet-connect-wrapper">
                  <WalletMultiButton className="hero-wallet-btn" data-testid="hero-wallet-connect-btn" />
                </div>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                  className="hero-btn border-2 text-black bg-gradient-to-r from-[#D4AF37] to-[#FFD700] hover:from-[#FFD700] hover:to-[#D4AF37] transition-all duration-300 px-8 py-6 text-lg font-semibold rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                  data-testid="hero-dashboard-btn"
                >
                  Go to Dashboard
                </Button>
                
                <div className="wallet-connect-wrapper">
                  <WalletMultiButton className="hero-wallet-btn" />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6 bg-[var(--dark-bg)] relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--gold-primary)' }}>
              Core Features
            </h2>
            <p className="text-gray-400 text-lg">Advanced privacy technology for secure transactions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card-new group" data-testid="feature-deposits">
              <div className="feature-icon-new mb-6">
                <Lottie 
                  animationData={secureLockAnimation} 
                  loop={true}
                  className="w-24 h-24 mx-auto"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Private Deposits</h3>
              <p className="text-gray-400 leading-relaxed">
                Secure your assets with zero-knowledge proofs. Deposit funds privately and maintain complete transaction confidentiality on Solana.
              </p>
            </div>

            <div className="feature-card-new group" data-testid="feature-trading">
              <div className="feature-icon-new mb-6">
                <Lottie 
                  animationData={bitcoinExchangeAnimation} 
                  loop={true}
                  className="w-24 h-24 mx-auto"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Private Trading</h3>
              <p className="text-gray-400 leading-relaxed">
                Trade tokens with complete privacy. Powered by Jupiter aggregator with zero-knowledge privacy layer for confidential transactions.
              </p>
            </div>

            <div className="feature-card-new group" data-testid="feature-bridge">
              <div className="feature-icon-new mb-6">
                <Lottie 
                  animationData={moneyTransferAnimation} 
                  loop={true}
                  className="w-24 h-24 mx-auto"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Cross-Chain Bridge</h3>
              <p className="text-gray-400 leading-relaxed">
                Bridge assets between Ethereum and Solana networks. Secure cross-chain transfers powered by Wormhole with additional privacy features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Erebus Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-[var(--dark-bg)] to-[var(--dark-surface)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--gold-primary)' }}>
              Why Choose Erebus?
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Built on cutting-edge cryptography and battle-tested blockchain infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="why-card group">
              <div className="why-icon mb-4">
                <Shield className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--gold-primary)]">Military-Grade Security</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                zk-SNARKs and Pedersen commitments ensure mathematical privacy guarantees
              </p>
            </div>

            <div className="why-card group">
              <div className="why-icon mb-4">
                <Zap className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--gold-primary)]">Lightning Fast</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Powered by Solana's high-performance blockchain with sub-second finality
              </p>
            </div>

            <div className="why-card group">
              <div className="why-icon mb-4">
                <Lock className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--gold-primary)]">True Privacy</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Zero-knowledge proofs keep your transactions completely confidential
              </p>
            </div>

            <div className="why-card group">
              <div className="why-icon mb-4">
                <ChevronRight className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--gold-primary)]">No KYC Required</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Start immediately without identity verification or personal information
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-[var(--dark-surface)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--gold-primary)] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--gold-primary)] rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--gold-primary)' }}>
              How It Works
            </h2>
            <p className="text-gray-400 text-lg">Three simple steps to complete privacy</p>
          </div>

          <div className="space-y-12">
            <div className="how-card flex flex-col md:flex-row items-center gap-8">
              <div className="step-number-modern">01</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3 text-[var(--gold-primary)]">Connect Your Wallet</h3>
                <p className="text-gray-400 leading-relaxed">
                  Use any Solana wallet like Phantom or Solflare. No registration, no personal information required. Your privacy starts here.
                </p>
              </div>
              <div className="hidden lg:flex w-32 h-32 rounded-full bg-gradient-to-br from-[var(--gold-primary)]/20 to-transparent border-2 border-[var(--gold-primary)]/30 items-center justify-center shrink-0">
                <Shield className="h-16 w-16 text-[var(--gold-primary)]" />
              </div>
            </div>

            <div className="how-card flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="step-number-modern">02</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3 text-[var(--gold-primary)]">Deposit & Shield</h3>
                <p className="text-gray-400 leading-relaxed">
                  Send your assets into the Erebus protocol. Advanced cryptography shields your transaction from prying eyes, creating an unbreakable privacy layer.
                </p>
              </div>
              <div className="hidden lg:flex w-32 h-32 rounded-full bg-gradient-to-br from-[var(--gold-primary)]/20 to-transparent border-2 border-[var(--gold-primary)]/30 items-center justify-center shrink-0">
                <Lock className="h-16 w-16 text-[var(--gold-primary)]" />
              </div>
            </div>

            <div className="how-card flex flex-col md:flex-row items-center gap-8">
              <div className="step-number-modern">03</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3 text-[var(--gold-primary)]">Trade & Transfer Privately</h3>
                <p className="text-gray-400 leading-relaxed">
                  Swap tokens, transfer funds, or bridge assets - all with complete privacy. Your financial activity remains your secret.
                </p>
              </div>
              <div className="hidden lg:flex w-32 h-32 rounded-full bg-gradient-to-br from-[var(--gold-primary)]/20 to-transparent border-2 border-[var(--gold-primary)]/30 items-center justify-center shrink-0">
                <Zap className="h-16 w-16 text-[var(--gold-primary)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats & Numbers Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-[var(--dark-surface)] to-[var(--dark-bg)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="stats-modern text-center">
              <div className="text-5xl font-bold text-[var(--gold-primary)] mb-2">100%</div>
              <div className="text-gray-400">Private</div>
            </div>
            <div className="stats-modern text-center">
              <div className="text-5xl font-bold text-[var(--gold-primary)] mb-2">&lt;1s</div>
              <div className="text-gray-400">Transaction Time</div>
            </div>
            <div className="stats-modern text-center">
              <div className="text-5xl font-bold text-[var(--gold-primary)] mb-2">$0.01</div>
              <div className="text-gray-400">Average Fee</div>
            </div>
            <div className="stats-modern text-center">
              <div className="text-5xl font-bold text-[var(--gold-primary)] mb-2">24/7</div>
              <div className="text-gray-400">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-[var(--dark-bg)] via-[var(--dark-surface)] to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--gold-primary)] rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl sm:text-6xl font-bold mb-6" style={{ color: 'var(--gold-primary)' }}>
            Enter the Underworld
          </h2>
          <p className="text-gray-300 text-xl mb-12 leading-relaxed max-w-2xl mx-auto">
            Join the revolution of truly private DeFi. Your transactions, your privacy, your control.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              onClick={() => connected ? navigate('/dashboard') : document.querySelector('.wallet-adapter-button')?.click()}
              className="cta-button-modern text-xl px-12 py-7"
            >
              Launch Application
              <ChevronRight className="ml-2 h-6 w-6 inline" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> No KYC
            </span>
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Fully Private
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4" /> Instant
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black border-t border-[var(--gold-primary)]/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_ed48b7a2-6a38-4200-8e89-4581c421d9ea/artifacts/q9tyi3wm_erebus-icon.svg" 
                alt="Erebus" 
                className="h-8 w-8"
              />
              <span className="text-[var(--gold-primary)] font-semibold">Erebus Protocol</span>
            </div>
            <div className="text-gray-500 text-sm">
              © 2025 Erebus Protocol. Privacy by design.
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-[var(--gold-primary)] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-[var(--gold-primary)] transition-colors">
                <Github className="h-5 w-5" />
              </a>
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

        .hero-headline-shine {
          background: linear-gradient(
            90deg,
            #B8860B 0%,
            #FFD700 25%,
            #FFFACD 50%,
            #FFD700 75%,
            #B8860B 100%
          );
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 3s linear infinite, fadeInUp 1s ease-out;
          text-shadow: none;
          filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.5));
        }

        @keyframes shine {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: 200% center;
          }
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

        .feature-card-new {
          padding: 2rem;
          background: rgba(26, 26, 26, 0.5);
          border: 1px solid rgba(255, 215, 0, 0.1);
          border-radius: 16px;
          transition: all 0.3s ease;
          text-align: center;
        }

        .feature-card-new:hover {
          transform: translateY(-8px);
          border-color: var(--gold-primary);
          box-shadow: 0 12px 32px rgba(255, 215, 0, 0.2);
          background: rgba(26, 26, 26, 0.8);
        }

        .feature-icon-new {
          transition: all 0.3s ease;
        }

        .feature-card-new:hover .feature-icon-new {
          transform: scale(1.1);
        }

        .why-card {
          padding: 2rem;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 215, 0, 0.1);
          border-radius: 20px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .why-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--gold-primary), var(--gold-secondary));
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }

        .why-card:hover::before {
          transform: scaleX(1);
        }

        .why-card:hover {
          transform: translateY(-8px);
          border-color: var(--gold-primary);
          background: rgba(0, 0, 0, 0.7);
          box-shadow: 0 20px 50px rgba(255, 215, 0, 0.2);
        }

        .why-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(255, 215, 0, 0.1));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gold-primary);
          transition: all 0.4s ease;
        }

        .why-card:hover .why-icon {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(255, 215, 0, 0.2));
          transform: scale(1.1) rotate(5deg);
        }

        .how-card {
          padding: 3rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 215, 0, 0.15);
          border-radius: 24px;
          transition: all 0.4s ease;
        }

        .how-card:hover {
          background: rgba(0, 0, 0, 0.5);
          border-color: var(--gold-primary);
          box-shadow: 0 12px 40px rgba(255, 215, 0, 0.15);
        }

        .step-number-modern {
          font-size: 4rem;
          font-weight: 900;
          background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          opacity: 0.3;
          transition: all 0.4s ease;
        }

        .how-card:hover .step-number-modern {
          opacity: 1;
          transform: scale(1.1);
        }

        .stats-modern {
          transition: all 0.3s ease;
        }

        .stats-modern:hover {
          transform: translateY(-4px);
        }

        .stats-modern:hover .text-5xl {
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        }

        .cta-button-modern {
          background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary));
          color: #000;
          font-weight: 700;
          border-radius: 9999px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 40px rgba(255, 215, 0, 0.3);
          border: none;
          position: relative;
          overflow: hidden;
        }

        .cta-button-modern::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s ease;
        }

        .cta-button-modern:hover::before {
          left: 100%;
        }

        .cta-button-modern:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(255, 215, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;