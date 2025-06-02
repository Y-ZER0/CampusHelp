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
    const loadRequests = () => {
      let allRequests = [];
      
      // First check for API data stored by Dashboard
      const apiRequests = localStorage.getItem('apiAssistanceRequests');
      if (apiRequests) {
        try {
          const parsedApiRequests = JSON.parse(apiRequests);
          allRequests = [...parsedApiRequests];
        } catch (error) {
          console.error('Error parsing API requests:', error);
        }
      }
      
      // Also load saved assistance requests from localStorage
      const savedRequests = localStorage.getItem('assistanceRequests');
      if (savedRequests) {
        try {
          const parsedSavedRequests = JSON.parse(savedRequests);
          // Create a map to avoid duplicates based on ID
          const existingIds = new Map(allRequests.map(req => [req.id, true]));
          const newRequests = parsedSavedRequests.filter(req => !existingIds.has(req.id));
          allRequests = [...allRequests, ...newRequests];
        } catch (error) {
          console.error('Error parsing saved requests:', error);
        }
      }
      
      setAssistanceRequests(allRequests);
    };

    // Load requests initially
    loadRequests();

    // Listen for storage changes (when new requests are submitted)
    const handleStorageChange = (e) => {
      if (e.key === 'assistanceRequests' || e.key === 'apiAssistanceRequests' || e.key === null) {
        loadRequests();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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
    console.log('Getting user name for request:', request); // Debug log
    
    // Priority 1: Use the displayName if available (from enhanced PatientMode)
    if (request.userInfo?.displayName && request.userInfo.displayName !== 'Anonymous User') {
      return request.userInfo.displayName;
    }
    
    // Priority 2: Construct name from firstName and lastName
    if (request.userInfo?.firstName) {
      const lastName = request.userInfo.lastName ? ` ${request.userInfo.lastName}` : '';
      const fullName = `${request.userInfo.firstName}${lastName}`.trim();
      if (fullName && fullName !== 'Anonymous User') {
        return fullName;
      }
    }
    
    // Priority 3: Use the pre-constructed name field
    if (request.name && request.name !== 'Anonymous User' && request.name.trim()) {
      return request.name;
    }
    
    // Priority 4: Use username from userInfo
    if (request.userInfo?.username && request.userInfo.username !== 'anonymous') {
      return request.userInfo.username;
    }
    
    // Priority 5: Use requestedBy if it looks like a username (not an ID)
    if (request.requestedBy && 
        typeof request.requestedBy === 'string' && 
        !request.requestedBy.startsWith('user-') && 
        !request.requestedBy.includes('@') &&
        request.requestedBy.length > 2) {
      return request.requestedBy;
    }
    
    // Priority 6: Extract username from email
    if (request.userInfo?.email) {
      const emailUsername = request.userInfo.email.split('@')[0];
      if (emailUsername && emailUsername.length > 2) {
        return emailUsername;
      }
    }
    
    // Priority 7: Try to get any meaningful identifier
    if (request.userInfo?.id && typeof request.userInfo.id === 'string' && 
        !request.userInfo.id.startsWith('user-') && request.userInfo.id.length > 2) {
      return request.userInfo.id;
    }
    
    // Final fallback
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
      <h3>{userName}</h3>
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
            <a href={`tel:${request.phone || request.userInfo?.phone || ''}`}>
              {request.phone || request.userInfo?.phone || request.userInfo?.email || 'Contact via platform'}
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