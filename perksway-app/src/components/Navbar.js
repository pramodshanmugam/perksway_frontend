import React from 'react';
import './Navbar.css';  // Import the CSS for styling
import { FaWallet, FaShoppingCart, FaUser } from 'react-icons/fa';  // FontAwesome Icons

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/images/Perksway-01-2048x404.png" alt="Perksway Logo" className="logo" />  {/* Replace with actual logo */}
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
          <span>฿0.00</span>
        </div>
        <div className="navbar-item">
          <FaShoppingCart className="navbar-icon" />
          <span>฿0.00</span>
        </div>
        <div className="navbar-item">
          <FaUser className="navbar-icon" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
