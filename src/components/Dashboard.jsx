import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import '../styling/Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [authError, setAuthError] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // Function to get current user from localStorage (matches login flow)
    const getCurrentUser = () => {
      try {
        const localUserData = localStorage.getItem('user');
        
        if (localUserData) {
          const userData = JSON.parse(localUserData);
          
          // Validate that user data contains required fields
          if (userData.isLoggedIn && userData.username) {
            setUser(userData);
            setAuthError(false);
          } else {
            // Invalid user data structure
            console.log('Invalid user data structure, clearing localStorage');
            localStorage.removeItem('user');
            setAuthError(true);
          }
        } else {
          // No user data found
          setAuthError(true);
        }
      } catch (error) {
        // Error parsing user data
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        setAuthError(true);
      } finally {
        setLoading(false);
      }
    };

    // Listen for storage changes (useful if user logs out in another tab)
    const handleStorageChange = () => {
      getCurrentUser();
    };

    window.addEventListener('storage', handleStorageChange);
    getCurrentUser();

    // Cleanup event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Function to fetch requests from API and navigate to volunteer mode
  const handleEnterVolunteerMode = async () => {
  setIsLoadingRequests(true);
  
  try {
    // Use the same API base URL as the login component
      const API_BASE_URL = "https://hci-proj-backend.onrender.com";

    // const API_BASE_URL = "http://localhost:8080";    
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const apiRequests = await response.json();
      console.log('Raw API response:', apiRequests); // Debug log
      
      // Transform API data to match the expected format in VolunteerMode
      const transformedRequests = apiRequests.map((request, index) => ({
        id: request.id || request._id || `api-${index}`, // Use API ID or fallback
        name: request.creatorName || 'Anonymous User',
        category: getCategoryFromDescription(request.requestBody || ''),
        categoryLabel: getCategoryLabelFromDescription(request.requestBody || ''),
        date: request.requestedDate || new Date().toISOString().split('T')[0],
        time: formatTimeString(request.requestedTime), // Handle string time format
        location: request.location || 'Not specified',
        description: request.requestBody || 'No description provided',
        phone: request.creatorContact || request.creatorName || 'Contact via platform',
        status: 'open',
        requestedBy: request.creatorId || request.userId || 'unknown'
      }));

      // Store the fetched requests in localStorage to be used by VolunteerMode
      localStorage.setItem('apiAssistanceRequests', JSON.stringify(transformedRequests));
      
      console.log(`Fetched and transformed ${transformedRequests.length} requests from API`);
      console.log('Transformed requests:', transformedRequests); // Debug log
    } else {
      console.warn(`Failed to fetch requests from API (${response.status}), using default data`);
    }
    
    // Navigate to volunteer mode regardless of API success/failure
    navigate('/volunteer-mode');
    
  } catch (error) {
    console.error('Error fetching requests:', error);
    // Still navigate to volunteer mode, it will use default data
    navigate('/volunteer-mode');
  } finally {
    setIsLoadingRequests(false);
  }
};

const getCategoryFromDescription = (description) => {
  if (!description) return 'other';
  
  const descLower = description.toLowerCase();
  if (descLower.includes('mobility') || descLower.includes('wheelchair') || descLower.includes('walking') || descLower.includes('movement')) {
    return 'mobility';
  } else if (descLower.includes('note') || descLower.includes('writing') || descLower.includes('lecture') || descLower.includes('class')) {
    return 'note_taking';
  } else if (descLower.includes('reading') || descLower.includes('text') || descLower.includes('book') || descLower.includes('material')) {
    return 'reading';
  }
  return 'other';
};

const getCategoryLabelFromDescription = (description) => {
  const category = getCategoryFromDescription(description);
  switch (category) {
    case 'mobility':
      return t('mobilityImpairment') || 'Mobility Assistance';
    case 'note_taking':
      return t('noteTaking') || 'Note Taking';
    case 'reading':
      return t('readingMaterials') || 'Reading Materials';
    default:
      return t('otherAssistance') || 'Other Assistance';
  }
};

