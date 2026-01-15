import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './component/Navbar';
import ProtectedRoute from './component/ProtectedRoute'; // Import the guard bruh
import { Toaster } from 'react-hot-toast';


function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar stays at the top on all pages */}
      <Toaster position="top-right" />
      <Navbar />

      <Routes>
        {/* Public Route: Anyone can see this */}
        <Route path="/" element={<Home />} />

        {/* Protected Route: Only accessible after login */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Optional: Catch-all route to redirect 404s to Home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;