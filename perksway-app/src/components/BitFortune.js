import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './BitFortune.css';

const BitFortune = () => {
  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="bit-fortune-container">
        <h1>Byte Fortune!!!</h1>
        <p>
          Fortune smiles on the bold! Dare to tempt fate with Byte Fortune, the mystery box bursting with possibilities.
          For a sprinkle of bytes, you could unlock a treasure from the Byte Bazaar – maybe even something truly extraordinary!
          But remember, fortune favors the brave… will you attempt the Byte Fortune? Spend wisely! 😉
        </p>
        <img
          src="/images/byte-fortune.png"
          alt="Byte Fortune Logo"
          className="byte-fortune-image"
        />
        <div className="bit-fortune-price">
          <h3>Byte Fortune!!!</h3>
          <p>฿200.00</p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BitFortune;
