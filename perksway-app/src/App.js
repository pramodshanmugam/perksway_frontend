import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import NotFound from './components/NotFound';
import Guilds from './components/Guilds';
import GroupDetails from './components/GroupDetails'; // Import the GroupDetails component
import ItemList from './components/ItemList'; // Import the ItemList component for Bit Bazaar
import BitFortune from './components/BitFortune';

function App() {
  const token = localStorage.getItem('access_token'); // Check if user is logged in

  // Private Route component to restrict access
  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Private routes for logged-in users */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        
        {/* Bit Bazaar Route */}
        <Route path="/bit-bazaar" element={<PrivateRoute><ItemList /></PrivateRoute>} />
        
        <Route path="/guilds/:classId" element={<PrivateRoute><Guilds /></PrivateRoute>} />
        <Route path="/groups/:groupId" element={<PrivateRoute><GroupDetails /></PrivateRoute>} />
        <Route path="/bit-fortune" element={<PrivateRoute><BitFortune /></PrivateRoute>} />

        {/* Fallback for non-existent routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
