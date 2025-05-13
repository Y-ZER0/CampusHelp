import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styling/Dashboard.css'; 

const Dashboard = () => {
  const { userType } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeRequests, setActiveRequests] = useState([]);
  const [helpHistory, setHelpHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Check authentication
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUserType = localStorage.getItem('userType');
    
    if (!isLoggedIn || storedUserType !== userType) {
      navigate('/');
      return;
    }
    
    // Fetch user data
    fetchUserData();
  }, [navigate, userType]);
  
  // Mock fetching user data
  const fetchUserData = () => {
    // In a real app, this would be an API call
    setTimeout(() => {
      if (userType === 'patient') {
        setUserData({
          id: 'p1001',
          name: 'Alex Johnson',
          email: 'alex.johnson@university.edu',
          studentId: 'S123456789',
          specialNeeds: 'Mobility',
          verificationStatus: 'verified',
          joinDate: '2025-04-15',
          profileImage: '/images/avatar1.png'
        });
        
        setActiveRequests([
          {
            id: 1,
            description: 'Need assistance getting to classes in the Science Building on Tuesdays and Thursdays',
            category: 'Mobility',
            duration: '4 weeks',
            schedule: 'Tue & Thu, 9am-11am',
            location: 'Science Building',
            status: 'accepted',
            volunteerName: 'Jordan Taylor',
            volunteerContact: 'jordan.taylor@university.edu',
            startDate: '2025-05-15',
            endDate: '2025-06-12'
          }
        ]);
        
        setHelpHistory([
          {
            id: 101,
            description: 'Note-taking assistance for Biology 101',
            volunteer: 'Sam Wilson',
            startDate: '2025-03-01',
            endDate: '2025-04-10',
            feedback: 'Great help, very thorough notes.',
            rating: 5
          },
          {
            id: 102,
            description: 'Transportation assistance after leg injury',
            volunteer: 'Pat Garcia',
            startDate: '2025-02-05',
            endDate: '2025-03-05',
            feedback: 'Always on time and very helpful.',
            rating: 4
          }
        ]);
      } else if (userType === 'volunteer') {
        setUserData({
          id: 'v2001',
          name: 'Jordan Taylor',
          email: 'jordan.taylor@university.edu',
          studentId: 'S987654321',
          skills: ['Note-taking', 'Transportation assistance', 'Study partner'],
          availability: 'Weekdays 9am-3pm',
          joinDate: '2025-03-10',
          profileImage: '/images/avatar2.png',
          helpCount: 3
        });
        
        setActiveRequests([
          {
            id: 1,
            description: 'Need assistance getting to classes in the Science Building on Tuesdays and Thursdays',
            patientName: 'Alex Johnson',
            patientContact: 'alex.johnson@university.edu',
            category: 'Mobility',
            duration: '4 weeks',
            schedule: 'Tue & Thu, 9am-11am',
            location: 'Science Building',
            status: 'accepted',
            startDate: '2025-05-15',
            endDate: '2025-06-12'
          }
        ]);
        
        setHelpHistory([
          {
            id: 201,
            description: 'Study assistance for Advanced Mathematics',
            patient: 'Taylor Rodriguez',
            startDate: '2025-04-01',
            endDate: '2025-04-30',
            feedback: 'Very patient and explained concepts clearly.',
            rating: 5
          },
          {
            id: 202,
            description: 'Note-taking for Psychology lectures',
            patient: 'Riley Wilson',
            startDate: '2025-02-15',
            endDate: '2025-03-30',
            feedback: 'Great detailed notes, helped me pass the midterm!',
            rating: 5
          }
        ]);
      }
      
      setLoading(false);
    }, 1200);
  };
  
  const handleCancelRequest = (requestId) => {
    // In a real app, this would be an API call
    setActiveRequests(activeRequests.filter(request => request.id !== requestId));
    alert('Request canceled successfully.');
  };
  
  const handleCompleteRequest = (requestId) => {
    // In a real app, this would be an API call
    setActiveRequests(activeRequests.filter(request => request.id !== requestId));
    alert('Request marked as completed. Thank you for your help!');
  };
  
  const handleCreateRequest = () => {
    // In a real app, this would take the user to a form
    navigate('/create-request');
  };
  
  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>
            <span className="welcome-text">Welcome,</span> {userData?.name}
          </h1>
          <p className="user-type-label">
            {userType === 'patient' ? 'Student Account' : 'Volunteer Account'}
          </p>
        </div>
        
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Requests
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Help History
          </button>
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>
        
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fa fa-handshake-o"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{activeRequests.length}</h3>
                    <p>Active Requests</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fa fa-history"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{helpHistory.length}</h3>
                    <p>Past Requests</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fa fa-calendar"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{new Date(userData.joinDate).toLocaleDateString()}</h3>
                    <p>Member Since</p>
                  </div>
                </div>
                
                {userType === 'volunteer' && (
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fa fa-star"></i>
                    </div>
                    <div className="stat-info">
                      <h3>{userData.helpCount}</h3>
                      <p>Students Helped</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                  {userType === 'patient' && (
                    <button className="action-btn primary" onClick={handleCreateRequest}>
                      <i className="fa fa-plus-circle"></i> Create New Request
                    </button>
                  )}
                  
                  {userType === 'volunteer' && (
                    <button className="action-btn primary" onClick={() => navigate('/requests')}>
                      <i className="fa fa-search"></i> Browse Open Requests
                    </button>
                  )}
                  
                  <button className="action-btn secondary">
                    <i className="fa fa-envelope"></i> Messages
                  </button>
                  
                  <button className="action-btn secondary">
                    <i className="fa fa-bell"></i> Notifications
                  </button>
                </div>
              </div>
              
              {activeRequests.length > 0 && (
                <div className="recent-activity">
                  <h2>Recent Activity</h2>
                  <div className="activity-card">
                    <div className="activity-header">
                      <h3>Active Request</h3>
                      <span className={`status-badge ${activeRequests[0].status}`}>
                        {activeRequests[0].status.charAt(0).toUpperCase() + activeRequests[0].status.slice(1)}
                      </span>
                    </div>
                    <p>{activeRequests[0].description}</p>
                    <div className="activity-details">
                      <p>
                        <strong>{userType === 'patient' ? 'Helper:' : 'Student:'}</strong> 
                        {userType === 'patient' ? activeRequests[0].volunteerName : activeRequests[0].patientName}
                      </p>
                      <p>
                        <strong>Schedule:</strong> {activeRequests[0].schedule}
                      </p>
                      <p>
                        <strong>Location:</strong> {activeRequests[0].location}
                      </p>
                    </div>
                    <button className="view-all-btn" onClick={() => setActiveTab('active')}>
                      View All Active Requests
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'active' && (
            <div className="active-requests-tab">
              <div className="section-header">
                <h2>Active Requests</h2>
                {userType === 'patient' && (
                  <button className="create-btn" onClick={handleCreateRequest}>
                    <i className="fa fa-plus"></i> New Request
                  </button>
                )}
              </div>
              
              {activeRequests.length > 0 ? (
                <div className="requests-list">
                  {activeRequests.map(request => (
                    <div key={request.id} className="request-item">
                      <div className="request-item-header">
                        <h3>{request.description}</h3>
                        <span className={`status-badge ${request.status}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="request-item-details">
                        <div className="detail">
                          <span className="label">Category:</span>
                          <span className="value">{request.category}</span>
                        </div>
                        
                        <div className="detail">
                          <span className="label">Schedule:</span>
                          <span className="value">{request.schedule}</span>
                        </div>
                        
                        <div className="detail">
                          <span className="label">Location:</span>
                          <span className="value">{request.location}</span>
                        </div>
                        
                        <div className="detail">
                          <span className="label">Duration:</span>
                          <span className="value">{request.duration}</span>
                        </div>
                        
                        <div className="detail">
                          <span className="label">Start Date:</span>
                          <span className="value">{new Date(request.startDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="detail">
                          <span className="label">End Date:</span>
                          <span className="value">{new Date(request.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="contact-info">
                        <h4>{userType === 'patient' ? 'Your Helper' : 'Student'}</h4>
                        <p>
                          <strong>Name:</strong> {userType === 'patient' ? request.volunteerName : request.patientName}
                        </p>
                        <p>
                          <strong>Contact:</strong> {userType === 'patient' ? request.volunteerContact : request.patientContact}
                        </p>
                      </div>
                      
                      <div className="request-actions">
                        {userType === 'patient' ? (
                          <button className="cancel-btn" onClick={() => handleCancelRequest(request.id)}>
                            Cancel Request
                          </button>
                        ) : (
                          <button className="complete-btn" onClick={() => handleCompleteRequest(request.id)}>
                            Mark as Completed
                          </button>
                        )}
                        
                        <button className="contact-btn">
                          <i className="fa fa-comment"></i> Send Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fa fa-clipboard"></i>
                  </div>
                  <h3>No Active Requests</h3>
                  {userType === 'patient' ? (
                    <p>You don't have any active help requests. Create a new request to get help from volunteers.</p>
                  ) : (
                    <p>You're not currently helping any students. Browse open requests to find someone to help.</p>
                  )}
                  
                  {userType === 'patient' ? (
                    <button className="action-btn primary" onClick={handleCreateRequest}>
                      Create New Request
                    </button>
                  ) : (
                    <button className="action-btn primary" onClick={() => navigate('/requests')}>
                      Browse Requests
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="history-tab">
              <h2>Help History</h2>
              
              {helpHistory.length > 0 ? (
                <div className="history-list">
                  {helpHistory.map(item => (
                    <div key={item.id} className="history-item">
                      <div className="history-item-header">
                        <h3>{item.description}</h3>
                        <div className="rating">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className={`star ${i < item.rating ? 'filled' : ''}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="history-item-details">
                        <p>
                          <strong>{userType === 'patient' ? 'Helper:' : 'Student:'}</strong> 
                          {userType === 'patient' ? item.volunteer : item.patient}
                        </p>
                        <p>
                          <strong>Period:</strong> 
                          {new Date(item.startDate).toLocaleDateString()} to {new Date(item.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="feedback">
                        <h4>Feedback</h4>
                        <p>"{item.feedback}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="fa fa-history"></i>
                  </div>
                  <h3>No History Yet</h3>
                  <p>Once you've completed help requests, they will appear here.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <div className="profile-header">
                <div className="profile-image">
                  <div className="avatar-placeholder">
                    {userData.name.charAt(0)}
                  </div>
                </div>
                <div className="profile-info">
                  <h2>{userData.name}</h2>
                  <p className="email">{userData.email}</p>
                  <p className="student-id">Student ID: {userData.studentId}</p>
                  {userType === 'patient' && (
                    <div className={`verification-status ${userData.verificationStatus}`}>
                      <i className={`fa fa-${userData.verificationStatus === 'verified' ? 'check-circle' : 'clock-o'}`}></i>
                      {userData.verificationStatus === 'verified' ? 'Verified Account' : 'Verification Pending'}
                    </div>
                  )}
                </div>
                <button className="edit-profile-btn">
                  <i className="fa fa-pencil"></i> Edit Profile
                </button>
              </div>
              
              <div className="profile-content">
                <div className="profile-section">
                  <h3>{userType === 'patient' ? 'Special Needs Category' : 'Skills & Expertise'}</h3>
                  {userType === 'patient' ? (
                    <div className="special-needs">
                      <span className={`badge ${userData.specialNeeds.toLowerCase()}`}>
                        {userData.specialNeeds}
                      </span>
                    </div>
                  ) : (
                    <div className="skills-list">
                      {userData.skills.map((skill, index) => (
                        <span key={index} className="skill-badge">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>
                
                {userType === 'volunteer' && (
                  <div className="profile-section">
                    <h3>General Availability</h3>
                    <p>{userData.availability}</p>
                  </div>
                )}
                
                <div className="profile-section">
                  <h3>Account Settings</h3>
                  <div className="settings-buttons">
                    <button className="settings-btn">
                      <i className="fa fa-bell"></i> Notification Preferences
                    </button>
                    <button className="settings-btn">
                      <i className="fa fa-lock"></i> Privacy Settings
                    </button>
                    <button className="settings-btn">
                      <i className="fa fa-key"></i> Change Password
                    </button>
                  </div>
                </div>
                
                <div className="danger-zone">
                  <h3>Danger Zone</h3>
                  <button className="delete-account-btn">
                    <i className="fa fa-trash"></i> Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;