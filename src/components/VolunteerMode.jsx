import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import '../styling/VolunteerMode.css';

const VolunteerMode = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assistanceRequests, setAssistanceRequests] = useState([
    {
      id: '1',
      name: 'Alex Johnson',
      category: 'mobility',
      categoryLabel: 'Mobility Impairment',
      date: '2025-05-15',
      time: '10:00 AM',
      location: 'Main Campus Library',
      description: 'Need assistance navigating to the third floor research section and carrying materials.',
      phone: '(+962) 123-4567',
      status: 'open'
    },
    {
      id: '2',
      name: 'Jamie Smith',
      category: 'note_taking',
      categoryLabel: 'Note Taking',
      date: '2025-05-16',
      time: '2:30 PM',
      location: 'Science Building, Room 203',
      description: 'Looking for someone to take notes during Physics lecture. I have hearing impairment and miss some content.',
      phone: '(+962) 987-6543',
      status: 'open'
    },
    {
      id: '3',
      name: 'Casey Wilson',
      category: 'reading',
      categoryLabel: 'Reading Materials',
      date: '2025-05-17',
      time: '1:00 PM',
      location: 'Student Center',
      description: 'Need help reading through course materials due to visual impairment.',
      phone: '(+962) 456-7890',
      status: 'open'
    }
  ]);

  // Load any saved assistance requests from localStorage
  useEffect(() => {
    const savedRequests = localStorage.getItem('assistanceRequests');
    if (savedRequests) {
      setAssistanceRequests(prev => {
        // Create a map of existing requests by ID to avoid duplicates
        const existingIds = new Map(prev.map(req => [req.id, true]));
        // Filter saved requests to only include those not already in state
        const newRequests = JSON.parse(savedRequests).filter(req => !existingIds.has(req.id));
        return [...prev, ...newRequests];
      });
    }
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // If not logged in, redirect to login
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Show all open requests
  const openRequests = assistanceRequests.filter(req => req.status === 'open');

  return (
    <div className="volunteer-container">
      <div className="volunteer-header">
        <h1>Volunteer Dashboard</h1>
        <p>View and respond to assistance requests from students</p>
      </div>

      <div className="mode-switcher">
        <Link to="/dashboard" className="btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="requests-section">
        <h2>Open Assistance Requests</h2>
        {openRequests.length === 0 ? (
          <div className="no-requests">
            <p>There are currently no open assistance requests.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {openRequests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <span className="request-category">{request.categoryLabel}</span>
                  {request.requestedBy === user.id && (
                    <span className="request-own-tag">Your Request</span>
                  )}
                </div>
                <h3>{request.name}</h3>
                <div className="request-details">
                  <p><strong>Date:</strong> {request.date}</p>
                  <p><strong>Time:</strong> {request.time}</p>
                  <p><strong>Location:</strong> {request.location}</p>
                  <p className="request-description">{request.description}</p>
                  {request.requestedBy !== user.id ? (
                    <p className="request-contact"><strong>Contact:</strong> <a href={`tel:${request.phone}`}>{request.phone || 'No phone provided'}</a></p>
                  ) : (
                    <div className="own-request-notice">
                      This is your own request. Wait for a volunteer to contact you.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="volunteer-info-section">
        <h3>Volunteer Guidelines</h3>
        <div className="info-steps">
          <div className="info-step">
            <div className="step-number">1</div>
            <p>Review assistance requests that match your skills and availability</p>
          </div>
          <div className="info-step">
            <div className="step-number">2</div>
            <p>Call the student directly using the phone number provided</p>
          </div>
          <div className="info-step">
            <div className="step-number">3</div>
            <p>Coordinate with the student to provide the assistance they need</p>
          </div>
          <div className="info-step">
            <div className="step-number">4</div>
            <p>Students will delete their requests once they've received help</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerMode;