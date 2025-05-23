import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import '../styling/PatientMode.css';

const PatientMode = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    category: '',
    date: '',
    time: '',
    location: '',
    description: '',
    phone: '', // Added phone field for contact
  });
  const [errors, setErrors] = useState({});
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [userRequests, setUserRequests] = useState([]);

  // Categories for assistance requests
  const categories = [
    { value: 'mobility', label: t('mobilityImpairment') },
    { value: 'note_taking', label: t('noteTaking') },
    { value: 'reading', label: t('readingMaterials') },
    { value: 'interpretation', label: t('signLanguage') },
    { value: 'tech_assistance', label: t('techAssistance') },
    { value: 'other', label: t('otherAssistance') }
  ];

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      
      // Pre-fill phone field with user's phone if available
      const parsedUser = JSON.parse(userData);
      if (parsedUser.phone) {
        setFormData(prev => ({
          ...prev,
          phone: parsedUser.phone
        }));
      }
    }
    setLoading(false);
  }, []);

  // Load user's requests
  useEffect(() => {
    if (user) {
      const existingRequests = JSON.parse(localStorage.getItem('assistanceRequests') || '[]');
      const userOpenRequests = existingRequests.filter(
        req => req.requestedBy === user.id && req.status === 'open'
      );
      setUserRequests(userOpenRequests);
    }
  }, [user, requestSubmitted]); // Re-fetch when requests are submitted

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
    const { name, value } = e.target;
    
    if (name === 'phone') {
      handlePhoneChange(e);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.category) newErrors.category = t('categoryRequired');
    if (!formData.date) newErrors.date = t('dateRequired');
    if (!formData.time) newErrors.time = t('timeRequired');
    if (!formData.location?.trim()) newErrors.location = t('locationRequired');
    if (!formData.description?.trim()) newErrors.description = t('descriptionRequired');
    
    // Phone validation - Updated to match Jordanian format
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
    
    // Date validation (must be today or in the future)
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of day for comparison
      
      if (selectedDate < today) {
        newErrors.date = t('futureDateRequired');
      }
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      // Form is valid, prepare request data
      const categoryObj = categories.find(cat => cat.value === formData.category);
      
      const requestData = {
        id: Math.random().toString(36).substring(2, 9), // Generate simple ID
        name: `${user.firstName} ${user.lastName}`,
        category: formData.category,
        categoryLabel: categoryObj ? categoryObj.label : t('otherAssistance'),
        date: formData.date,
        time: formData.time,
        location: formData.location,
        description: formData.description,
        phone: formData.phone, // Include phone number for direct contact
        status: 'open',
        requestedBy: user.id,
        contactDetails: user.email || 'Contact details will be provided directly'
      };
      
      // Save to localStorage (in a real app, this would be sent to a backend)
      const existingRequests = JSON.parse(localStorage.getItem('assistanceRequests') || '[]');
      const updatedRequests = [...existingRequests, requestData];
      localStorage.setItem('assistanceRequests', JSON.stringify(updatedRequests));
      
      // Reset form and show success message
      setFormData({
        category: '',
        date: '',
        time: '',
        location: '',
        description: '',
        phone: user?.phone || '', // Keep the phone number for next request
      });
      
      setRequestSubmitted(true);
      
      // After 3 seconds, hide the success message
      setTimeout(() => {
        setRequestSubmitted(false);
      }, 3000);
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

  const handleDeleteRequest = (requestId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this request? Only delete if you've been contacted by a volunteer and no longer need assistance.");
    
    if (confirmDelete) {
      // Remove this request from localStorage
      const existingRequests = JSON.parse(localStorage.getItem('assistanceRequests') || '[]');
      const updatedRequests = existingRequests.filter(req => req.id !== requestId);
      localStorage.setItem('assistanceRequests', JSON.stringify(updatedRequests));
      
      // Update state to remove the request
      setUserRequests(userRequests.filter(req => req.id !== requestId));
      
      alert("Your request has been deleted. Thank you for using our platform!");
    }
  };

  // If not logged in, redirect to login page
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="patient-container">
      <div className="patient-header">
        <h1>{t('requestAssistanceTitle')}</h1>
        <p>{t('submitRequest')}</p>
      </div>

      <div className="mode-switcher">
        <Link to="/dashboard" className="btn-secondary">
          {t('backToDashboard')}
        </Link>
      </div>

      {requestSubmitted && (
        <div className="success-message">
          <div className="success-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{t('requestSubmitted')}</span>
          </div>
        </div>
      )}

      {userRequests.length > 0 && (
        <div className="your-requests-section">
          <h2>{t('yourRequests')}</h2>
          <div className="requests-grid">
            {userRequests.map(request => (
              <div key={request.id} className="request-card your-request">
                <div className="request-header">
                  <span className="request-category">{request.categoryLabel}</span>
                  <span className="request-status">{t('active')}</span>
                </div>
                <div className="request-details">
                  <p><strong>{t('date')}:</strong> {request.date}</p>
                  <p><strong>{t('time')}:</strong> {request.time}</p>
                  <p><strong>{t('location')}:</strong> {request.location}</p>
                  <p><strong>{t('contact')}:</strong> {request.phone || 'No phone provided'}</p>
                  <p className="request-description">{request.description}</p>
                </div>
                <div className="request-actions">
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteRequest(request.id)}
                  >
                    {t('deleteRequest')}
                  </button>
                </div>
                <div className="request-info">
                  <p className="request-note">{t('deleteNote')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="request-form-card">
        <form className="request-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category">{t('typeOfAssistance')}*</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={errors.category ? 'error' : ''}
            >
              <option value="">{t('selectCategory')}</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && <div className="error-message">{errors.category}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">{t('date')}*</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} // Set min to today
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <div className="error-message">{errors.date}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="time">{t('time')}*</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={errors.time ? 'error' : ''}
              />
              {errors.time && <div className="error-message">{errors.time}</div>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="location">{t('location')}*</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Building and room number or meeting location"
              className={errors.location ? 'error' : ''}
            />
            {errors.location && <div className="error-message">{errors.location}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">{t('phoneContact')}*</label>
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
            <label htmlFor="description">{t('descriptionNeeded')}*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('descriptionPlaceholder')}
              rows="4"
              className={errors.description ? 'error' : ''}
            ></textarea>
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>
          
          <div className="form-note">
            <p>{t('requestNote')}</p>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary">{t('submitRequestButton')}</button>
          </div>
        </form>
      </div>
      
      <div className="request-info-section">
        <h3>{t('whatToExpect')}</h3>
        <div className="info-steps">
          <div className="info-step">
            <div className="step-number">1</div>
            <p>{t('step1')}</p>
          </div>
          <div className="info-step">
            <div className="step-number">2</div>
            <p>{t('step2')}</p>
          </div>
          <div className="info-step">
            <div className="step-number">3</div>
            <p>{t('step3')}</p>
          </div>
          <div className="info-step">
            <div className="step-number">4</div>
            <p>{t('step4')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientMode;