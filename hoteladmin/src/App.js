import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Signin from './Signin';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute'; // Ensure this is correctly imported

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/" element={<Navigate replace to="/signin" />} />
      </Routes>
    </Router>
  );
}


export default App;
