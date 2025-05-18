import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import '../styling/PatientMode.css';

const PatientMode = () => {
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
    { value: 'mobility', label: 'Mobility Impairment' },
    { value: 'note_taking', label: 'Note Taking' },
    { value: 'reading', label: 'Reading Materials' },
    { value: 'interpretation', label: 'Sign Language Interpretation' },
    { value: 'tech_assistance', label: 'Technology Assistance' },
    { value: 'other', label: 'Other Assistance' }
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.location?.trim()) newErrors.location = 'Location is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required for contact';
    
    // Phone validation
    if (formData.phone) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    }
    
    // Date validation (must be today or in the future)
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of day for comparison
      
      if (selectedDate < today) {
        newErrors.date = 'Date must be today or in the future';
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
        categoryLabel: categoryObj ? categoryObj.label : 'Other',
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
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="patient-container">
      <div className="patient-header">
        <h1>Request Assistance</h1>
        <p>Submit a request for volunteer support on campus</p>
      </div>

      <div className="mode-switcher">
        <Link to="/dashboard" className="btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      {requestSubmitted && (
        <div className="success-message">
          <div className="success-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Your assistance request has been submitted successfully!</span>
          </div>
        </div>
      )}

      {userRequests.length > 0 && (
        <div className="your-requests-section">
          <h2>Your Open Requests</h2>
          <div className="requests-grid">
            {userRequests.map(request => (
              <div key={request.id} className="request-card your-request">
                <div className="request-header">
                  <span className="request-category">{request.categoryLabel}</span>
                  <span className="request-status">Active</span>
                </div>
                <div className="request-details">
                  <p><strong>Date:</strong> {request.date}</p>
                  <p><strong>Time:</strong> {request.time}</p>
                  <p><strong>Location:</strong> {request.location}</p>
                  <p><strong>Contact:</strong> {request.phone || 'No phone provided'}</p>
                  <p className="request-description">{request.description}</p>
                </div>
                <div className="request-actions">
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteRequest(request.id)}
                  >
                    Delete Request
                  </button>
                </div>
                <div className="request-info">
                  <p className="request-note">Only delete this request after a volunteer has contacted you and you no longer need assistance.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="request-form-card">
        <form className="request-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category">Type of Assistance Needed*</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={errors.category ? 'error' : ''}
            >
              <option value="">Select a category</option>
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
              <label htmlFor="date">Date*</label>
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
              <label htmlFor="time">Time*</label>
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
            <label htmlFor="location">Location*</label>
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
            <label htmlFor="phone">Phone Number for Contact*</label>
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
          
          <div className="form-group">
            <label htmlFor="description">Description of Assistance Needed*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Please provide details about what kind of help you need"
              rows="4"
              className={errors.description ? 'error' : ''}
            ></textarea>
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>
          
          <div className="form-note">
            <p>Volunteers will contact you through the phone number you provide. Delete your request once you've been contacted and no longer need help.</p>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary">Submit Request</button>
          </div>
        </form>
      </div>
      
      <div className="request-info-section">
        <h3>What to Expect</h3>
        <div className="info-steps">
          <div className="info-step">
            <div className="step-number">1</div>
            <p>Submit your assistance request with all required details</p>
          </div>
          <div className="info-step">
            <div className="step-number">2</div>
            <p>Your request will be visible to all registered volunteers</p>
          </div>
          <div className="info-step">
            <div className="step-number">3</div>
            <p>A volunteer will contact you directly through your provided phone number</p>
          </div>
          <div className="info-step">
            <div className="step-number">4</div>
            <p>Once you've received help, delete your request to complete the process</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientMode;