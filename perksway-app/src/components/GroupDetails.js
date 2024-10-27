import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './GroupDetails.css';
import Navbar from './Navbar';
import Footer from './Footer';

const GroupDetails = () => {
  const { groupId } = useParams();
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetchGroupStudents(token);
  }, []);

  const fetchGroupStudents = (token) => {
    axios.get(`http://localhost:8000/api/v1/classes/group/details/${groupId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setStudents(response.data.students);
      })
      .catch(error => {
        console.error('Error fetching students:', error);
        setError('Failed to load students.');
      });
  };

  return (
    <div className="group-details-page">
      <Navbar />
      <div className="group-details-container">
        {error && <div className="error-message">{error}</div>}
        <h3>Group Members</h3>
        {students.length > 0 ? (
          <ul className="students-list">
            {students.map((student) => (
              <li key={student.id} className="student-item">
                <h4>{student.first_name} {student.last_name}</h4>
                <p>({student.email})</p>
              </li>
            ))}
          </ul>
        ) : (
          <div>No students found in this group</div>
        )}
      </div>
      <Footer />
    </div>
  );
  
};

export default GroupDetails;
