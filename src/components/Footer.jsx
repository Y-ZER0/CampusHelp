import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import '../styling/Footer.css';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section about">
            <h3>CampusHelp</h3>
            <p>
              {t('aboutCampusHelp')}
            </p>
            {/* <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fa fa-facebook"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <i className="fa fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="fa fa-instagram"></i>
              </a>
            </div> */}
          </div>

          <div className="footer-section links">
            <h3>{t('quickLinks')}</h3>
            <ul>
              <li>
                <Link to="/">{t('home')}</Link>
              </li>
              <li>
                <Link to="/dashboard">{t('dashboard')}</Link>
              </li>
              <li>
                <Link to="/volunteer-mode">{t('volunteerMode')}</Link>
              </li>
              <li>
                <Link to="/patient-mode">{t('requestAssistance')}</Link>
              </li>
              <li>
                <Link to="/resources">{t('resources')}</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section contact">
            <h3>{t('contactUs')}</h3>
            <p>
              <i className="fa fa-map-marker"></i> University Campus, Building A
            </p>
            <p>
              <i className="fa fa-phone"></i> (+962) 456-7890
            </p>
            <p>
              <i className="fa fa-envelope"></i> support@campushelp.edu
            </p>
          </div>
        </div>

        {/* <div className="footer-bottom">
          <p>&copy; {currentYear} CampusHelp. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/accessibility">Accessibility</Link>
          </div>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;