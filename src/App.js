import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';


import Header from './components/Header';
import Footer from './components/Footer'; 
import UserSelection from './components/UserSelection'; 
import PatientRegistration from './components/Registration/PatientRegistration';
import VolunteerRegistration from './components/Registration/VolunteerRegistration'; 
import RequestsPage from './components/RequestsPage'; 
import Dashboard from './components/Dashboard'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<UserSelection />} />
            <Route path="/register/patient" element={<PatientRegistration />} />
            <Route path="/register/volunteer" element={<VolunteerRegistration />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/dashboard/:userType" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;