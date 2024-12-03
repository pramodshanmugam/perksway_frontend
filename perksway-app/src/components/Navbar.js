import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { FaWallet, FaUser } from 'react-icons/fa';
import axios from 'axios';  // Import axios for HTTP requests

const Navbar = () => {
  const [walletBalance, setWalletBalance] = useState('Loading...');

  useEffect(() => {
    const fetchWalletBalance = async () => {
      const token = localStorage.getItem('access_token');
      const classId = localStorage.getItem('class_id');  // Retrieve classId from local storage

      console.log('Fetching wallet balance with token:', token, 'and class ID:', classId);

      if (token && classId) {
        try {
          const response = await axios.get(`http://localhost:8000/api/v1/classes/wallets/${classId}/balance/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Wallet balance fetched:', response.data);

          if (response.data && typeof response.data.balance === 'number') {
            setWalletBalance(`฿${response.data.balance.toFixed(2)}`);
          } else {
            console.error('Invalid balance data:', response.data);
            setWalletBalance('Invalid balance data');
          }
        } catch (error) {
          console.error('Failed to fetch wallet balance:', error);
          setWalletBalance('Failed to fetch');
        }
      } else {
        setWalletBalance('No token/class ID');
      }
    };

    fetchWalletBalance();

    // Re-fetch when token or classId changes
  }, [localStorage.getItem('access_token'), localStorage.getItem('class_id')]);

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
      </div>
    </nav>
  );
};

export default Navbar;
