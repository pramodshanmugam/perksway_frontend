// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaUser, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';
import './Navbar.css';

const Navbar = () => {
  const [walletBalance, setWalletBalance] = useState('Loading...');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWalletBalance = async () => {
      const token = localStorage.getItem('access_token');
      const classId = localStorage.getItem('class_id');

      if (token && classId) {
        try {
          const response = await axios.get(`http://localhost:8000/api/v1/classes/wallets/${classId}/balance/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setWalletBalance(`฿${response.data.balance.toFixed(2)}`);
          localStorage.setItem('wallet_balance', response.data.balance.toFixed(2));
        } catch (error) {
          console.error('Failed to fetch wallet balance:', error);
          setWalletBalance('Failed to fetch');
        }
      } else {
        setWalletBalance('No token/class ID');
      }
    };

    fetchWalletBalance();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('class_id');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/images/Perksway-01-2048x404.png" alt="Perksway Logo" className="logo" />
      </div>
      
      <ul className="navbar-links">
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/bit-bazaar">Bit Bazaar</a></li>
        <li><a href="/bit-fortune">Bit Fortune!</a></li>
        <li><a href="/bit-fortune-2">Bit Fortune!!!</a></li>
      </ul>

      <div className="navbar-icons">
        <div className="navbar-item">
          <FaWallet className="navbar-icon" />
          <span>{walletBalance}</span>
        </div>
        <div className="navbar-item">
          <FaUser className="navbar-icon" />
        </div>
        <div className="navbar-item" onClick={handleLogout}>
          <FaSignOutAlt className="navbar-icon" title="Logout" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
