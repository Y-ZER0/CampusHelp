import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import '../styling/Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // If not logged in, redirect to login
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user.firstName}!</h1>
        <p>Choose how you want to use the platform today</p>
      </div>

      <div className="mode-selection">
        <div className="mode-card">
          <div className="mode-icon">🤝</div>
          <h2>Volunteer Mode</h2>
          <p>Help students with special needs around campus</p>
          <p className="mode-description">
            View assistance requests from students and offer your help with note-taking,
            mobility assistance, study support, and more.
          </p>
          <Link to="/volunteer-mode" className="btn-primary">Enter Volunteer Mode</Link>
        </div>

        <div className="mode-card">
          <div className="mode-icon">🙋</div>
          <h2>Request Assistance</h2>
          <p>Get help from volunteers around campus</p>
          <p className="mode-description">
            Submit requests for assistance with mobility, note-taking, or other needs.
            Connect with student volunteers ready to help you
            whenever you need.
          </p>
          <Link to="/patient-mode" className="btn-primary">Request Assistance</Link>
        </div>
      </div>

      <div className="dashboard-actions">
        <button 
          className="btn-secondary" 
          onClick={() => {
            localStorage.removeItem('user');
            window.location.href = '/';
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;