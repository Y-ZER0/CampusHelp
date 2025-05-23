import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import '../styling/VolunteerMode.css';

const VolunteerMode = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assistanceRequests, setAssistanceRequests] = useState([
    {
      id: '1',
      name: 'Alex Johnson',
      category: 'mobility',
      categoryLabel: t('mobilityImpairment'),
      date: '2025-05-15',
      time: '10:00 AM',
      location: 'Main Campus Library',
      description: 'Need assistance navigating to the third floor research section and carrying materials.',
      phone: '(+962) 123-4567',
      status: 'open'
    },
    {
      id: '2',
      name: 'Jamie Smith',
      category: 'note_taking',
      categoryLabel: t('noteTaking'),
      date: '2025-05-16',
      time: '2:30 PM',
      location: 'Science Building, Room 203',
      description: 'Looking for someone to take notes during Physics lecture. I have hearing impairment and miss some content.',
      phone: '(+962) 987-6543',
      status: 'open'
    },
    {
      id: '3',
      name: 'Casey Wilson',
      category: 'reading',
      categoryLabel: t('readingMaterials'),
      date: '2025-05-17',
      time: '1:00 PM',
      location: 'Student Center',
      description: 'Need help reading through course materials due to visual impairment.',
      phone: '(+962) 456-7890',
      status: 'open'
    }
  ]);

  // Load any saved assistance requests from localStorage
  useEffect(() => {
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