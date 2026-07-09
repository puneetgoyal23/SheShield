/**
 * App — Root component.
 * Sets up the routing for Splash Screen, Login, and the MapShell.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './components/screens/SplashScreen/SplashScreen';
import LoginScreen from './components/screens/LoginScreen/LoginScreen';
import LocationPermissionScreen from './components/screens/LocationPermissionScreen/LocationPermissionScreen';
import MapShell from './components/layout/MapShell/MapShell';
import ProtectedRoute from './components/layout/ProtectedRoute/ProtectedRoute';

import { APIProvider } from '@vis.gl/react-google-maps';

function App() {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={['places']}>
      <BrowserRouter>
        <Routes>
          {/* Entry point: Splash Screen */}
          <Route path="/" element={<SplashScreen />} />
          
          {/* Authentication */}
          <Route path="/login" element={<LoginScreen />} />
          
          {/* Location Permission Screen */}
          <Route path="/location" element={<ProtectedRoute><LocationPermissionScreen /></ProtectedRoute>} />
          
          {/* Main Application Shell */}
          <Route path="/map" element={<ProtectedRoute><MapShell /></ProtectedRoute>} />

          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </APIProvider>
  );
}

export default App;
