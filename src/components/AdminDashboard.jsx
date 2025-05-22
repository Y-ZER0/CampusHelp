import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import '../styling/AdminDashboard.css';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [users, setUsers] = useState([]);
  const [assistanceRequests, setAssistanceRequests] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequests: 0,
    activeRequests: 0,
    completedRequests: 0,
    usersByCategory: {},
    requestsByCategory: {}
  });
  
  // Admin authentication check
  useEffect(() => {
    // Check if user is logged in and is an admin
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // In a real app, you would have an isAdmin flag in your user data
      // Here we're simulating it
      if (parsedUser.isAdmin) {
        setUser(parsedUser);
      }
    }
    setLoading(false);
  }, []);

  // Load all data on component mount
  useEffect(() => {
    if (user && user.isAdmin) {
      loadAllData();
    }
  }, [user]);

  // Function to load all necessary data for the admin dashboard
  const loadAllData = () => {
    // In a real application, these would be API calls to your backend
    // For this demo, we're reading from localStorage
    
    // Load users
    const allUsers = [];
    // Simulate getting all users - in a real app this would be an API call
    const currentUser = localStorage.getItem('user');
    if (currentUser) {
      allUsers.push(JSON.parse(currentUser));
    }
    setUsers(allUsers);
    
    // Load assistance requests
    const savedRequests = localStorage.getItem('assistanceRequests');
    const requests = savedRequests ? JSON.parse(savedRequests) : [];
    setAssistanceRequests(requests);
    
    // Calculate statistics
    calculateStatistics(allUsers, requests);
  };

  // Calculate statistics for the overview
  const calculateStatistics = (allUsers, requests) => {
    const activeRequests = requests.filter(req => req.status === 'open');
    const completedRequests = requests.filter(req => req.status !== 'open');
    
    // Count requests by category
    const requestsByCategory = {};
    requests.forEach(req => {
      if (!requestsByCategory[req.categoryLabel]) {
        requestsByCategory[req.categoryLabel] = 0;
      }
      requestsByCategory[req.categoryLabel]++;
    });
    
    // Update stats
    setStats({
      totalUsers: allUsers.length,
      totalRequests: requests.length,
      activeRequests: activeRequests.length,
      completedRequests: completedRequests.length,
      requestsByCategory
    });
  };

  // Delete a user (would require backend confirmation in a real app)
  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      // In a real app, this would be an API call
      // For demo purposes, we're just updating the local state
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      
      // Recalculate stats
      calculateStatistics(updatedUsers, assistanceRequests);
    }
  };

  // Delete an assistance request
  const handleDeleteRequest = (requestId) => {
    if (window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      // In a real app, this would be an API call
      const existingRequests = JSON.parse(localStorage.getItem('assistanceRequests') || '[]');
      const updatedRequests = existingRequests.filter(req => req.id !== requestId);
      
      // Update localStorage
      localStorage.setItem('assistanceRequests', JSON.stringify(updatedRequests));
      
      // Update state
      setAssistanceRequests(updatedRequests);
      
      // Recalculate stats
      calculateStatistics(users, updatedRequests);
    }
  };

  // Change request status
  const handleStatusChange = (requestId, newStatus) => {
    const existingRequests = JSON.parse(localStorage.getItem('assistanceRequests') || '[]');
    const updatedRequests = existingRequests.map(req => {
      if (req.id === requestId) {
        return { ...req, status: newStatus };
      }
      return req;
    });
    
    // Update localStorage
    localStorage.setItem('assistanceRequests', JSON.stringify(updatedRequests));
    
    // Update state
    setAssistanceRequests(updatedRequests);
    
    // Recalculate stats
    calculateStatistics(users, updatedRequests);
  };

  // Add a new admin user
  const [newAdminData, setNewAdminData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    isAdmin: true
  });
  
  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdminData({
      ...newAdminData,
      [name]: value
    });
  };
  
  const handleAddAdmin = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newAdminData.firstName || !newAdminData.lastName || !newAdminData.email || !newAdminData.password) {
      alert('All fields are required');
      return;
    }
    
    // In a real app, this would be an API call to create a new admin user
    const newAdmin = {
      ...newAdminData,
      id: Math.random().toString(36).substr(2, 9), // Generate simple ID
      isLoggedIn: false
    };
    
    // Update state
    setUsers([...users, newAdmin]);
    
    // Reset form
    setNewAdminData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      isAdmin: true
    });
    
    alert('New admin user created successfully!');
  };

  // If not logged in or not an admin, redirect to login
  if (!loading && (!user || !user.isAdmin)) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Render different content based on active view
  const renderContent = () => {
    switch(activeView) {
      case 'overview':
        return (
          <div className="admin-overview">
            <h2>Platform Overview</h2>
            
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <div className="stat-value">{stats.totalUsers}</div>
              </div>
              
              <div className="stat-card">
                <h3>Total Requests</h3>
                <div className="stat-value">{stats.totalRequests}</div>
              </div>
              
              <div className="stat-card">
                <h3>Active Requests</h3>
                <div className="stat-value">{stats.activeRequests}</div>
              </div>
              
              <div className="stat-card">
                <h3>Completed Requests</h3>
                <div className="stat-value">{stats.completedRequests}</div>
              </div>
            </div>
            
            <div className="chart-container">
              <h3>Requests by Category</h3>
              <div className="chart-data">
                {Object.entries(stats.requestsByCategory).map(([category, count]) => (
                  <div key={category} className="chart-bar">
                    <div className="chart-label">{category}</div>
                    <div 
                      className="chart-value" 
                      style={{ 
                        width: `${count / stats.totalRequests * 100}%`,
                        minWidth: '20px'
                      }}
                    >
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'users':
        return (
          <div className="admin-users">
            <h2>User Management</h2>
            
            <div className="admin-section">
              <h3>All Users</h3>
              
              {users.length === 0 ? (
                <p>No users found in the system.</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.firstName} {user.lastName}</td>
                          <td>{user.email || 'N/A'}</td>
                          <td>{user.phone || 'N/A'}</td>
                          <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                          <td>
                            <button 
                              className="btn-small btn-danger"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="admin-section">
              <h3>Add New Admin</h3>
              
              <form className="admin-form" onSubmit={handleAddAdmin}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={newAdminData.firstName}
                      onChange={handleAdminInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={newAdminData.lastName}
                      onChange={handleAdminInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={newAdminData.email}
                      onChange={handleAdminInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={newAdminData.password}
                      onChange={handleAdminInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-actions right">
                  <button type="submit" className="btn-primary">Add Admin User</button>
                </div>
              </form>
            </div>
          </div>
        );
        
      case 'requests':
        return (
          <div className="admin-requests">
            <h2>Assistance Requests</h2>
            
            {assistanceRequests.length === 0 ? (
              <p>No assistance requests found in the system.</p>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Date & Time</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assistanceRequests.map(request => (
                      <tr key={request.id}>
                        <td>#{request.id.substring(0, 6)}</td>
                        <td>{request.name}</td>
                        <td>{request.categoryLabel}</td>
                        <td>{request.date} at {request.time}</td>
                        <td>{request.location}</td>
                        <td>
                          <select
                            value={request.status}
                            onChange={(e) => handleStatusChange(request.id, e.target.value)}
                            className={`status-${request.status}`}
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn-small btn-secondary"
                            onClick={() => {
                              alert(`Request Description: ${request.description}\nContact: ${request.phone}`);
                            }}
                          >
                            View
                          </button>
                          <button 
                            className="btn-small btn-danger"
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
        
      case 'settings':
        return (
          <div className="admin-settings">
            <h2>System Settings</h2>
            
            <div className="admin-section">
              <h3>Platform Settings</h3>
              
              <form className="admin-form">
                <div className="form-group">
                  <label htmlFor="platformName">Platform Name</label>
                  <input
                    type="text"
                    id="platformName"
                    defaultValue="Campus Assistance Platform"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="contactEmail">Support Email</label>
                  <input
                    type="email"
                    id="contactEmail"
                    defaultValue="support@campushelp.edu"
                  />
                </div>
                
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="enableRegistration"
                    defaultChecked={true}
                  />
                  <label htmlFor="enableRegistration">Enable User Registration</label>
                </div>
                
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="requireApproval"
                    defaultChecked={false}
                  />
                  <label htmlFor="requireApproval">Require Admin Approval for New Users</label>
                </div>
                
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="enableNotifications"
                    defaultChecked={true}
                  />
                  <label htmlFor="enableNotifications">Enable Email Notifications</label>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn-primary" onClick={() => alert('Settings saved!')}>
                    Save Settings
                  </button>
                </div>
              </form>
            </div>
            
            <div className="admin-section">
              <h3>System Maintenance</h3>
              
              <div className="admin-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear ALL completed requests?')) {
                      const updatedRequests = assistanceRequests.filter(req => req.status !== 'completed');
                      localStorage.setItem('assistanceRequests', JSON.stringify(updatedRequests));
                      setAssistanceRequests(updatedRequests);
                      calculateStatistics(users, updatedRequests);
                      alert('Completed requests have been cleared');
                    }
                  }}
                >
                  Clear Completed Requests
                </button>
                
                <button 
                  className="btn-danger"
                  onClick={() => {
                    if (window.confirm('⚠️ WARNING: This will delete ALL data from the system. This action cannot be undone. Are you absolutely sure?')) {
                      // Clear all data
                      // Note: In a real application, this would be an API call with proper authentication
                      localStorage.removeItem('assistanceRequests');
                      setAssistanceRequests([]);
                      calculateStatistics(users, []);
                      alert('All request data has been cleared');
                    }
                  }}
                >
                  Reset System Data
                </button>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Select a section from the sidebar</div>;
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>Admin Panel</h2>
        </div>
        
        <div className="admin-menu">
          <button 
            className={activeView === 'overview' ? 'active' : ''}
            onClick={() => setActiveView('overview')}
          >
            <i className="menu-icon">📊</i>
            Dashboard
          </button>
          
          <button 
            className={activeView === 'users' ? 'active' : ''}
            onClick={() => setActiveView('users')}
          >
            <i className="menu-icon">👥</i>
            Users
          </button>
          
          <button 
            className={activeView === 'requests' ? 'active' : ''}
            onClick={() => setActiveView('requests')}
          >
            <i className="menu-icon">🔔</i>
            Requests
          </button>
          
          <button 
            className={activeView === 'settings' ? 'active' : ''}
            onClick={() => setActiveView('settings')}
          >
            <i className="menu-icon">⚙️</i>
            Settings
          </button>
        </div>
        
        <div className="admin-footer">
          <Link to="/dashboard" className="btn-secondary btn-small">
            Return to User Dashboard
          </Link>
          
          <button 
            className="btn-logout"
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
          >
            Log Out
          </button>
        </div>
      </div>
      
      <div className="admin-content">
        <div className="admin-header">
          <div className="admin-breadcrumb">
            Admin Panel &gt; {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
          </div>
          
          <div className="admin-user-info">
            <span className="admin-username">{user.firstName} {user.lastName}</span>
            <span className="admin-role">Administrator</span>
          </div>
        </div>
        
        <div className="admin-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;