import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import '../styling/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // Remove all non-digit characters
    value = value.replace(/\D/g, '');
    
    // Format the phone number with Jordan country code
    if (value.startsWith('962')) {
      if (value.length > 3) {
        const restOfNumber = value.substring(3);
        value = '+962 ' + restOfNumber;
      } else {
        value = '+962 ';
      }
    } 
    else if (value.startsWith('0') && value.length > 1) {
      value = '+962 ' + value.substring(1);
    }
    else if (value.length > 0 && !value.startsWith('962') && !value.startsWith('+')) {
      value = '+962 ' + value;
    }
    
    setFormData({
      ...formData,
      phone: value
    });
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'phone') {
      handlePhoneChange(e);
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.phone?.trim()) {
      newErrors.phone = t('phoneRequired');
    } else {
      const digitsOnly = formData.phone.replace(/\D/g, '');
      
      const isValidJordanianNumber = 
        (digitsOnly.startsWith('962') && digitsOnly.length === 12) ||
        (!digitsOnly.startsWith('962') && digitsOnly.length === 9);
      
      if (!isValidJordanianNumber) {
        newErrors.phone = t('validPhone');
      }
    }
    
    if (!formData.password) newErrors.password = t('passwordRequired');
    
    return newErrors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      // In a real app, this would validate against a backend
      const userData = localStorage.getItem('user');
      
      if (userData) {
        const user = JSON.parse(userData);
        
        // Simple check - in a real app you'd verify password with backend
        // Change from checking email to checking phone
        if (user.phone === formData.phone) {
          // Update user as logged in
          user.isLoggedIn = true;
          localStorage.setItem('user', JSON.stringify(user));
          
          // Force a reload of the page to update the header
          window.location.href = '/dashboard';
        } else {
          setLoginError('Invalid phone number or password');
        }
      } else {
        setLoginError('No account found with this phone number. Please register.');
      }
    } else {
      setErrors(newErrors);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-header">
        <h1>{t('welcomeBackLogin')}</h1>
        <p>{t('loginAccess')}</p>
      </div>
      
      <div className="login-card">
        {loginError && (
          <div className="login-error-message">
            <p>{loginError}</p>
          </div>
        )}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phone">{t('phoneNumber')}</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+962 7X XXX XXXX"
              className={errors.phone ? 'error' : ''}
            />
            <small className="form-hint">{t('phoneHint')}</small>
            {errors.phone && <div className="error-message">{errors.phone}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">{t('password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="form-group remember-me">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe">{t('rememberMe')}</label>
            </div>
            {/* <Link to="/forgot-password" className="forgot-password">Forgot password?</Link> */}
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary">{t('loginButton')}</button>
          </div>
        </form>
        
        <div className="login-footer">
          <p>{t('noAccount')} <Link to="/register" className="register-link">{t('registerNow')}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;