import React from 'react';
import { Link } from 'react-router-dom';
import '../styling/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section about">
            <h3>CampusHelp</h3>
            <p>
              Connecting students with special needs to volunteer helpers on campus.
              Together, we build a more inclusive educational environment.
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
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link to="/volunteer-mode">Volunteer Mode</Link>
              </li>
              <li>
                <Link to="/patient-mode">Request Assistance</Link>
              </li>
              <li>
                <Link to="/resources">Resources</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section contact">
            <h3>Contact Us</h3>
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