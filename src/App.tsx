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
import { AnimatePresence } from 'framer-motion';
import './style.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLiveBans, setShowLiveBans] = useState(false);
  const [showMyReports, setShowMyReports] = useState(false);
  const [username, setUsername] = useState('User');
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
    }, 3000);

    return () => clearTimeout(loadingTimer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('rektnow_auth');
    setIsAuthenticated(false);
    setShowAuthModal(true);
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
              
              {isAuthenticated && (
                <div className="app">
                  <CanvasBackground />
                  <Navbar 
                    isAuthenticated={true} 
                    onLoginClick={() => {}}
                    onLogout={handleLogout}
                    onLiveBansClick={() => setShowLiveBans(true)}
                    onMyReportsClick={() => setShowMyReports(true)}
                  />
                  
                  <div className="main-content">
                    <div className="wrapper">
                      <PricingCard />
                    </div>
                  </div>
                </div>
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
