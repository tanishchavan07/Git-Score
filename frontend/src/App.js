import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileAnalysis from './pages/ProfileAnalysis';
import GlobalLeaderboard from './pages/GlobalLeaderboard';
import UserDashboard from './pages/UserDashboard';
import EditProfile from './pages/EditProfile';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-wrapper">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/analyze/:username" element={<ProfileAnalysis />} />
              <Route path="/profile/:username" element={<ProfileAnalysis />} />
              <Route path="/leaderboard" element={<GlobalLeaderboard />} />
              
              <Route 
                path="/dashboard" 
                element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} 
              />
              <Route 
                path="/edit-profile" 
                element={<ProtectedRoute><EditProfile /></ProtectedRoute>} 
              />
            </Routes>
          </main>
          <BottomNav />
        </div>
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#1A1A2E',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }
        }}/>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
