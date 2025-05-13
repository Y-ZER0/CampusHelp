import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styling/Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const userType = localStorage.getItem('userType');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    navigate('/');
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
            <span className="tagline">Supporting Students Together</span>
          </Link>
        </div>

        <div className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <nav className={`main-nav ${isMenuOpen ? 'show' : ''}`}>
          <ul>
            <li>
              <Link to="/" className={isActive('/')}>
                Home
              </Link>
            </li>
            {isLoggedIn ? (
              <>
                <li>
                  <Link to={`/dashboard/${userType}`} className={isActive(`/dashboard/${userType}`)}>
                    Dashboard
                  </Link>
                </li>
                {userType === 'volunteer' && (
                  <li>
                    <Link to="/requests" className={isActive('/requests')}>
                      Requests
                    </Link>
                  </li>
                )}
                <li>
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/register/patient" className={isActive('/register/patient')}>
                    I Need Help
                  </Link>
                </li>
                <li>
                  <Link to="/register/volunteer" className={isActive('/register/volunteer')}>
                    I Want to Help
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;