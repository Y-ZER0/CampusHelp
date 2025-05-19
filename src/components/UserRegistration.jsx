import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styling/Registration.css';

const UserRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeTerms: false,
  });
  
  const [errors, setErrors] = useState({});
  
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    value = value.replace(/\D/g, '');
    
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
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    
    if (formData.phone) {
      const digitsOnly = formData.phone.replace(/\D/g, '');
      
      const isValidJordanianNumber = 
        (digitsOnly.startsWith('962') && digitsOnly.length === 12) ||
        // Or if user entered a number without country code, it should be 9 digits
        (!digitsOnly.startsWith('962') && digitsOnly.length === 9);
      
      if (!isValidJordanianNumber) {
        newErrors.phone = 'Please enter a valid Jordanian phone number';
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }
    
    return newErrors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted successfully', formData);
      
      // Save user data to localStorage (in a real app, this would be sent to a backend)
      localStorage.setItem('user', JSON.stringify({
        id: Math.random().toString(36).substr(2, 9), // Generate simple ID
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        isLoggedIn: true
      }));
      
      navigate('/dashboard');
    } else {
      setErrors(newErrors);
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  return (
    <div className="registration-container">
      <div className="registration-header">
        <h1>User Registration</h1>
        <p>Create an account to access all campus support services</p>
      </div>
      
      <div className="registration-card">
        <form className="registration-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Account Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name*</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <div className="error-message">{errors.firstName}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name*</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <div className="error-message">{errors.lastName}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number*</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+962 7X XXX XXXX"
                className={errors.phone ? 'error' : ''}
              />
              <small className="form-hint">Enter a valid Jordanian phone number (e.g., +962 7XXXXXXXX)</small>
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password*</label>
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
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password*</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
              </div>
            </div>
          </div>
          
          <div className="form-note">
            <p>After registration, you'll be able to use both volunteer and assistance services.</p>
          </div>
          
          <div className="form-actions">
            <Link to="/login" className="btn-secondary">Go Back</Link>
            <button type="submit" className="btn-primary">Create Account</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;