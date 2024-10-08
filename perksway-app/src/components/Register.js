import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // Updated styles
import perksImage from './perksImage.png'; // Ensure image path is correct

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student', // Default role to match the API's requirement
    first_name: '',  // Matching API's field for first name
    last_name: ''    // Matching API's field for last name
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    // Ensure that the passwords match before making the API call
    if (userData.password !== userData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          first_name: userData.first_name,
          last_name: userData.last_name
        })
      });

      const data = await response.json();
      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.detail || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="form-image-container">
        <div className="form-container">
          <form onSubmit={handleRegister} className="registration-form">
            <h2>Please register to Perksway</h2>
            {error && <p className="error">{error}</p>}

            {/* Username field */}
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              value={userData.username}
              onChange={handleInputChange}
              required
            />

            {/* First Name field */}
            <label htmlFor="first_name">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              placeholder="First Name"
              value={userData.first_name}
              onChange={handleInputChange}
              required
            />

            {/* Last Name field */}
            <label htmlFor="last_name">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              placeholder="Last Name"
              value={userData.last_name}
              onChange={handleInputChange}
              required
            />

            {/* Email field */}
            <label htmlFor="email">E-mail Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="E-mail Address"
              value={userData.email}
              onChange={handleInputChange}
              required
            />

            {/* Password field */}
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={userData.password}
              onChange={handleInputChange}
              required
            />

            {/* Confirm Password field */}
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={userData.confirmPassword}
              onChange={handleInputChange}
              required
            />

            {/* Role field */}
            <div className="role-selector">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={userData.role === 'teacher'}
                  onChange={handleInputChange}
                /> Teacher
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={userData.role === 'student'}
                  onChange={handleInputChange}
                /> Student
              </label>
            </div>

            {/* Register button */}
            <div className="buttons-container">
              <button type="submit" className="register-button" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
              <button type="button" className="login-button" onClick={() => navigate('/login')}>
                Login
              </button>
            </div>
          </form>
        </div>
        <div className="image-container">
          <img src={perksImage} alt="Perksway Image" />
        </div>
      </div>
    </div>
  );
};

export default Register;
