import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import '../styling/Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [authError, setAuthError] = useState(false); // Track authentication errors
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // Function to fetch current user from API
    const fetchCurrentUser = async () => {
      try {
        // First, check if we have user data in localStorage as a fallback
        const localUserData = localStorage.getItem('user');
        
        // Make API call to get current user information
        const response = await fetch('/api/currentUser', {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            // Include authentication headers if you're using tokens
            // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          // Include credentials if using cookies for authentication
          credentials: 'include',
        });

        if (response.ok) {
          // Successfully got user data from API
          const apiUserData = await response.json();
          setUser(apiUserData);
          
          // Update localStorage with fresh data from server
          localStorage.setItem('user', JSON.stringify(apiUserData));
          setAuthError(false);
        } else if (response.status === 401 || response.status === 403) {
          // Authentication failed - user is not logged in or session expired
          console.log('Authentication failed, clearing local data');
          localStorage.removeItem('user');
          localStorage.removeItem('authToken'); // Remove token if using token-based auth
          setAuthError(true);
        } else {
          // Other API error - fall back to localStorage if available
          console.warn('Failed to fetch current user, using localStorage fallback');
          if (localUserData) {
            setUser(JSON.parse(localUserData));
          } else {
            setAuthError(true);
          }
        }
      } catch (error) {
        // Network error or other exception
        console.error('Error fetching current user:', error);
        
        // Fall back to localStorage data if network request fails
        const localUserData = localStorage.getItem('user');
        if (localUserData) {
          console.log('Using localStorage fallback due to network error');
          setUser(JSON.parse(localUserData));
        } else {
          setAuthError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    // Call the function when component mounts
    fetchCurrentUser();
  }, []); // Empty dependency array means this runs once on mount

  // Function to fetch requests from API and navigate to volunteer mode
  const handleEnterVolunteerMode = async () => {
    setIsLoadingRequests(true);
    
    try {
      const response = await fetch('/api/requests', {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          // Include auth headers if needed
          // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        credentials: 'include', // Include cookies if using cookie-based auth
      });

      if (response.ok) {
        const apiRequests = await response.json();
        
        // Transform API data to match the expected format in VolunteerMode
        const transformedRequests = apiRequests.map(request => ({
          id: request.creatorId.toString(),
          name: request.creatorName,
          category: getCategoryFromLocation(request.location), // Helper function to determine category
          categoryLabel: getCategoryLabel(request.location),
          date: request.requestedDate,
          time: formatTime(request.requestedTime),
          location: request.location,
          description: request.requestBody,
          phone: request.creatorName, // You might need to adjust this based on your data structure
          status: 'open',
          requestedBy: request.creatorId
        }));

        // Store the fetched requests in localStorage to be used by VolunteerMode
        localStorage.setItem('apiAssistanceRequests', JSON.stringify(transformedRequests));
        
        // Navigate to volunteer mode
        navigate('/volunteer-mode');
      } else if (response.status === 401 || response.status === 403) {
        // Authentication failed while trying to fetch requests
        console.error('Authentication failed while fetching requests');
        setAuthError(true);
      } else {
        console.error('Failed to fetch requests:', response.statusText);
        // Still navigate to volunteer mode, it will use default data
        navigate('/volunteer-mode');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      // Still navigate to volunteer mode, it will use default data
      navigate('/volunteer-mode');
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Enhanced logout function that also calls server-side logout if available
  const handleLogout = async () => {
    try {
      // Optional: Call server-side logout endpoint to invalidate session
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.log('Server logout failed, proceeding with client-side logout');
    } finally {
      // Always clear local data regardless of server response
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('apiAssistanceRequests');
      window.location.href = '/';
    }
  };

  // Helper function to determine category based on location or other criteria
  const getCategoryFromLocation = (location) => {
    const locationLower = location.toLowerCase();
    if (locationLower.includes('library') || locationLower.includes('research')) {
      return 'mobility';
    } else if (locationLower.includes('science') || locationLower.includes('lecture')) {
      return 'note_taking';
    } else if (locationLower.includes('student center') || locationLower.includes('materials')) {
      return 'reading';
    }
    return 'other';
  };

  // Helper function to get category label
  const getCategoryLabel = (location) => {
    const category = getCategoryFromLocation(location);
    switch (category) {
      case 'mobility':
        return t('mobilityImpairment');
      case 'note_taking':
        return t('noteTaking');
      case 'reading':
        return t('readingMaterials');
      default:
        return t('otherAssistance');
    }
  };

  // Helper function to format time from the API structure
  const formatTime = (timeObj) => {
    if (!timeObj) return '12:00 PM';
    
    const { hour = 0, minute = 0 } = timeObj;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    
    return `${displayHour}:${displayMinute} ${period}`;
  };

  // If authentication failed or user is not logged in, redirect to login
  if (!loading && (authError || !user)) {
    return <Navigate to="/login" />;
  }

  // Show loading state while fetching user data
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
          <button 
            onClick={handleEnterVolunteerMode}
            className="btn-primary"
            disabled={isLoadingRequests}
          >
            {isLoadingRequests ? t('loading') : t('enterVolunteerMode')}
          </button>
        </div>

        <div className="mode-card">
          <div className="mode-icon">🙋</div>
          <h2>{t('requestAssistance')}</h2>
          <p>{t('getHelp')}</p>
          <p className="mode-description">
            {t('requestDescription')}
          </p>
          <Link to="/patient-mode" className="btn-primary">{t('enterRequestMode')}</Link>
        </div>
      </div>

      <div className="dashboard-actions">
        <button 
          className="btn-secondary" 
          onClick={handleLogout}
        >
          {t('logOut')}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;