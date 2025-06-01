import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation, LanguageSwitcher } from '../contexts/LanguageContext';
import '../styling/Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { t } = useTranslation();

  // This effect will run on component mount and whenever the location changes
  // This ensures the header updates when user logs in/out
  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // Only set the user if they are logged in
      if (parsedUser.isLoggedIn) {
        setUser(parsedUser);
      } else {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location.pathname]); // Re-check when route changes

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // UPDATED FUNCTION: Now integrates with the backend API
  const handleLogout = async () => {
    try {
      // Step 1: Call the logout API endpoint to properly log out on the server
      const response = await fetch('/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication token if you're using JWT tokens
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include', // Include cookies if using session-based auth
      });

      // Step 2: Check if the API call was successful
      if (response.ok) {
        // API logout successful, now clean up frontend state
        
        // Get the current user data from localStorage
        const userData = localStorage.getItem('user');
        
        if (userData) {
          const user = JSON.parse(userData);
          // Update the isLoggedIn property to false
          user.isLoggedIn = false;
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Clear other session data that's no longer needed
        localStorage.removeItem('userType');
        localStorage.removeItem('userId');
        // Uncomment the next line if you're storing JWT tokens
        // localStorage.removeItem('token');
        
        // Update component state to trigger re-render and hide user menu items
        setUser(null);
        
        // Navigate user back to the login page
        navigate('/login');
        
      } else {
        // Handle API error response - server returned an error status
        console.error('Logout failed:', response.status, response.statusText);
        
        // You might want to show an error message to the user here
        // For now, we'll still proceed with frontend cleanup
        // This decision depends on your application's requirements
        
        // Still clean up frontend state even if server logout failed
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.isLoggedIn = false;
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        localStorage.removeItem('userType');
        localStorage.removeItem('userId');
        setUser(null);
        navigate('/login');
      }
      
    } catch (error) {
      // Handle network errors or other exceptions (like server being down)
      console.error('Error during logout:', error);
      
      // Even if the API call completely fails, we should still log the user out
      // from the frontend perspective so they don't get stuck in a broken state
      
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        user.isLoggedIn = false;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      setUser(null);
      navigate('/login');
    }
  };

  // Function to determine if the current path is active
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/">
            <h1>CampusHelp</h1>
            <span className="tagline">{t('tagline')}</span>
          </Link>
        </div>

        <div className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <nav className={`main-nav ${isMenuOpen ? 'show' : ''}`}>
          <ul>
            {user && user.isLoggedIn ? (
              <>
                <li>
                  <Link to="/dashboard" className={isActive('/dashboard')}>
                    {t('dashboard')}
                  </Link>
                </li>
                <li>
                  <Link to="/volunteer-mode" className={isActive('/volunteer-mode')}>
                    {t('wantToHelp')}
                  </Link>
                </li>
                <li>
                  <Link to="/patient-mode" className={isActive('/patient-mode')}>
                    {t('needHelp')}
                  </Link>
                </li>
                <li>
                  {/* This button already calls handleLogout - no changes needed here */}
                  <button className="logout-btn" onClick={handleLogout}>
                    {t('logout')}
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className={isActive('/login')}>
                    {t('login')}
                  </Link>
                </li>
                <li>
                  <Link to="/register" className={isActive('/register')}>
                    {t('register')}
                  </Link>
                </li>
              </>
            )}
          </ul>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
};

export default Header;