import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import '../styling/Registration.css';

const UserRegistration = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeTerms: false,
  });
  
  const [errors, setErrors] = useState({});

  // Centralized API configuration
  // const API_BASE_URL = "https://hci-proj-backend.onrender.com";
const API_BASE_URL = "http://localhost:8080";  
  // Improved phone number formatting with better logic
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // Remove all non-digits first
    value = value.replace(/\D/g, '');
    
    // Handle different input scenarios more elegantly
    if (value.startsWith('962')) {
      // Already has country code
      value = value.length > 3 ? `+962 ${value.substring(3)}` : '+962 ';
    } else if (value.startsWith('0') && value.length > 1) {
      // Remove leading 0 and add country code
      value = `+962 ${value.substring(1)}`;
    } else if (value.length > 0) {
      // Add country code to any other number
      value = `+962 ${value}`;
    }
    
    setFormData(prev => ({ ...prev, phone: value }));
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'phone') {
      handlePhoneChange(e);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };
  
  // Streamlined validation with clearer logic
  const validateForm = () => {
    const newErrors = {};
    
    // Username validation - consistent with login
    if (!formData.username.trim()) {
      newErrors.username = t('usernameRequired');
    } else if (formData.username.length < 3) {
      newErrors.username = t('usernameMinLength');
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(formData.username)) {
      newErrors.username = t('usernameInvalid');
    }
    
    // Required field validations
    if (!formData.firstName.trim()) newErrors.firstName = t('firstNameRequired');
    if (!formData.lastName.trim()) newErrors.lastName = t('lastNameRequired');
    if (!formData.phone?.trim()) newErrors.phone = t('phoneRequired');
    
    // Phone validation - simplified logic
    if (formData.phone) {
      const digitsOnly = formData.phone.replace(/\D/g, '');
      const isValid = (digitsOnly.startsWith('962') && digitsOnly.length === 12) ||
                     (!digitsOnly.startsWith('962') && digitsOnly.length === 9);
      
      if (!isValid) {
        newErrors.phone = t('validPhone');
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('passwordLength');
    }
    
    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordMatch');
    }
    
    // Terms agreement
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = t('agreeTermsRequired');
    }
    
    return newErrors;
  };

  // Simplified and more robust API call function
  const registerUser = async (userData) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // Clean and format phone number consistently
      const cleanPhone = userData.phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('962') 
        ? `+${cleanPhone}` 
        : `+962${cleanPhone}`;

      const requestPayload = {
        username: userData.username.trim(),
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        password: userData.password,
        phoneNumber: formattedPhone
      };

      console.log('Registration request:', {
        ...requestPayload,
        password: '[HIDDEN]'
      });

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle response more gracefully
      const responseText = await response.text();
      console.log('Registration response:', {
        status: response.status,
        body: responseText
      });

      if (!response.ok) {
        // Try to parse error as JSON, fall back to text
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || responseText;
        } catch {
          errorMessage = responseText || `HTTP ${response.status} Error`;
        }

        // Return user-friendly error messages based on status
        switch (response.status) {
          case 400:
            throw new Error(errorMessage.includes('username') 
              ? 'Username already exists. Please choose a different username.'
              : errorMessage);
          case 422:
            throw new Error('Please check your information and try again.');
          case 500:
            throw new Error('Server error occurred. Please try again later.');
          default:
            throw new Error(errorMessage);
        }
      }

      // Handle successful response (whether JSON or text)
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { message: responseText || 'Registration successful!' };
      }

      return {
        success: true,
        message: result.message || 'Registration completed successfully!',
        data: result
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      console.error('Registration error:', error);

      // Return appropriate error messages
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Request timed out. Please check your connection and try again.'
        };
      } else if (error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Cannot connect to server. Please check your internet connection.'
        };
      } else {
        return {
          success: false,
          message: error.message
        };
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector('.error-message');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser(formData);
      
      if (result.success) {
        // Create comprehensive user data for localStorage
        const userData = {
          id: Math.random().toString(36).substr(2, 9),
          username: formData.username.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone,
          isLoggedIn: true,
          registeredAt: new Date().toISOString(),
          // Include any additional data from the API response
          ...result.data
        };
        
        // Store user data and notify other components
        localStorage.setItem('user', JSON.stringify(userData));
        window.dispatchEvent(new Event('storage'));
        
        console.log('Registration successful, navigating to dashboard');
        navigate('/dashboard');
        
      } else {
        setErrors({ submit: result.message });
      }
      
    } catch (error) {
      console.error('Unexpected registration error:', error);
      setErrors({
        submit: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Admin access handler - unchanged but cleaner
  const handleAdminAccess = () => {
    const adminUser = {
      id: 'admin123',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+962 787654321',
      email: 'admin@campushelp.edu',
      isLoggedIn: true,
      isAdmin: true,
      registeredAt: new Date().toISOString()
    };

    localStorage.setItem('user', JSON.stringify(adminUser));
    window.dispatchEvent(new Event('storage'));
    navigate('/admin');
  };
  
  return (
    <div className="registration-container">
      <div className="registration-header">
        <h1>{t('userRegistration')}</h1>
        <p>{t('createAccount')}</p>
      </div>
      
      <div className="registration-card">
        <form className="registration-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>{t('accountInfo')}</h2>
            
            <div className="form-group">
              <label htmlFor="username">{t('username')}*</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={t('usernamePlaceholder') || 'Enter your Username'}
                className={errors.username ? 'error' : ''}
                disabled={isLoading}
                autoComplete="username"
              />
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">{t('firstName')}*</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'error' : ''}
                  disabled={isLoading}
                  autoComplete="given-name"
                />
                {errors.firstName && <div className="error-message">{errors.firstName}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">{t('lastName')}*</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'error' : ''}
                  disabled={isLoading}
                  autoComplete="family-name"
                />
                {errors.lastName && <div className="error-message">{errors.lastName}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">{t('phoneNumber')}*</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+962 7X XXX XXXX"
                className={errors.phone ? 'error' : ''}
                disabled={isLoading}
                autoComplete="tel"
              />
              <small className="form-hint">{t('phoneHint')}</small>
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">{t('password')}*</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">{t('confirmPassword')}*</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
              </div>
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className={errors.agreeTerms ? 'error' : ''}
                disabled={isLoading}
              />
              <label htmlFor="agreeTerms">{t('agreeTerms')}</label>
              {errors.agreeTerms && <div className="error-message">{errors.agreeTerms}</div>}
            </div>

            {errors.submit && (
              <div className="form-group">
                <div className="error-message" style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {errors.submit}
                </div>
              </div>
            )}
          </div>
          
          <div className="form-note">
            <p>{t('registrationNote')}</p>
          </div>
          
          <div className="form-actions">
            <Link to="/login" className="btn-secondary">{t('goBack')}</Link>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : t('createAccountButton')}
            </button>
          </div>
        </form>

        <div className="admin-access-section" style={{ 
          marginTop: '30px', 
          paddingTop: '20px', 
          borderTop: '2px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '15px' }}>
            <strong>{t('adminAccess')}</strong>
          </p>
          <button 
            type="button"
            onClick={handleAdminAccess}
            className="admin-access-button"
            disabled={isLoading}
            style={{
              backgroundColor: '#8e44ad',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(142, 68, 173, 0.3)',
              opacity: isLoading ? 0.6 : 1
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#732d91';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(142, 68, 173, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#8e44ad';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(142, 68, 173, 0.3)';
              }
            }}
          >
            {t('accessAdmin')}
          </button>
          <p style={{ fontSize: '0.8rem', color: '#95a5a6', marginTop: '8px' }}>
            {t('skipRegistration')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;