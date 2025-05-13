// src/services/RequestDataService.js

// Initial sample data for requests
const initialRequests = [
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
  },
  {
    id: 7,
    patientName: 'Jordan Patel',
    patientId: 'p1007',
    category: 'Visual',
    description: 'Need assistance navigating campus and reading board notes for Computer Science courses',
    duration: 'Full semester',
    schedule: 'Mon-Fri, 10am-2pm',
    location: 'Computer Science Building',
    status: 'pending',
    urgency: 'high',
    postedDate: '2025-05-13',
    verificationStatus: 'verified'
  },
  {
    id: 8,
    patientName: 'Quinn Adams',
    patientId: 'p1008',
    category: 'Mobility',
    description: 'Need help carrying equipment to and from Engineering lab sessions',
    duration: '10 weeks',
    schedule: 'Mon & Wed, 1pm-3pm',
    location: 'Engineering Building, 3rd Floor',
    status: 'pending',
    urgency: 'medium',
    postedDate: '2025-05-12',
    verificationStatus: 'verified'
  }
];

class RequestDataService {
  constructor() {
    // Initialize localStorage with sample data if it doesn't exist
    if (!localStorage.getItem('requests')) {
      localStorage.setItem('requests', JSON.stringify(initialRequests));
    }
    
    // Initialize volunteer accepted requests if it doesn't exist
    if (!localStorage.getItem('volunteerAcceptedRequests')) {
      localStorage.setItem('volunteerAcceptedRequests', JSON.stringify({}));
    }
  }

  // Get all requests
  getAllRequests() {
    const requests = JSON.parse(localStorage.getItem('requests'));
    return requests;
  }

  // Get requests filtered by volunteer ID
  getRequestsByVolunteerId(volunteerId) {
    const acceptedRequests = JSON.parse(localStorage.getItem('volunteerAcceptedRequests'));
    const volunteerRequests = acceptedRequests[volunteerId] || [];
    
    const allRequests = this.getAllRequests();
    return allRequests.filter(request => volunteerRequests.includes(request.id));
  }

  // Accept a request
  acceptRequest(requestId, volunteerId) {
    // Update request status
    const requests = this.getAllRequests();
    const updatedRequests = requests.map(request => 
      request.id === requestId 
        ? {...request, status: 'accepted'} 
        : request
    );
    localStorage.setItem('requests', JSON.stringify(updatedRequests));
    
    // Associate request with volunteer
    const acceptedRequests = JSON.parse(localStorage.getItem('volunteerAcceptedRequests'));
    if (!acceptedRequests[volunteerId]) {
      acceptedRequests[volunteerId] = [];
    }
    acceptedRequests[volunteerId].push(requestId);
    localStorage.setItem('volunteerAcceptedRequests', JSON.stringify(acceptedRequests));
    
    return true;
  }

  // Add a new request (for patient side)
  addRequest(request) {
    const requests = this.getAllRequests();
    const newId = Math.max(...requests.map(r => r.id)) + 1;
    const newRequest = {
      ...request,
      id: newId,
      status: 'pending',
      postedDate: new Date().toISOString().split('T')[0],
      verificationStatus: Math.random() > 0.2 ? 'verified' : 'pending' // Random verification for demo
    };
    
    requests.push(newRequest);
    localStorage.setItem('requests', JSON.stringify(requests));
    return newRequest;
  }

  // Reset all data (for testing)
  resetData() {
    localStorage.setItem('requests', JSON.stringify(initialRequests));
    localStorage.setItem('volunteerAcceptedRequests', JSON.stringify({}));
  }
}

export default new RequestDataService();