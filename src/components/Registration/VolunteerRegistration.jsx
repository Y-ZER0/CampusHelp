import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styling/Registration.css'; // Adjust the path as necessary

const VolunteerRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    phone: '',
    availability: [],
    supportAreas: [],
    biography: '',
    agreeTerms: false,
    agreeBackground: false
  });
  
  const [errors, setErrors] = useState({});
  
  const availabilityOptions = [
    { id: 'weekday_morning', label: 'Weekday Mornings' },
    { id: 'weekday_afternoon', label: 'Weekday Afternoons' },
    { id: 'weekday_evening', label: 'Weekday Evenings' },
    { id: 'weekend_morning', label: 'Weekend Mornings' },
    { id: 'weekend_afternoon', label: 'Weekend Afternoons' },
    { id: 'weekend_evening', label: 'Weekend Evenings' }
  ];
  
  const supportAreaOptions = [
    { id: 'mobility', label: 'Mobility Assistance' },
    { id: 'note_taking', label: 'Note Taking' },
    { id: 'reading', label: 'Reading Materials Aloud' },
    { id: 'study_buddy', label: 'Study Partner' },
    { id: 'tech_help', label: 'Technology Assistance' },
    { id: 'transportation', label: 'Campus Transportation' },
    { id: 'errands', label: 'Errands & Pickup Services' },
    { id: 'social', label: 'Social Support' }
  ];
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'agreeTerms' || name === 'agreeBackground') {
        setFormData({
          ...formData,
          [name]: checked
        });
      } else {
        // For arrays like availability and supportAreas
        const arrayField = formData[name];
        if (checked) {
          setFormData({
            ...formData,
            [name]: [...arrayField, value]
          });
        } else {
          setFormData({
            ...formData,
            [name]: arrayField.filter(item => item !== value)
          });
        }
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Availability validation
    if (formData.availability.length === 0) {
      newErrors.availability = 'Please select at least one availability option';
    }
    
    // Support areas validation
    if (formData.supportAreas.length === 0) {
      newErrors.supportAreas = 'Please select at least one area you can support';
    }
    
    // Terms agreement
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }
    
    // Background check agreement
    if (!formData.agreeBackground) {
      newErrors.agreeBackground = 'You must agree to the background check policy';
    }
    
    return newErrors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      // Form is valid, submit data
      console.log('Form submitted successfully', formData);
      // In a real app, you would send this data to your backend
      // For now, just navigate to a success page or dashboard
      navigate('/dashboard/volunteer');
    } else {
      // Form has errors
      setErrors(newErrors);
      // Scroll to the first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  return (
    <div className="registration-container">
      <div className="registration-header">
        <h1>Volunteer Registration</h1>
        <p>Create an account to help students with special needs on campus</p>
      </div>
      
      <div className="registration-card">
        <form className="registration-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Personal Information</h2>
            
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
              <label htmlFor="email">Email Address*</label>
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
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="studentId">Student ID*</label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className={errors.studentId ? 'error' : ''}
                />
                {errors.studentId && <div className="error-message">{errors.studentId}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number*</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <div className="error-message">{errors.phone}</div>}
              </div>
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
          
          <div className="form-section">
            <h2>Volunteer Information</h2>
            
            <div className="form-group">
              <label>Availability*</label>
              <div className="checkbox-grid">
                {availabilityOptions.map(option => (
                  <div key={option.id} className="checkbox-container">
                    <input
                      type="checkbox"
                      id={`availability-${option.id}`}
                      name="availability"
                      value={option.id}
                      checked={formData.availability.includes(option.id)}
                      onChange={handleChange}
                    />
                    <label htmlFor={`availability-${option.id}`}>{option.label}</label>
                  </div>
                ))}
              </div>
              {errors.availability && <div className="error-message">{errors.availability}</div>}
            </div>
            
            <div className="form-group">
              <label>Support Areas*</label>
              <div className="checkbox-grid">
                {supportAreaOptions.map(option => (
                  <div key={option.id} className="checkbox-container">
                    <input
                      type="checkbox"
                      id={`supportAreas-${option.id}`}
                      name="supportAreas"
                      value={option.id}
                      checked={formData.supportAreas.includes(option.id)}
                      onChange={handleChange}
                    />
                    <label htmlFor={`supportAreas-${option.id}`}>{option.label}</label>
                  </div>
                ))}
              </div>
              {errors.supportAreas && <div className="error-message">{errors.supportAreas}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="biography">About You (Optional)</label>
              <textarea
                id="biography"
                name="biography"
                value={formData.biography}
                onChange={handleChange}
                placeholder="Tell us a bit about yourself, your experiences, and why you want to volunteer."
                rows="4"
              ></textarea>
            </div>
          </div>
          
          <div className="form-group terms-group">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className={errors.agreeTerms ? 'error' : ''}
              />
              <label htmlFor="agreeTerms">
                I agree to the <a href="#" className="terms-link">Terms and Conditions</a> and <a href="#" className="terms-link">Privacy Policy</a>
              </label>
            </div>
            {errors.agreeTerms && <div className="error-message">{errors.agreeTerms}</div>}
          </div>
          
          <div className="form-group terms-group">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="agreeBackground"
                name="agreeBackground"
                checked={formData.agreeBackground}
                onChange={handleChange}
                className={errors.agreeBackground ? 'error' : ''}
              />
              <label htmlFor="agreeBackground">
                I understand that volunteering may require a background check and training
              </label>
            </div>
            {errors.agreeBackground && <div className="error-message">{errors.agreeBackground}</div>}
          </div>
          
          <div className="form-actions">
            <Link to="/" className="btn-secondary">Go Back</Link>
            <button type="submit" className="btn-primary">Register Account</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VolunteerRegistration;