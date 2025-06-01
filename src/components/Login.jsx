import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import '../styling/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Centralized API configuration - matches registration component
  const API_BASE_URL = "https://hci-proj-backend.onrender.com";
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  

  
  // Simplified change handler with proper state management
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Streamlined validation function with consistent rules
  const validateForm = () => {
    const newErrors = {};
    
    // Username validation - consistent with registration component
    if (!formData.username?.trim()) {
      newErrors.username = t('usernameRequired') || 'Username is required';
    } else {
      const username = formData.username.trim();
      
      // Apply the same validation rules as registration for consistency
      if (username.length < 3) {
        newErrors.username = t('usernameMinLength') || 'Username must be at least 3 characters';
      } else if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        newErrors.username = t('usernameInvalidChars') || 'Username contains invalid characters';
      } else if (username.length > 30) {
        newErrors.username = t('usernameMaxLength') || 'Username is too long';
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = t('passwordRequired') || 'Password is required';
    }
    
    return newErrors;
  };
  
  // Optimized and simplified login API function
  const loginUser = async (userData) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const requestPayload = {
        username: userData.username.trim(),
        password: userData.password
      };

      console.log('Login request:', {
        ...requestPayload,
        password: '[HIDDEN]'
      });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        // credentials: 'include', // Important for session management
        body: JSON.stringify(requestPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Get response text first, then handle appropriately
      const responseText = await response.text();
      console.log('Login response:', {
        status: response.status,
        body: responseText
      });

      if (!response.ok) {
        // Handle error responses more gracefully
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || responseText;
        } catch {
          errorMessage = responseText || `HTTP ${response.status} Error`;
        }

        // Provide user-friendly error messages based on status codes
        switch (response.status) {
          case 400:
            throw new Error('Invalid username or password format');
          case 401:
            throw new Error('Invalid username or password');
          case 403:
            throw new Error('Account access denied');
          case 422:
            throw new Error('Please check your login information');
          case 500:
            throw new Error('Server error occurred. Please try again later.');
          default:
            throw new Error(errorMessage);
        }
      }

      // Handle successful response - accommodate both JSON and text responses
      let result;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          result = JSON.parse(responseText);
        } catch {
          // If JSON parsing fails, treat as plain text success
          result = { message: responseText, success: true };
        }
      } else {
        // Handle plain text responses like "Login Successful"
        result = { 
          message: responseText || 'Login successful!',
          success: true,
          user: {
            username: userData.username.trim()
          }
        };
      }

      return {
        success: true,
        message: result.message || 'Login successful!',
        data: result.user || result.data || { username: userData.username.trim() }
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      console.error('Login error:', error);

      // Return appropriate error messages based on error type
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
  
  // Improved submit handler with better error management
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear all previous errors
    setErrors({});
    
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting login process...');
      
      const result = await loginUser(formData);
      
      if (result.success) {
        console.log('Login successful:', result.message);
        
        // Create comprehensive user data object for localStorage
        const userData = {
          username: formData.username.trim(),
          isLoggedIn: true,
          loginTime: new Date().toISOString(),
          // Include any additional data returned from the API
          ...result.data,
          // If remember me is checked, add flag for persistent login
          rememberMe: formData.rememberMe
        };
        
        // Store user data and notify other components of the change
        localStorage.setItem('user', JSON.stringify(userData));
        window.dispatchEvent(new Event('storage'));
        
        console.log('User data stored, navigating to dashboard');
        
        // Navigate to dashboard
        navigate('/dashboard');
        
      } else {
        // Display login error message
        setErrors({ submit: result.message });
      }
      
    } catch (error) {
      console.error('Unexpected login error:', error);
      setErrors({
        submit: 'An unexpected error occurred during login. Please try again.'
      });
      
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-header">
        <h1>{t('welcomeBackLogin') || 'Welcome Back'}</h1>
        <p>{t('loginAccess') || 'Log in to access campus assistance services'}</p>
      </div>
      
      <div className="login-card">
        {/* Display general login errors at the top of the form */}
        {errors.submit && (
          <div className="login-error-message">
            <p>{errors.submit}</p>
          </div>
        )}
        
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Username input field with improved accessibility */}
          <div className="form-group">
            <label htmlFor="username">{t('username') || 'Username'}</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={t('usernamePlaceholder') || 'Enter your username'}
              className={errors.username ? 'error' : ''}
              disabled={isLoading}
              autoComplete="username"
              autoFocus // Automatically focus on the first field for better UX
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>
          
          {/* Password input field */}
          <div className="form-group">
            <label htmlFor="password">{t('password') || 'Password'}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('passwordPlaceholder') || 'Enter your password'}
              className={errors.password ? 'error' : ''}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          {/* Optional: Remember me checkbox and forgot password link */}
          <div className="form-group remember-me">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isLoading}
              />
              <label htmlFor="rememberMe">{t('rememberMe') || 'Remember me'}</label>
            </div>
            {/* Uncomment if you want to add forgot password functionality */}
            {/* <Link to="/forgot-password" className="forgot-password">
              {t('forgotPassword') || 'Forgot password?'}
            </Link> */}
          </div>
          
          {/* Submit button with loading state */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : (t('loginButton') || 'Log In')}
            </button>
          </div>
        </form>
        
        {/* Footer with link to registration */}
        <div className="login-footer">
          <p>
            {t('noAccount') || "Don't have an account?"}{' '}
            <Link to="/register" className="register-link">
              {t('registerNow') || 'Register now'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;