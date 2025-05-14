import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { HashRouter as Router , Route , Routes , Navigate } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer'; 
import UserRegistration from './components/UserRegistration';
import Dashboard from './components/Dashboard';
import VolunteerMode from './components/VolunteerMode';
import PatientMode from './components/PatientMode';
import Login from './components/Login';

// Protected Route component to check authentication
const ProtectedRoute = ({ children }) => {
  // Check if user is logged in
  const userData = localStorage.getItem('user');
  let isAuthenticated = false;
  
  if (userData) {
    const user = JSON.parse(userData);
    isAuthenticated = user.isLoggedIn === true;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the children components
  return children;
};

function App() {
  // State to track authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication status on app load and changes
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsAuthenticated(user.isLoggedIn === true);
      } else {
        setIsAuthenticated(false);
      }
    };
    
    // Check initially
    checkAuth();
    
    // Set up event listener for storage changes
    // This helps keep auth state in sync across tabs/windows
    window.addEventListener('storage', checkAuth);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/register" element={<UserRegistration />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/volunteer-mode" 
              element={
                <ProtectedRoute>
                  <VolunteerMode />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient-mode" 
              element={
                <ProtectedRoute>
                  <PatientMode />
                </ProtectedRoute>
              } 
            />
            
            {/* Root path redirects to register if not authenticated, dashboard if authenticated */}
            <Route path="/" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/register" replace />
            } />
            
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;