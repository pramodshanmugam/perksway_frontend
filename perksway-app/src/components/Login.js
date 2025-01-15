import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const requestBody = {
      email,
      password,
    };

    try {
      const response = await fetch('http://167.88.45.167:8000/api/v1/users/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        console.log("loggedinn");
        
        navigate('/dashboard/'); // Navigate to dashboard after successful login

        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        console.log("loggedin");
        
      } else {
        setError(data.detail || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register'); // Navigate to the registration page
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-form-section">
          <form onSubmit={handleLogin}>
            <h2>Please log in to your account</h2>
            {error && <p className="error">{error}</p>}
            <input
              type="text"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="form-options">
              <input type="checkbox" id="keep-signed-in" />
              <label htmlFor="keep-signed-in">Keep me signed in</label>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button type="button" className="register-button" onClick={handleRegisterClick}>
              Register
            </button>
            <div className="forgot-password">
              <a href="/forgot-password">Forgot your password?</a>
            </div>
          </form>
        </div>
        <div className="login-image-section">
          <img src="/Perksway-Design-01-1536x1338.png" alt="Perksway Illustration" />
        </div>
      </div>
    </div>
  );
};

export default Login;
