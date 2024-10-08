import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import Navbar from './Navbar';
import Footer from './Footer';

const Dashboard = () => {
  const [classes, setClasses] = useState([]); // Classes data
  const [selectedClass, setSelectedClass] = useState(null); // Currently selected class
  const [students, setStudents] = useState([]); // Only students in the class
  const [activeTab, setActiveTab] = useState('Students'); // Active tab: Students, Guilds, etc.
  const [sortOption, setSortOption] = useState('Oldest'); // Sorting option
  const [searchQuery, setSearchQuery] = useState(''); // Search input
  const [currentPage, setCurrentPage] = useState(1); // Pagination

  // Fetch class data with JWT token
  useEffect(() => {
    const token = localStorage.getItem('access_token');  // Fetch the access token from localStorage
  
    axios.get('http://localhost:8000/api/v1/classes/', {
      headers: {
        Authorization: `Bearer ${token}`  // Attach the token in the headers
      }
    })
    .then(response => {
      setClasses(response.data);  // Assuming your API returns a list of classes
      if (response.data.length > 0) {
        setSelectedClass(response.data[0]);  // Set the first class as the default selected
        setStudents(response.data[0].students);  // Assuming each class has a 'students' field
      }
    })
    .catch(error => {
      console.error('Error fetching classes:', error);
    });
  }, []);
  
  // Leave class functionality
  const handleLeaveClass = () => {
    const token = localStorage.getItem('access_token');  // Get the JWT token
    
    axios.post(`http://localhost:8000/api/v1/classes/leave/${selectedClass.class_code}/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`  // Attach token to the leave request
      }
    })
    .then(response => {
      alert('Successfully left the class');
    })
    .catch(error => {
      console.error('Error leaving class:', error);
    });
  };

  return (
    <div className="dashboard-page">
      <Navbar />  {/* Render the Navbar at the top */}
              <div className="dashboard-container">
            <div className="class-card">
              <div className="class-header">
                <div className="class-icon-container">
                  <img src="/images/PerksClass.png" alt="class-icon" className="class-icon" />
                </div>
                <div className="class-info">
                  <h2>{selectedClass?.name} <span className="class-code">{selectedClass?.class_code}</span></h2>
                  <div className="class-meta">
                    <span className="admin-list">
                      <strong>Admin:</strong> {selectedClass?.admins?.map(admin => (
                        <span key={admin.id}>{admin.name}</span>
                      ))}
                    </span>
                    <span className="students-count"><strong>Students:</strong> {selectedClass?.students.length}</span>
                  </div>
                </div>
                <button className="leave-button" onClick={handleLeaveClass}>Leave</button>
              </div>
            </div>
                    
            <div className="tabs">
              <button onClick={() => setActiveTab('Students')} className={`tab-button ${activeTab === 'Students' ? 'active' : ''}`}>Students</button>
              <button onClick={() => setActiveTab('Guilds')} className={`tab-button ${activeTab === 'Guilds' ? 'active' : ''}`}>Guilds</button>
              <button onClick={() => setActiveTab('Bit Bazaar')} className={`tab-button ${activeTab === 'Bit Bazaar' ? 'active' : ''}`}>Bit Bazaar</button>
              <button className="settings-tab">Settings</button>
            </div>
                    
            <div className="class-content">
              <div className="search-and-sort">
                <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                  <option value="Oldest">Oldest</option>
                  <option value="Newest">Newest</option>
                  <option value="Alphabetical">Alphabetical</option>
                </select>
                <input
                  type="text"
                  placeholder="Select a Field"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
                    
              <div className="students-list">
                {students
                  .filter(student => student.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice((currentPage - 1) * 10, currentPage * 10)
                  .map((student, index) => (
                    <div key={index} className="student-card">
                      <div className="student-email">{student}</div>
                    </div>
                ))}
              </div>
              
              <div className="pagination">
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                <span>{currentPage}</span>
                <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
              </div>
            </div>
          </div>
          <div className="footer">
            <Footer />  {/* Render the Footer at the bottom */}
            </div>
          </div>
  );
};

export default Dashboard;
