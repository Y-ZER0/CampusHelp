import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import '../styling/Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

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
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{t('welcomeBack', { name: user.firstName })}</h1>
        <p>{t('choosePlatform')}</p>
      </div>

      <div className="mode-selection">
        <div className="mode-card">
          <div className="mode-icon">🤝</div>
          <h2>{t('volunteerMode')}</h2>
          <p>{t('helpStudents')}</p>
          <p className="mode-description">
            {t('volunteerDescription')}
          </p>
          <Link to="/volunteer-mode" className="btn-primary">{t('enterVolunteerMode')}</Link>
        </div>

        <div className="mode-card">
          <div className="mode-icon">🙋</div>
          <h2>{t('requestAssistance')}</h2>
          <p>{t('getHelp')}</p>
          <p className="mode-description">
            {t('requestDescription')}
          </p>
          <Link to="/patient-mode" className="btn-primary">{t('requestAssistance')}</Link>
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
          {t('logOut')}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;