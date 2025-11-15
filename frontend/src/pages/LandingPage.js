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
            style={{ opacity: '0.3', filter: 'brightness(0.6)' }}
          >
            <source src="https://customer-assets.emergentagent.com/job_erebus-finance/artifacts/i102lnpk_Looped-Particles-2025-10-17-00-14-36-Utc.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
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

      {/* Stats Section */}
      <section className="py-20 px-6 bg-[var(--dark-bg)] relative border-t border-b border-[var(--gold-primary)]/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="stat-card-highlight group">
              <div className="stat-icon mb-4">
                <Shield className="h-16 w-16 mx-auto text-[var(--gold-primary)]" />
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-[var(--gold-primary)] mb-3">SECURE</div>
              <div className="text-gray-300 text-lg">Privacy</div>
            </div>
            
            <div className="stat-card-highlight group">
              <div className="stat-icon mb-4">
                <Zap className="h-16 w-16 mx-auto text-[var(--gold-primary)]" />
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-[var(--gold-primary)] mb-3">FAST</div>
              <div className="text-gray-300 text-lg">Transactions</div>
            </div>
            
            <div className="stat-card-highlight group">
              <div className="stat-icon mb-4">
                <Lock className="h-16 w-16 mx-auto text-[var(--gold-primary)]" />
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-[var(--gold-primary)] mb-3">PROVEN</div>
              <div className="text-gray-300 text-lg">Technology</div>
            </div>
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

      {/* Advanced Technology Section */}
      <section className="py-24 px-6 bg-[var(--dark-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--gold-primary)' }}>
              Advanced Technology
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Built with proven cryptographic techniques and modern blockchain technology. Our protocol ensures transaction privacy and security through mathematical guarantees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="tech-item flex items-start gap-3 p-4 rounded-lg bg-black/30 border border-[var(--gold-primary)]/10">
              <div className="text-[var(--gold-primary)] mt-1">✓</div>
              <p className="text-gray-300">Groth16 ZK-SNARKs with custom Circom circuits</p>
            </div>
            <div className="tech-item flex items-start gap-3 p-4 rounded-lg bg-black/30 border border-[var(--gold-primary)]/10">
              <div className="text-[var(--gold-primary)] mt-1">✓</div>
              <p className="text-gray-300">Pedersen commitment schemes for secure privacy</p>
            </div>
            <div className="tech-item flex items-start gap-3 p-4 rounded-lg bg-black/30 border border-[var(--gold-primary)]/10">
              <div className="text-[var(--gold-primary)] mt-1">✓</div>
              <p className="text-gray-300">Solana smart contracts with robust security</p>
            </div>
            <div className="tech-item flex items-start gap-3 p-4 rounded-lg bg-black/30 border border-[var(--gold-primary)]/10">
              <div className="text-[var(--gold-primary)] mt-1">✓</div>
              <p className="text-gray-300">Cryptographic nullifiers prevent double-spending</p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Technology Section */}
      <section className="py-24 px-6 bg-[var(--dark-bg)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--gold-primary)' }}>
              Privacy Technology
            </h2>
            <p className="text-gray-400 text-lg">Modern Cryptography for Secure Transactions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-[var(--gold-primary)]">Pedersen Commitments</h3>
              <p className="text-gray-400 leading-relaxed">
                Secure value commitment using elliptic curve cryptography. Each commitment (vG + rH) provides cryptographic hiding and binding properties to ensure transaction privacy.
              </p>
              <div className="code-block bg-black/50 border border-[var(--gold-primary)]/20 rounded-lg p-6 font-mono text-sm">
                <pre className="text-gray-300 overflow-x-auto">
{`// Privacy Commitment
commitment = value * Generator + random * Blinder

// Generate Proof
zk_proof = generate_proof(
  claim: "Value is committed correctly",
  private: { value, randomness },
  public: { commitment }
)

// Nullifier Hash
nullifier = hash(secret, commitment)`}
                </pre>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-[var(--gold-primary)]">Zero-Knowledge Proofs</h3>
              <p className="text-gray-400 leading-relaxed">
                zk-SNARKs enable privacy-preserving verification. Prove transaction validity, amounts, and ownership while revealing no sensitive information.
              </p>
              <div className="code-block bg-black/50 border border-[var(--gold-primary)]/20 rounded-lg p-6 font-mono text-sm">
                <pre className="text-gray-300 overflow-x-auto">
{`// Shadow Circuit (Circom)
template ErebusTransfer() {
  signal private wealth;
  signal private erebus_key;
  signal private shadow_seed;
  signal output dark_seal;

  dark_seal <== Pedersen([wealth, shadow_seed]);
  verify(erebus_key, dark_seal);
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Ritual Section */}
      <section id="ritual" className="py-24 px-6 bg-[var(--dark-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--gold-primary)' }}>
              The Ritual
            </h2>
            <p className="text-gray-400 text-lg">Three steps into eternal darkness</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="ritual-card text-center">
              <div className="text-6xl font-bold text-[var(--gold-primary)] mb-6">I</div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Descent</h3>
              <p className="text-gray-400 leading-relaxed">
                Cast your wealth into the void. The underworld accepts your offering, binding it with cryptographic seals known only to shadows.
              </p>
            </div>

            <div className="ritual-card text-center">
              <div className="text-6xl font-bold text-[var(--gold-primary)] mb-6">II</div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Oblivion</h3>
              <p className="text-gray-400 leading-relaxed">
                Your wealth dissolves into darkness, mixing with countless others. All traces vanish. Even the gods cannot find what Erebus conceals.
              </p>
            </div>

            <div className="ritual-card text-center">
              <div className="text-6xl font-bold text-[var(--gold-primary)] mb-6">III</div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--gold-primary)]">Resurrection</h3>
              <p className="text-gray-400 leading-relaxed">
                Speak the incantation. Prove your shadow claim. Wealth emerges from darkness to any destination, reborn without memory of origin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-[var(--dark-bg)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: 'var(--gold-primary)' }}>
            Start Using Erebus
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Experience secure and private transactions today
          </p>
          <Button
            onClick={() => connected ? navigate('/dashboard') : document.querySelector('.wallet-adapter-button')?.click()}
            className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black hover:from-[#FFD700] hover:to-[#D4AF37] px-12 py-6 text-lg font-semibold rounded-full shadow-[0_0_30px_rgba(255,215,0,0.4)] hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] transition-all duration-300"
          >
            Launch App <ChevronRight className="ml-2 h-5 w-5 inline" />
          </Button>
          <p className="text-gray-500 text-sm mt-6">
            No KYC required • Decentralized • Privacy-focused
          </p>
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

        .stat-card-new {
          transition: all 0.3s ease;
        }

        .stat-card-new:hover {
          transform: translateY(-4px);
          border-color: var(--gold-primary);
          box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3);
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

        .tech-item {
          transition: all 0.3s ease;
        }

        .tech-item:hover {
          border-color: var(--gold-primary);
          background: rgba(0, 0, 0, 0.5);
          transform: translateX(8px);
        }

        .code-block {
          transition: all 0.3s ease;
        }

        .code-block:hover {
          border-color: var(--gold-primary);
          box-shadow: 0 4px 16px rgba(255, 215, 0, 0.1);
        }

        .ritual-card {
          padding: 2rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 215, 0, 0.1);
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .ritual-card:hover {
          border-color: var(--gold-primary);
          background: rgba(0, 0, 0, 0.5);
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(255, 215, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;