import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styling/RequestsPage.css'; // Assuming you have a CSS file for styling

const RequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Categories of special needs for filtering
  const categories = [
    'All',
    'Mobility',
    'Visual',
    'Hearing',
    'Learning',
    'Medical',
    'Temporary'
  ];

  // Mock data - in a real app, you would fetch this from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockRequests = [
        {
          id: 1,
          patientName: 'Alex Johnson',
          patientId: 'p1001',
          category: 'Mobility',
          description: 'Need assistance getting to classes in the Science Building on Tuesdays and Thursdays',
          duration: '4 weeks',
          schedule: 'Tue & Thu, 9am-11am',
          location: 'Science Building',
          status: 'pending',
          urgency: 'medium',
          postedDate: '2025-05-10',
          verificationStatus: 'verified'
        },
        {
          id: 2,
          patientName: 'Jamie Smith',
          patientId: 'p1002',
          category: 'Visual',
          description: 'Looking for someone to help take notes during Biology 101 lectures',
          duration: 'Full semester',
          schedule: 'Mon, Wed, Fri 2pm-3:30pm',
          location: 'Life Sciences Building, Room 205',
          status: 'pending',
          urgency: 'high',
          postedDate: '2025-05-09',
          verificationStatus: 'verified'
        },
        {
          id: 3,
          patientName: 'Taylor Rodriguez',
          patientId: 'p1003',
          category: 'Learning',
          description: 'Need a study partner for Calculus II who can help explain concepts',
          duration: 'Ongoing',
          schedule: 'Flexible, 2-3 hours per week',
          location: 'Library or Student Center',
          status: 'pending',
          urgency: 'low',
          postedDate: '2025-05-12',
          verificationStatus: 'verified'
        },
        {
          id: 4,
          patientName: 'Morgan Lee',
          patientId: 'p1004',
          category: 'Hearing',
          description: 'Need assistance during group discussions in Psychology class',
          duration: '6 weeks',
          schedule: 'Wed 3pm-5pm',
          location: 'Social Sciences Building, Room 112',
          status: 'pending',
          urgency: 'medium',
          postedDate: '2025-05-08',
          verificationStatus: 'pending'
        },
        {
          id: 5,
          patientName: 'Riley Wilson',
          patientId: 'p1005',
          category: 'Medical',
          description: 'Need help carrying books and materials after recent surgery',
          duration: '3 weeks',
          schedule: 'Mon-Fri, between classes',
          location: 'Campus-wide',
          status: 'pending',
          urgency: 'high',
          postedDate: '2025-05-11',
          verificationStatus: 'verified'
        },
        {
          id: 6,
          patientName: 'Casey Martin',
          patientId: 'p1006',
          category: 'Temporary',
          description: 'Broke my arm and need assistance with note-taking in History classes',
          duration: '6 weeks',
          schedule: 'Tue & Thu, 1pm-4pm',
          location: 'Humanities Building',
          status: 'pending',
          urgency: 'medium',
          postedDate: '2025-05-07',
          verificationStatus: 'verified'
        }
      ];
      setRequests(mockRequests);
      setLoading(false);
    }, 1000);
  }, []);

  // Check authentication
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    
    if (!isLoggedIn || userType !== 'volunteer') {
      navigate('/');
    }
  }, [navigate]);

  // Filter and search functionality
  const filteredRequests = requests.filter(request => {
    const matchesFilter = filter === 'all' || request.category.toLowerCase() === filter.toLowerCase();
    const matchesSearch = request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAcceptRequest = (requestId) => {
    // In a real app, you would make an API call here
    setRequests(requests.map(request => 
      request.id === requestId 
        ? {...request, status: 'accepted'} 
        : request
    ));
    
    // Show confirmation
    alert(`You have accepted request #${requestId}. Please check your dashboard for details.`);
  };

  return (
    <div className="requests-page">
      <div className="container">
        <div className="page-header">
          <h1>Help Requests</h1>
          <p>Browse and accept requests from students who need assistance</p>
        </div>

        <div className="filter-search-container">
          <div className="filter-container">
            <label htmlFor="filter">Filter by need:</label>
            <select 
              id="filter" 
              value={filter} 
              onChange={(e) => setFilter(e.target.value.toLowerCase())}
            >
              {categories.map((category, index) => (
                <option key={index} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading requests...</p>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="requests-grid">
            {filteredRequests.map((request) => (
              <div 
                key={request.id} 
                className={`request-card ${request.urgency} ${request.status !== 'pending' ? 'accepted' : ''}`}
              >
                <div className="request-header">
                  <span className={`badge ${request.category.toLowerCase()}`}>
                    {request.category}
                  </span>
                  <span className={`urgency-badge ${request.urgency}`}>
                    {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                  </span>
                </div>
                
                <h3>{request.description}</h3>
                
                <div className="request-details">
                  <p><strong>Posted by:</strong> {request.patientName}</p>
                  <p><strong>Duration:</strong> {request.duration}</p>
                  <p><strong>Schedule:</strong> {request.schedule}</p>
                  <p><strong>Location:</strong> {request.location}</p>
                  <p><strong>Posted:</strong> {new Date(request.postedDate).toLocaleDateString()}</p>
                </div>
                
                {request.status === 'pending' ? (
                  <button 
                    className="accept-btn"
                    onClick={() => handleAcceptRequest(request.id)}
                    disabled={request.verificationStatus !== 'verified'}
                  >
                    {request.verificationStatus === 'verified' 
                      ? 'Accept Request' 
                      : 'Pending Verification'}
                  </button>
                ) : (
                  <div className="accepted-status">
                    <i className="fa fa-check-circle"></i> Request Accepted
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-requests">
            <h3>No matching requests found</h3>
            <p>Try adjusting your filters or check back later for new requests.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;