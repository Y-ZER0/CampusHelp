import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styling/Registration.css'; // Adjust the path as necessary

const PatientRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    specialNeedsCategory: '',
    documentProof: null,
    additionalInfo: '',
    agreeTerms: false
  });
  
  const [errors, setErrors] = useState({});
  
  const specialNeedsCategories = [
    { id: 'mobility', label: 'Mobility Impairment' },
    { id: 'visual', label: 'Visual Impairment' },
    { id: 'hearing', label: 'Hearing Impairment' },
    { id: 'learning', label: 'Learning Disability' },
    { id: 'chronic', label: 'Chronic Illness' },
    { id: 'mental', label: 'Mental Health Condition' },
    { id: 'temporary', label: 'Temporary Injury/Condition' },
    { id: 'other', label: 'Other' }
  ];
  
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
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
    if (!formData.specialNeedsCategory) newErrors.specialNeedsCategory = 'Please select a category';
    if (!formData.documentProof) newErrors.documentProof = 'Documentation is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
    
    // Terms agreement
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
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
      navigate('/dashboard/patient');
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
        <h1>Student Registration</h1>
        <p>Create an account to request assistance on campus</p>
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
            <h2>Special Needs Information</h2>
            
            <div className="form-group">
              <label htmlFor="specialNeedsCategory">Category of Special Needs*</label>
              <select
                id="specialNeedsCategory"
                name="specialNeedsCategory"
                value={formData.specialNeedsCategory}
                onChange={handleChange}
                className={errors.specialNeedsCategory ? 'error' : ''}
              >
                <option value="">-- Select Category --</option>
                {specialNeedsCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
              {errors.specialNeedsCategory && <div className="error-message">{errors.specialNeedsCategory}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="documentProof">Documentation of Special Needs*</label>
              <div className="file-upload">
                <input
                  type="file"
                  id="documentProof"
                  name="documentProof"
                  onChange={handleChange}
                  className={errors.documentProof ? 'error' : ''}
                />
                <div className="file-upload-text">
                  {formData.documentProof ? formData.documentProof.name : 'Upload documentation (PDF, JPG, PNG)'}
                </div>
              </div>
              <div className="field-help">
                Please upload documentation from a medical professional, Disability Services Office, or other relevant authority.
                Your information will be kept confidential and only used to verify your eligibility.
              </div>
              {errors.documentProof && <div className="error-message">{errors.documentProof}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="additionalInfo">Additional Information (Optional)</label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                placeholder="Please share any additional details about your needs that would help us match you with appropriate volunteers."
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
          
          <div className="form-actions">
            <Link to="/" className="btn-secondary">Go Back</Link>
            <button type="submit" className="btn-primary">Register Account</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistration;