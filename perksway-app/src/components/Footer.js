import React from 'react';
import './Footer.css';  // CSS for footer styling

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Left side: Logo and message */}
        <div className="footer-left">
          <img src="/images/cropped-Perksway-02-150x150.png" alt="Perksway Logo" className="footer-logo" /> {/* Replace with actual logo path */}
          <p className="footer-message">
            Check your bits wallet here and spend it to purchase amazing rewards that may ease your workload. Spend wisely!
          </p>
        </div>

        {/* Right side: Navigation links */}
        <div className="footer-right">
          <ul className="footer-links">
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/bit-bazaar">Bit Bazaar</a></li>
            <li><a href="/bit-fortune">Bit Fortune!!!</a></li>
            <li><a href="/bit-fortune-2">Bit Fortune!</a></li>
            <li><a href="/logout">Logout</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom: Copyright info */}
      <div className="footer-bottom">
        <p>Copyright © 2024 | Perksway</p>
      </div>
    </footer>
  );
};

export default Footer;
