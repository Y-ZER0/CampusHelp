import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import '../styling/PatientMode.css';

// Define the API base URL - this is crucial for connecting to your backend
const API_BASE_URL = "https://hci-proj-backend.onrender.com";

const PatientMode = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Simplified form data structure matching the new API schema
  const [formData, setFormData] = useState({
    requestBody: '',      // Replaces description field
    location: '',         // Stays the same
    requestedDate: '',    // Stays the same (YYYY-MM-DD format)
    requestedTime: '',    // Changed to string - now accepts free-form text input
  });
  
  const [errors, setErrors] = useState({});
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [userRequests, setUserRequests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Load user's requests from localStorage - FIXED: Better synchronization
  useEffect(() => {
    if (user) {
      const loadUserRequests = () => {
        // Load from both sources and merge properly
        let allRequests = [];
        
        // Load from regular assistance requests
        const existingRequests = JSON.parse(localStorage.getItem('assistanceRequests') || '[]');
        const userRegularRequests = existingRequests.filter(
          req => (req.requestedBy === user.id || req.requestedBy === user.username) && req.status === 'open'
        );
        allRequests = [...userRegularRequests];
        
        // Load from API requests cache
        const apiRequests = JSON.parse(localStorage.getItem('apiAssistanceRequests') || '[]');
        const userApiRequests = apiRequests.filter(
          req => (req.requestedBy === user.id || req.requestedBy === user.username) && req.status === 'open'
        );
        
        // Merge without duplicates based on serverId or id
        const existingIds = new Set(allRequests.map(req => req.serverId || req.id));
        const newApiRequests = userApiRequests.filter(req => !existingIds.has(req.serverId || req.id));
        allRequests = [...allRequests, ...newApiRequests];
        
        setUserRequests(allRequests);
      };
      
      loadUserRequests();
      
      // Listen for storage changes
      const handleStorageChange = () => {
        loadUserRequests();
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [user, requestSubmitted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Helper function to validate time format when entered as string
  const isValidTimeFormat = (timeString) => {
    if (!timeString || timeString.trim() === '') return false;
    
    // Allow various time formats: "2:30 PM", "14:30", "2:30pm", "14:30:00", etc.
    const timePatterns = [
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // 24-hour format HH:MM
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, // 24-hour format HH:MM:SS
      /^(1[0-2]|0?[1-9]):[0-5][0-9]\s?(AM|PM|am|pm)$/, // 12-hour format with AM/PM
      /^(1[0-2]|0?[1-9]):[0-5][0-9]:[0-5][0-9]\s?(AM|PM|am|pm)$/ // 12-hour format with seconds
    ];
    
    return timePatterns.some(pattern => pattern.test(timeString.trim()));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all required fields based on new schema
    if (!formData.requestBody?.trim()) {
      newErrors.requestBody = t('descriptionRequired') || 'Request description is required';
    }
    
    if (!formData.location?.trim()) {
      newErrors.location = t('locationRequired') || 'Location is required';
    }
    
    if (!formData.requestedDate) {
      newErrors.requestedDate = t('dateRequired') || 'Date is required';
    }
    
    if (!formData.requestedTime?.trim()) {
      newErrors.requestedTime = t('timeRequired') || 'Time is required';
    } else if (!isValidTimeFormat(formData.requestedTime)) {
      // Provide helpful error message for string time input
      newErrors.requestedTime = t('timeFormatError') || 'Please enter a valid time (e.g., "2:30 PM", "14:30", or "2:30pm")';
    }
    
    // Date validation (must be today or in the future)
    if (formData.requestedDate) {
      const selectedDate = new Date(formData.requestedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.requestedDate = t('futureDateRequired') || 'Please select today or a future date';
      }
    }
    
    return newErrors;
  };

  /**
   * Transform form data to match the exact API schema
   * This function now handles string-based time input
   */
  const transformFormDataToApiFormat = (formData) => {
    // Since requestedTime is now a string, we pass it as-is to the API
    let processedTime = formData.requestedTime.trim();
    
    // Create the API payload matching the expected schema exactly
    return {
      requestBody: formData.requestBody.trim(),
      location: formData.location.trim(),
      requestedDate: formData.requestedDate, // Already in YYYY-MM-DD format
      requestedTime: processedTime // Now passed as string without conversion
    };
  };

  // FIXED: Enhanced storage update function that ensures proper synchronization
  const updateLocalStorage = (newRequest) => {
    // Update both storage locations with proper data structure
    const existingRequests = JSON.parse(localStorage.getItem('assistanceRequests') || '[]');
    existingRequests.push(newRequest);
    localStorage.setItem('assistanceRequests', JSON.stringify(existingRequests));
    
    // Also update the API requests cache for immediate volunteer view
    const existingApiRequests = JSON.parse(localStorage.getItem('apiAssistanceRequests') || '[]');
    existingApiRequests.push(newRequest);
    localStorage.setItem('apiAssistanceRequests', JSON.stringify(existingApiRequests));
    
    // Trigger multiple storage events to ensure all components are notified
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'assistanceRequests',
      newValue: JSON.stringify(existingRequests)
    }));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'apiAssistanceRequests', 
      newValue: JSON.stringify(existingApiRequests)
    }));
    
    // Force a page refresh of volunteer mode if it's open in another tab
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 100);
  };

  /**
   * FIXED: Enhanced handleSubmit function with better error handling and data synchronization
   */
 // FIXED: Enhanced handleSubmit function with better user identification
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const newErrors = validateForm();
  
  if (Object.keys(newErrors).length === 0) {
    setIsSubmitting(true);
    
    try {
      const apiRequestData = transformFormDataToApiFormat(formData);
      const apiUrl = `${API_BASE_URL}/apis/create`;
      
      console.log('Sending API request to:', apiUrl);
      console.log('Request payload:', apiRequestData);
      console.log('Current user data:', user); // Debug log to see user structure
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestData)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Success response:', responseData);
        
        // FIXED: Enhanced user name determination with multiple fallbacks
        const getUserDisplayName = (user) => {
          // Try different combinations of user data
          if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`.trim();
          } else if (user.firstName) {
            return user.firstName;
          } else if (user.lastName) {
            return user.lastName;
          } else if (user.username) {
            return user.username;
          } else if (user.email) {
            // Extract username from email if needed
            return user.email.split('@')[0];
          } else {
            return 'Anonymous User';
          }
        };

        // FIXED: Enhanced user ID determination
        const getUserId = (user) => {
          return user.id || user._id || user.userId || user.username || user.email || `user-${Date.now()}`;
        };

        // FIXED: Create a comprehensive local representation with enhanced user identification
        const newRequest = {
          // Use API ID if available, fallback to timestamp
          id: responseData.id || responseData._id || `req-${Date.now()}`,
          serverId: responseData.id || responseData._id, // Track server ID separately
          
          // FIXED: Enhanced user identification with multiple approaches
          name: getUserDisplayName(user),
          requestedBy: getUserId(user),
          
          // Request details - Map all fields properly
          category: getCategoryFromDescription(formData.requestBody),
          categoryLabel: getCategoryLabelFromDescription(formData.requestBody),
          date: formData.requestedDate,
          time: formData.requestedTime,
          location: formData.location,
          description: formData.requestBody,
          requestBody: formData.requestBody, // Keep both for compatibility
          requestedDate: formData.requestedDate, // Keep both for compatibility  
          requestedTime: formData.requestedTime, // Keep both for compatibility
          
          // FIXED: Enhanced contact information with fallbacks
          phone: user.phone || user.mobile || user.email || 'Contact via platform',
          
          // Status and metadata
          status: 'open',
          submittedAt: new Date().toISOString(),
          
          // FIXED: Complete user info with all possible fields for better identification
          userInfo: {
            id: getUserId(user),
            username: user.username || user.email?.split('@')[0] || 'anonymous',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || user.mobile || '',
            // Add display name for easy access
            displayName: getUserDisplayName(user),
            // Add all original user data for debugging
            originalUserData: { ...user }
          },
          
          // Additional metadata for tracking
          source: 'patient-form',
          apiSubmitted: true,
          
          // FIXED: Add timestamp for better tracking
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        
        console.log('Created request object:', newRequest); // Debug log
        
        // Use the enhanced storage update function
        updateLocalStorage(newRequest);
        
        console.log('Request saved successfully:', newRequest);
        
        // Reset form
        setFormData({
          requestBody: '',
          location: '',
          requestedDate: '',
          requestedTime: '',
        });
        
        setRequestSubmitted(true);
        setTimeout(() => setRequestSubmitted(false), 5000);
        
      } else {
        // Enhanced error handling
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error Response:', errorData);
        alert(`Failed to submit request: ${errorData.error || errorData.message || 'Unknown error'}\nStatus: ${response.status}`);
      }
      
    } catch (error) {
      console.error('Error submitting request:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert(`Network error: Unable to connect to the server at ${API_BASE_URL}. Please check that your backend is running.`);
      } else {
        alert(`There was an error submitting your request: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  } else {
    setErrors(newErrors);
  }
};

  // Helper functions for categorizing requests
  const getCategoryFromDescription = (description) => {
    if (!description) return 'other';
    
    const descLower = description.toLowerCase();
    if (descLower.includes('mobility') || descLower.includes('wheelchair') || descLower.includes('walking')) {
      return 'mobility';
    } else if (descLower.includes('note') || descLower.includes('writing') || descLower.includes('lecture')) {
      return 'note_taking';
    } else if (descLower.includes('reading') || descLower.includes('text') || descLower.includes('book')) {
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

  /**
   * FIXED: Enhanced delete request function with better API handling
   */
  const handleDeleteRequest = async (requestId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this request? Only delete if you've been contacted by a volunteer and no longer need assistance."
    );
    
    if (confirmDelete) {
      try {
        // Find the request to get its server ID
        const request = userRequests.find(req => req.id === requestId);
        const serverIdToDelete = request?.serverId || requestId;
        
        // Try to call the backend DELETE endpoint
        const apiUrl = `${API_BASE_URL}/apis/${serverIdToDelete}`;
        
        let response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
          }
        });
        
        // If DELETE endpoint doesn't exist, try the complete endpoint as alternative
        if (response.status === 404) {
          console.log('DELETE endpoint not found, trying PATCH complete endpoint...');
          response = await fetch(`${API_BASE_URL}/apis/${serverIdToDelete}/complete`, {
            method: 'PATCH',
            headers: {
              'accept': '*/*',
              'Content-Type': 'application/json',
            }
          });
        }
        
        // Update local storage regardless of API response (for better UX)
        const updateLocalStorageAfterDelete = (requestId) => {
          // Update assistanceRequests
          const existingRequests = JSON.parse(localStorage.getItem('assistanceRequests') || '[]');
          const updatedRequests = existingRequests.filter(req => req.id !== requestId && req.serverId !== requestId);
          localStorage.setItem('assistanceRequests', JSON.stringify(updatedRequests));
          
          // Update apiAssistanceRequests  
          const existingApiRequests = JSON.parse(localStorage.getItem('apiAssistanceRequests') || '[]');
          const updatedApiRequests = existingApiRequests.filter(req => req.id !== requestId && req.serverId !== requestId);
          localStorage.setItem('apiAssistanceRequests', JSON.stringify(updatedApiRequests));
          
          // Trigger storage events
          window.dispatchEvent(new Event('storage'));
        };
        
        if (response.ok) {
          // Success - update local state
          updateLocalStorageAfterDelete(requestId);
          setUserRequests(userRequests.filter(req => req.id !== requestId));
          alert("Your request has been deleted successfully!");
        } else if (response.status === 404) {
          // Endpoint doesn't exist - fall back to local deletion only
          console.warn('Delete endpoint not implemented on backend, updating locally only');
          updateLocalStorageAfterDelete(requestId);
          setUserRequests(userRequests.filter(req => req.id !== requestId));
          alert("Your request has been removed from your local list. Note: The backend delete endpoint is not yet implemented.");
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          alert(`Failed to delete request: ${errorData.error || 'Unknown error'}\nStatus: ${response.status}`);
        }
      } catch (error) {
        console.error('Error deleting request:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          alert(`Network error: Unable to connect to the server at ${API_BASE_URL}. Please check that your backend is running.`);
        } else {
          alert(`There was an error deleting your request: ${error.message}`);
        }
      }
    }
  };

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="patient-container">
      <div className="patient-header">
        <h1>{t('requestAssistanceTitle') || 'Request Assistance'}</h1>
        <p>{t('submitRequest') || 'Submit your assistance request'}</p>
      </div>

      <div className="mode-switcher">
        <Link to="/dashboard" className="btn-secondary">
          {t('backToDashboard') || 'Back to Dashboard'}
        </Link>
      </div>

      {requestSubmitted && (
        <div className="success-message">
          <div className="success-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{t('requestSubmitted') || 'Request submitted successfully!'}</span>
          </div>
        </div>
      )}

      {userRequests.length > 0 && (
        <div className="your-requests-section">
          <h2>{t('yourRequests') || 'Your Active Requests'}</h2>
          <div className="requests-grid">
            {userRequests.map(request => (
              <div key={request.id} className="request-card your-request">
                <div className="request-header">
                  <span className="request-category">{t('assistanceRequest') || 'Assistance Request'}</span>
                  <span className="request-status">{t('active') || 'Active'}</span>
                </div>
                <div className="request-details">
                  <p><strong>{t('date') || 'Date'}:</strong> {request.requestedDate}</p>
                  <p><strong>{t('time') || 'Time'}:</strong> {request.requestedTime}</p>
                  <p><strong>{t('location') || 'Location'}:</strong> {request.location}</p>
                  <p className="request-description">{request.requestBody}</p>
                </div>
                <div className="request-actions">
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteRequest(request.id)}
                  >
                    {t('deleteRequest') || 'Delete Request'}
                  </button>
                </div>
                <div className="request-info">
                  <p className="request-note">
                    {t('deleteNote') || 'Only delete if you no longer need assistance'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="request-form-card">
        <form className="request-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="requestBody">{t('descriptionNeeded') || 'Description of Assistance Needed'}*</label>
            <textarea
              id="requestBody"
              name="requestBody"
              value={formData.requestBody}
              onChange={handleChange}
              placeholder={t('descriptionPlaceholder') || 'Please describe what assistance you need...'}
              rows="4"
              className={errors.requestBody ? 'error' : ''}
              disabled={isSubmitting}
            ></textarea>
            {errors.requestBody && <div className="error-message">{errors.requestBody}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="location">{t('location') || 'Location'}*</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Building and room number or meeting location"
              className={errors.location ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.location && <div className="error-message">{errors.location}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="requestedDate">{t('date') || 'Date'}*</label>
              <input
                type="date"
                id="requestedDate"
                name="requestedDate"
                value={formData.requestedDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={errors.requestedDate ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.requestedDate && <div className="error-message">{errors.requestedDate}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="requestedTime">{t('time') || 'Time'}*</label>
              <input
                type="text"
                id="requestedTime"
                name="requestedTime"
                value={formData.requestedTime}
                onChange={handleChange}
                placeholder="e.g., 2:30 PM, 14:30, or 2:30pm"
                className={errors.requestedTime ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.requestedTime && <div className="error-message">{errors.requestedTime}</div>}
            </div>
          </div>
          
          <div className="form-note">
            <p>{t('requestNote') || 'Your request will be reviewed and matched with available volunteers.'}</p>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (t('submittingRequest') || 'Submitting...') : (t('submitRequestButton') || 'Submit Request')}
            </button>
          </div>
        </form>
      </div>
      
      <div className="request-info-section">
        <h3>{t('whatToExpect') || 'What to Expect'}</h3>
        <div className="info-steps">
          <div className="info-step">
            <div className="step-number">1</div>
            <p>{t('step1') || 'Submit your assistance request with all required details'}</p>
          </div>
          <div className="info-step">
            <div className="step-number">2</div>
            <p>{t('step2') || 'Our system will match you with available volunteers'}</p>
          </div>
          <div className="info-step">
            <div className="step-number">3</div>
            <p>{t('step3') || 'You will be contacted by a volunteer to arrange assistance'}</p>
          </div>
          <div className="info-step">
            <div className="step-number">4</div>
            <p>{t('step4') || 'Meet with your volunteer at the specified time and location'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientMode;