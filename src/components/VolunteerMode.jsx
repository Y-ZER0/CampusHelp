import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import '../styling/VolunteerMode.css';

const VolunteerMode = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Initialize with empty array instead of demo data
  const [assistanceRequests, setAssistanceRequests] = useState([]);

  // Load assistance requests from API data or localStorage
  useEffect(() => {
    // First check for API data stored by Dashboard
    const apiRequests = localStorage.getItem('apiAssistanceRequests');
    if (apiRequests) {
      try {
        const parsedApiRequests = JSON.parse(apiRequests);
        setAssistanceRequests(parsedApiRequests);
        // Clear the API data after using it
        localStorage.removeItem('apiAssistanceRequests');
      } catch (error) {
        console.error('Error parsing API requests:', error);
      }
    } else {
      // Fallback to saved assistance requests from localStorage (user-created requests)
      const savedRequests = localStorage.getItem('assistanceRequests');
      if (savedRequests) {
        setAssistanceRequests(prev => {
          // Create a map of existing requests by ID to avoid duplicates
          const existingIds = new Map(prev.map(req => [req.id, true]));
          // Filter saved requests to only include those not already in state
          const newRequests = JSON.parse(savedRequests).filter(req => !existingIds.has(req.id));
          return [...prev, ...newRequests];
        });
      }
    }
  }, []);

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

  // Show all open requests
  const openRequests = assistanceRequests.filter(req => req.status === 'open');

  return (
    <div className="volunteer-container">
      <div className="volunteer-header">
        <h1>{t('volunteerDashboard')}</h1>
        <p>{t('viewRequests')}</p>
      </div>

      <div className="mode-switcher">
        <Link to="/dashboard" className="btn-secondary">
          {t('backToDashboard')}
        </Link>
      </div>

      <div className="requests-section">
        <h2>{t('openRequests')}</h2>
        {openRequests.length === 0 ? (
          <div className="no-requests">
            <p>{t('noRequests')}</p>
          </div>
        ) : (
          <div className="requests-grid">
            {openRequests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <span className="request-category">{request.categoryLabel}</span>
                  {request.requestedBy === user.id && (
                    <span className="request-own-tag">{t('yourRequest')}</span>
                  )}
                </div>
                <h3>{request.name}</h3>
                <div className="request-details">
                  <p><strong>{t('date')}:</strong> {request.date}</p>
                  <p><strong>{t('time')}:</strong> {request.time}</p>
                  <p><strong>{t('location')}:</strong> {request.location}</p>
                  <p className="request-description">{request.description}</p>
                  {request.requestedBy !== user.id ? (
                    <p className="request-contact"><strong>{t('contact')}:</strong> <a href={`tel:${request.phone}`}>{request.phone || 'No phone provided'}</a></p>
                  ) : (
                    <div className="own-request-notice">
                      {t('ownRequestNotice')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="volunteer-info-section">
        <h3>{t('volunteerGuidelines')}</h3>
        <div className="info-steps">
          <div className="info-step">
            <div className="step-number">1</div>
            <p>{t('guideline1')}</p>
          </div>
          <div className="info-step">
            <div className="step-number">2</div>
            <p>{t('guideline2')}</p>
          </div>
          <div className="info-step">
            <div className="step-number">3</div>
            <p>{t('guideline3')}</p>
          </div>
          <div className="info-step">
            <div className="step-number">4</div>
            <p>{t('guideline4')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerMode;