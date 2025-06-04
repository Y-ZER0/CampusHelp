import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import '../styling/VolunteerMode.css';


  const API_BASE_URL = "https://hci-proj-backend.onrender.com";

// const API_BASE_URL = "http://localhost:8080"; // Or your backend URL

const VolunteerMode = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assistanceRequests, setAssistanceRequests] = useState([]);

  // Fetch open requests from API on mount
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/apis/requests`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const apiRequests = await response.json();
          console.log('API returned:', apiRequests);
          // Optionally transform the API data to match your frontend format
          const transformedRequests = apiRequests.map((request, index) => ({
            id: request.id,
            name: request.creatorName || 
                  (request.user?.firstName || '') + ' ' + (request.user?.lastName || '') || 
                  request.user?.username || 
                  request.user?.email?.split('@')[0] || 
                  'Anonymous User',
            category: request.category || 'general',
            categoryLabel: request.categoryLabel || 'General Assistance',
            date: request.requestedDate || new Date().toISOString().split('T')[0],
            time: request.requestedTime,
            location: request.location || 'Not specified',
            description: request.requestBody || 'No description provided',
            phone: request.user.phoneNumber || request.user?.mobile || 'Contact via platform',
            status: request.status || 'open',
            requestedBy: request.creatorId || request.userId || 'unknown',
            userInfo: request.user || {},
          }));
          setAssistanceRequests(transformedRequests);
          console.log('Transformed Requests:', transformedRequests);
          // Optionally update localStorage for offline/other tab sync
          localStorage.setItem('apiAssistanceRequests', JSON.stringify(transformedRequests));
        } else {
          // fallback to localStorage if API fails
          const apiRequests = JSON.parse(localStorage.getItem('apiAssistanceRequests') || '[]');
          setAssistanceRequests(apiRequests);
        }
      } catch (error) {
        // fallback to localStorage if fetch fails
        const apiRequests = JSON.parse(localStorage.getItem('apiAssistanceRequests') || '[]');
        setAssistanceRequests(apiRequests);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
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
            {openRequests.map(request => {
              // FIXED: Enhanced getUserName function with comprehensive fallback logic
              const getUserName = (request) => {
                if (request.creatorName && request.creatorName.trim() !== '') return request.creatorName;
                if (request.userInfo?.firstName || request.userInfo?.lastName)
                  return `${request.userInfo.firstName || ''} ${request.userInfo.lastName || ''}`.trim();
                if (request.userInfo?.username) return request.userInfo.username;
                return 'Anonymous User';
              };

              const getRequestUserId = (request) => {
                // Return multiple possible identifiers for comparison
                return {
                  primary: request.requestedBy || request.userInfo?.id || request.userInfo?.username,
                  alternatives: [
                    request.userInfo?.username,
                    request.userInfo?.id,
                    request.userInfo?.email,
                    request.requestedBy,
                    request.id
                  ].filter(Boolean) // Remove null/undefined values
                };
              };

              // FIXED: Enhanced ownership check
              const isOwnRequest = (request, currentUser) => {
                const requestUserIds = getRequestUserId(request);
                const currentUserIds = [
                  currentUser.id,
                  currentUser.username,
                  currentUser.email,
                  currentUser._id,
                  currentUser.userId
                ].filter(Boolean); // Remove null/undefined values
                
                // Check if any of the current user's IDs match any of the request's user IDs
                return currentUserIds.some(userId => 
                  userId === requestUserIds.primary || 
                  requestUserIds.alternatives.includes(userId)
                );
              };

               const userName = getUserName(request);
              const isOwn = isOwnRequest(request, user);

              // Debug logging to help troubleshoot
              console.log('Request processing:', {
                requestId: request.id,
                userName: userName,
                isOwn: isOwn,
                requestUserInfo: request.userInfo,
                currentUser: user
              });

              return (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <span className="request-category">
                      {request.categoryLabel || request.category || 'General Assistance'}
                    </span>
                    {isOwn && (
                      <span className="request-own-tag">{t('yourRequest') || 'Your Request'}</span>
                    )}
                  </div>
                  <h3>{request.name}</h3>
                  <div className="request-details">
                    <p><strong>{t('date') || 'Date'}:</strong> {request.date || request.requestedDate || 'Not specified'}</p>
                    <p><strong>{t('time') || 'Time'}:</strong> {request.time || request.requestedTime || 'Not specified'}</p>
                    <p><strong>{t('location') || 'Location'}:</strong> {request.location || 'Not specified'}</p>
                    <p className="request-description">
                      {request.description || request.requestBody || 'No description provided'}
                    </p>
                    {!isOwn ? (
                      <p className="request-contact">
                        <strong>{t('contact') || 'Contact'}:</strong>
                        <a href={`tel:${request.phone}`}>
                          {request.phone || request.phoneNumber}
                        </a>
                      </p>
                    ) : (
                      <div className="own-request-notice">
                        {t('ownRequestNotice') || 'This is your own request. Wait for a volunteer to contact you.'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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