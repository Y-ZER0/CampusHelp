import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styling/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
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
        if (user.email === formData.email) {
          // Update user as logged in
          user.isLoggedIn = true;
          localStorage.setItem('user', JSON.stringify(user));
          
          // Force a reload of the page to update the header
          window.location.href = '/dashboard';
        } else {
          setLoginError('Invalid email or password');
        }
      } else {
        setLoginError('No account found with this email. Please register.');
      }
    } else {
      setErrors(newErrors);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-header">
        <h1>Welcome Back</h1>
        <p>Log in to access campus assistance services</p>
      </div>
      
      <div className="login-card">
        {loginError && (
          <div className="login-error-message">
            <p>{loginError}</p>
          </div>
        )}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
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
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            {/* <Link to="/forgot-password" className="forgot-password">Forgot password?</Link> */}
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary">Log In</button>
          </div>
        </form>
        
        <div className="login-footer">
          <p>Don't have an account? <Link to="/register" className="register-link">Register now</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;