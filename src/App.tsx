import { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { CanvasBackground } from './components/CanvasBackground';
import { PricingCard } from './components/PricingCard';
import { AuthModal } from './components/AuthModal';
import { Maintenance } from './components/Maintenance';
import { LiveBans } from './components/LiveBans';
import { MyReports } from './components/MyReports';
import { Loading } from './components/Loading';
import { WelcomeBanner } from './components/WelcomeBanner';
import { UpdateNameModal } from './components/UpdateNameModal';
import { Transactions } from './components/Transactions';
import { AnimatePresence } from 'framer-motion';
import './style.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLiveBans, setShowLiveBans] = useState(false);
  const [showMyReports, setShowMyReports] = useState(false);
  const [showUpdateName, setShowUpdateName] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [username, setUsername] = useState('User');
  const [displayName, setDisplayName] = useState('User');
  const [nameChangeCount, setNameChangeCount] = useState(0);
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  // Hide navbar and banner on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      
      // Show navbar/banner only when at top (scroll position < 50px)
      if (currentScroll < 50) {
        setIsScrollingDown(false);
      } else {
        setIsScrollingDown(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const isMaintenanceMode = false; // Set to false to disable maintenance mode

  useEffect(() => {
    // Show loading for at least 3 seconds
    const loadingTimer = setTimeout(() => {
      // Check localStorage for auth token
      const authData = localStorage.getItem('rektnow_auth');
      
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          
          // If token exists, user is authenticated
          if (parsed.token && parsed.username) {
            setIsAuthenticated(true);
            setShowAuthModal(false);
            setUsername(parsed.username);
            // Load display name from backend or use username as fallback
            setDisplayName(parsed.displayName || parsed.username);
            setNameChangeCount(parsed.nameChangeCount || 0);
          } else {
            localStorage.removeItem('rektnow_auth');
            setIsAuthenticated(false);
            setShowAuthModal(true);
          }
        } catch (e) {
          localStorage.removeItem('rektnow_auth');
          setIsAuthenticated(false);
          setShowAuthModal(true);
        }
      } else {
        setIsAuthenticated(false);
        setShowAuthModal(true);
      }
      
      setIsLoading(false);
      
      // Ensure page starts at top after loading completes
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }, 3000);

    return () => clearTimeout(loadingTimer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('rektnow_auth');
    setIsAuthenticated(false);
    setShowAuthModal(true);
  };

  const handleUpdateDisplayName = async (newName: string) => {
    try {
      const authData = localStorage.getItem('rektnow_auth');
      if (!authData) return;
      
      const { token } = JSON.parse(authData);
      
      const response = await fetch('/auth/update-display-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, displayName: newName }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDisplayName(newName);
        setNameChangeCount(data.nameChangeCount);
        // Update localStorage
        const updated = JSON.parse(authData);
        updated.displayName = newName;
        updated.nameChangeCount = data.nameChangeCount;
        localStorage.setItem('rektnow_auth', JSON.stringify(updated));
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update display name error:', error);
      throw error;
    }
  };

  return (
    <LanguageProvider>
      {isMaintenanceMode ? (
        <>
          <CanvasBackground />
          <Maintenance />
        </>
      ) : (
        <>
          {isLoading ? (
            <Loading />
          ) : (
            <>
              {showAuthModal && <AuthModal />}
              
              {/* Live Bans Modal */}
              <AnimatePresence>
                {showLiveBans && (
                  <LiveBans 
                    onClose={() => setShowLiveBans(false)}
                    username={username}
                  />
                )}
              </AnimatePresence>
              
              {/* My Reports Modal */}
              <AnimatePresence>
                {showMyReports && (
                  <MyReports 
                    onClose={() => setShowMyReports(false)}
                    username={username}
                  />
                )}
              </AnimatePresence>
              
              {/* Update Name Modal */}
              <UpdateNameModal
                isOpen={showUpdateName}
                currentName={displayName}
                username={username}
                nameChangeCount={nameChangeCount}
                onClose={() => setShowUpdateName(false)}
                onUpdate={handleUpdateDisplayName}
              />
              
              {/* Transactions Modal */}
              <AnimatePresence>
                {showTransactions && (
                  <Transactions 
                    onClose={() => setShowTransactions(false)}
                    onContinuePayment={(transaction) => {
                      console.log('Continue payment:', transaction);
                      setSelectedTransaction(transaction);
                      setShowTransactions(false);
                    }}
                  />
                )}
              </AnimatePresence>
              
              {isAuthenticated && (
                <>
                  <div className="app">
                    <CanvasBackground />
                    <Navbar 
                      isAuthenticated={true} 
                      onLoginClick={() => {}}
                      onLogout={handleLogout}
                      onLiveBansClick={() => setShowLiveBans(true)}
                      onMyReportsClick={() => setShowMyReports(true)}
                      onChangeNameClick={() => setShowUpdateName(true)}
                      onTransactionsClick={() => setShowTransactions(true)}
                      displayName={displayName}
                      nameChangeCount={nameChangeCount}
                      isHidden={isScrollingDown}
                    />
                    
                    {/* Welcome Banner - After navbar for mobile */}
                    <WelcomeBanner 
                      displayName={displayName}
                      username={username}
                      isHidden={isScrollingDown}
                    />
                    
                    <div className="main-content" style={{ marginTop: '48px' }}>
                      <div className="wrapper">
                        <PricingCard selectedTransaction={selectedTransaction} onTransactionHandled={() => setSelectedTransaction(null)} />
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {!isAuthenticated && !showAuthModal && (
                <>
                  <CanvasBackground />
                </>
              )}
            </>
          )}
        </>
      )}
    </LanguageProvider>
  );
}

export default App;
