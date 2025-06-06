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

  const handleLogout = () => {
    // Get the current user data
    const userData = localStorage.getItem('user');
    
    if (userData) {
      const user = JSON.parse(userData);
      // Update the isLoggedIn property to false instead of removing
      user.isLoggedIn = false;
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    // Clear other session data
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    
    // Update state to trigger re-render
    setUser(null);
    
    // Navigate to login page
    navigate('/login');
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