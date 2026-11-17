import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import NavigationBar from './components/NavigationBar';
import LoginSignup from './pages/LoginSignup';
import Dashboard from './pages/Dashboard';
import RideSearch from './pages/RideSearch';
import OfferRide from './pages/OfferRide';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <NavigationBar />
      <main className="flex-1">
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginSignup />} />

          {/* Protected Core Student Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <RideSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offer-ride"
            element={
              <ProtectedRoute>
                <OfferRide />
              </ProtectedRoute>
            }
          />

          {/* Fallback Redirection */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
