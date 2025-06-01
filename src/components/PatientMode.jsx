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

  // Load user's requests from localStorage
  useEffect(() => {
    if (user) {
      const existingRequests = JSON.parse(localStorage.getItem('assistanceRequests') || '[]');
      const userOpenRequests = existingRequests.filter(
        req => req.requestedBy === user.id && req.status === 'open'
      );
      setUserRequests(userOpenRequests);
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
    // The backend can handle various time formats or we can normalize it here
    let processedTime = formData.requestedTime.trim();
    
    // Optional: Convert 12-hour format to 24-hour format for API consistency
    if (processedTime.toLowerCase().includes('pm') || processedTime.toLowerCase().includes('am')) {
      // For simplicity, we'll keep the original format and let the backend handle it
      // You could add conversion logic here if needed
    }
    
    // Create the API payload matching the expected schema exactly
    return {
      requestBody: formData.requestBody.trim(),
      location: formData.location.trim(),
      requestedDate: formData.requestedDate, // Already in YYYY-MM-DD format
      requestedTime: processedTime // Now passed as string without conversion
    };
  };

  /**
   * Enhanced handleSubmit function with the simplified API integration
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        // Transform the form data to API format
        const apiRequestData = transformFormDataToApiFormat(formData);
        
        // Construct the full API URL
        const apiUrl = `${API_BASE_URL}/apis/create`;
        
        console.log('Sending API request to:', apiUrl);
        console.log('Request payload:', apiRequestData);
        
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
          
          // Create a local representation of the request for immediate UI feedback
          const newRequest = {
            id: Date.now(), // Temporary ID for local storage
            ...formData,
            requestedBy: user.id,
            status: 'open',
            submittedAt: new Date().toISOString(),
            // Store the server response ID if available
            serverId: responseData.id || responseData.requestId
          };
          
          // Update local storage for immediate UI feedback
          const existingRequests = JSON.parse(localStorage.getItem('assistanceRequests') || '[]');
          existingRequests.push(newRequest);
          localStorage.setItem('assistanceRequests', JSON.stringify(existingRequests));
          
          // Reset form to initial state
          setFormData({
            requestBody: '',
            location: '',
            requestedDate: '',
            requestedTime: '',
          });
          
          setRequestSubmitted(true);
          
          // Hide success message after 5 seconds
          setTimeout(() => {
            setRequestSubmitted(false);
          }, 5000);
          
        } else {
          // Enhanced error handling for different HTTP status codes
          console.error('Request failed with status:', response.status);
          console.error('Response URL:', response.url);
          
          let errorMessage = 'Unknown error occurred';
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
            console.error('API Error Response:', errorData);
          } catch (parseError) {
            try {
              const errorText = await response.text();
              errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
              console.error('API Error Text:', errorText);
            } catch (textError) {
              errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
          }
          
          // Provide specific guidance based on status codes
          if (response.status === 404) {
            alert(`API endpoint not found. Please verify that:\n1. Your backend server is running at ${API_BASE_URL}\n2. The endpoint '/apis/create' exists\n3. The server is accessible\n\nError: ${errorMessage}`);
          } else if (response.status === 400) {
            alert(`Request validation failed: ${errorMessage}\n\nPlease check that all fields are filled correctly.`);
          } else if (response.status === 500) {
            alert(`Server error: ${errorMessage}\n\nPlease try again later or contact support.`);
          } else {
            alert(`Failed to submit request (${response.status}): ${errorMessage}`);
          }
        }
        
      } catch (error) {
        console.error('Network/Exception Error:', error);
        
        // Provide more specific error messages based on error type
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          alert(`Network connection error. This usually means:\n1. Your backend server at ${API_BASE_URL} is not running\n2. There's a network connectivity issue\n3. CORS is blocking the request\n\nError: ${error.message}`);
        } else if (error.name === 'AbortError') {
          alert('Request was cancelled. Please try again.');
        } else {
          alert(`An unexpected error occurred: ${error.message}`);
        }
      } finally {
        setIsSubmitting(false);
      }
      
    } else {
      setErrors(newErrors);
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  /**
   * Delete request function that works with your backend API
   */
  const handleDeleteRequest = async (requestId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this request? Only delete if you've been contacted by a volunteer and no longer need assistance."
    );
    
    if (confirmDelete) {
      try {
        // Try to call the backend DELETE endpoint
        const apiUrl = `${API_BASE_URL}/apis/${requestId}`;
        
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
          response = await fetch(`${API_BASE_URL}/apis/${requestId}/complete`, {
            method: 'PATCH',
            headers: {
              'accept': '*/*',
              'Content-Type': 'application/json',
            }
          });
        }
        
        if (response.ok) {
          // Success - update local state
          const existingRequests = JSON.parse(localStorage.getItem('assistanceRequests') || '[]');
          const updatedRequests = existingRequests.filter(req => req.id !== requestId);
          localStorage.setItem('assistanceRequests', JSON.stringify(updatedRequests));
          
          setUserRequests(userRequests.filter(req => req.id !== requestId));
          
          alert("Your request has been deleted successfully!");
        } else if (response.status === 404) {
          // Endpoint doesn't exist - fall back to local deletion only
          console.warn('Delete endpoint not implemented on backend, updating locally only');
          
          const existingRequests = JSON.parse(localStorage.getItem('assistanceRequests') || '[]');
          const updatedRequests = existingRequests.filter(req => req.id !== requestId);
          localStorage.setItem('assistanceRequests', JSON.stringify(updatedRequests));
          
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
              {/* Changed from type="time" to type="text" to accept string input */}
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