const formatTimeString = (timeValue) => {
  if (!timeValue) return '12:00 PM';
  
  try {
    // If it's already a formatted string, return it
    if (typeof timeValue === 'string') {
      // Check if it's already in 12-hour format
      if (timeValue.toLowerCase().includes('am') || timeValue.toLowerCase().includes('pm')) {
        return timeValue;
      }
      
      // If it's in 24-hour format (HH:MM or HH:MM:SS), convert to 12-hour
      const timeMatch = timeValue.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        const minute = timeMatch[2];
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minute} ${period}`;
      }
      
      // Return as-is if it doesn't match expected patterns
      return timeValue;
    }
    
    // Handle object format (legacy support)
    if (typeof timeValue === 'object' && timeValue.hour !== undefined) {
      const { hour = 0, minute = 0 } = timeValue;
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const displayMinute = minute.toString().padStart(2, '0');
      return `${displayHour}:${displayMinute} ${period}`;
    }
    
    return timeValue.toString();
  } catch (error) {
    console.error('Error formatting time:', error);
    return '12:00 PM';
  }
};

  // Simple logout function that clears localStorage
  const handleLogout = () => {
    // Clear all stored user data
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('apiAssistanceRequests');
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storage'));
    
    // Redirect to home page
    navigate('/');
  };

  // Helper function to determine category based on location
  const getCategoryFromLocation = (location) => {
    if (!location) return 'other';
    
    const locationLower = location.toLowerCase();
    if (locationLower.includes('library') || locationLower.includes('research') || locationLower.includes('mobility')) {
      return 'mobility';
    } else if (locationLower.includes('science') || locationLower.includes('lecture') || locationLower.includes('note')) {
      return 'note_taking';
    } else if (locationLower.includes('student center') || locationLower.includes('materials') || locationLower.includes('reading')) {
      return 'reading';
    }
    return 'other';
  };

  // Helper function to get category label
  const getCategoryLabel = (location) => {
    const category = getCategoryFromLocation(location);
    switch (category) {
      case 'mobility':
        return t('mobilityImpairment') || 'Mobility Assistance';
      case 'note_taking':
        return t('noteTaking') || 'Note Taking';
      case 'reading':
        return t('readingMaterials') || 'Reading Materials';
      default:
        return t('otherAssistance') || 'Other Assistance';
    }
  };

  // Helper function to format time from the API structure
  const formatTime = (timeObj) => {
    if (!timeObj) return '12:00 PM';
    
    try {
      if (typeof timeObj === 'string') {
        // If it's already a formatted string, return it
        return timeObj;
      }
      
      const { hour = 0, minute = 0 } = timeObj;
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const displayMinute = minute.toString().padStart(2, '0');
      
      return `${displayHour}:${displayMinute} ${period}`;
    } catch (error) {
      return '12:00 PM';
    }
  };

  // If authentication failed or user is not logged in, redirect to login
  if (!loading && (authError || !user)) {
    return <Navigate to="/login" />;
  }

  // Show loading state while checking user data
  if (loading) {
    return <div className="loading">{t('loading') || 'Loading...'}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{t('welcomeBack', { name: user.firstName || user.username }) || `Welcome back, ${user.firstName || user.username}!`}</h1>
        <p>{t('choosePlatform') || 'Choose your platform below'}</p>
      </div>

      <div className="mode-selection">
        <div className="mode-card">
          <div className="mode-icon">🤝</div>
          <h2>{t('volunteerMode') || 'Volunteer Mode'}</h2>
          <p>{t('helpStudents') || 'Help students in need'}</p>
          <p className="mode-description">
            {t('volunteerDescription') || 'Browse and respond to assistance requests from fellow students'}
          </p>
          <button 
            onClick={handleEnterVolunteerMode}
            className="btn-primary"
            disabled={isLoadingRequests}
          >
            {isLoadingRequests ? (t('loading') || 'Loading...') : (t('enterVolunteerMode') || 'Enter Volunteer Mode')}
          </button>
        </div>

        <div className="mode-card">
          <div className="mode-icon">🙋</div>
          <h2>{t('requestAssistance') || 'Request Assistance'}</h2>
          <p>{t('getHelp') || 'Get help from volunteers'}</p>
          <p className="mode-description">
            {t('requestDescription') || 'Submit a request for assistance and connect with helpful volunteers'}
          </p>
          <Link to="/patient-mode" className="btn-primary">
            {t('enterRequestMode') || 'Enter Request Mode'}
          </Link>
        </div>
      </div>

      <div className="dashboard-actions">
        <button 
          className="btn-secondary" 
          onClick={handleLogout}
        >
          {t('logOut') || 'Log Out'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;