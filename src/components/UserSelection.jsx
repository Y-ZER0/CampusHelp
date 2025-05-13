import React from 'react';
import { Link } from 'react-router-dom';
import '../styling/UserSelection.css'; // Import your CSS file for styling

const UserSelection = () => {
  return (
    <div className="user-selection-container">
      <div className="selection-heading">
        <h1>Campus Support Network</h1>
        <p>Connecting students with special needs to helpful volunteers</p>
      </div>
      
      <div className="selection-cards">
        <div className="selection-card">
          <div className="card-icon patient-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <h2>I Need Assistance</h2>
          <p>Register as a student with special needs to request campus support</p>
          <Link to="/register/patient" className="selection-button patient-button">
            Continue as Patient
          </Link>
        </div>
        
        <div className="selection-card">
          <div className="card-icon volunteer-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h2>I Want to Help</h2>
          <p>Register as a volunteer to support fellow students who need assistance</p>
          <Link to="/register/volunteer" className="selection-button volunteer-button">
            Continue as Volunteer
          </Link>
        </div>
      </div>
      
      <div className="info-section">
        <h3>How It Works</h3>
        <div className="info-steps">
          <div className="info-step">
            <div className="step-number">1</div>
            <p>Create an account as either a student with special needs or a volunteer</p>
          </div>
          <div className="info-step">
            <div className="step-number">2</div>
            <p>Students can submit requests for specific assistance on campus</p>
          </div>
          <div className="info-step">
            <div className="step-number">3</div>
            <p>Volunteers browse and accept requests they can help with</p>
          </div>
          <div className="info-step">
            <div className="step-number">4</div>
            <p>Connect and coordinate support through our secure platform</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSelection;