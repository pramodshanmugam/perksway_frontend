import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import Navbar from './Navbar';
import Footer from './Footer';

const Dashboard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('Students');
  const [sortOption, setSortOption] = useState('Oldest');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classCode, setClassCode] = useState('');
  const [joinError, setJoinError] = useState(null);
  const [role, setRole] = useState(null);
  const [showCreateClassPopup, setShowCreateClassPopup] = useState(false);

  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [classCodeInput, setClassCodeInput] = useState('');

  const studentsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setLoading(true);

    axios.get('http://localhost:8000/api/v1/users/user/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        const user = response.data;
        setRole(user.role);
        fetchClasses(token);
      })
      .catch(error => {
        console.error('Error fetching user details:', error);
        setError('Failed to load user details.');
        setLoading(false);
      });
  }, []);

  const fetchClasses = (token) => {
    axios.get('http://localhost:8000/api/v1/classes/', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => {
      const fetchedClasses = response.data;
      setClasses(fetchedClasses);
      
      // Determine the class to select: first from the list or based on a stored preference
      let selected = fetchedClasses[0] || null;
      
      // Example: Select a class based on previously selected class id from local storage
      const storedClassId = localStorage.getItem('class_id');
      if (storedClassId) {
        const storedClass = fetchedClasses.find(cls => cls.id.toString() === storedClassId);
        if (storedClass) {
          selected = storedClass;
        }
      }
  
      if (selected) {
        setSelectedClass(selected);
        setStudents(selected.students);
        // Update the class_id in local storage to reflect the current selection
        localStorage.setItem('class_id', selected.id);
      } else {
        setSelectedClass(null); // No classes available
      }
  
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching classes:', error);
      setError('Failed to load classes.');
      setLoading(false);
    });
  };
  
  const handleLeaveClass = () => {
    const token = localStorage.getItem('access_token');

    axios.post(`http://localhost:8000/api/v1/classes/leave/${selectedClass.class_code}/`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        alert('Successfully left the class');
        setSelectedClass(null);
      })
      .catch(error => {
        console.error('Error leaving class:', error);
        setError('Failed to leave class.');
      });
  };

  const handleJoinClass = () => {
    const token = localStorage.getItem('access_token');
    setJoinError(null);

    axios.post(`http://localhost:8000/api/v1/classes/join/${classCode}/`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        const newClass = response.data;
        setClasses([...classes, newClass]);
        setSelectedClass(newClass);
        setStudents(newClass.students);
        setClassCode('');
        alert('Successfully joined the class');
      })
      .catch(error => {
        console.error('Error joining class:', error);
        setJoinError('Failed to join class. Please check the class code.');
      });
  };

  const handleCreateClass = () => {
    const token = localStorage.getItem('access_token');
    const classData = {
      name: className,
      description: classDescription,
      class_code: classCodeInput,
    };

    axios.post('http://localhost:8000/api/v1/classes/create/', classData, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        const createdClass = response.data;
        setClasses([...classes, createdClass]);
        setSelectedClass(createdClass);
        setShowCreateClassPopup(false);
        alert('Class created successfully');
        setClassName('');
        setClassDescription('');
        setClassCodeInput('');
      })
      .catch(error => {
        console.error('Error creating class:', error);
        alert('Failed to create class.');
      });
  };

  const filteredStudents = students
    .filter(student => student.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice((currentPage - 1) * studentsPerPage, currentPage * studentsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(students.length / studentsPerPage)) {
      setCurrentPage(newPage);
    }
  };

  const handleGuildsClick = () => {
    if (selectedClass) {
      navigate(`/guilds/${selectedClass.id}`);
    } else {
      alert('Please select a class first.');
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {selectedClass ? (
              <div className="class-card">
                <div className="class-header">
                  <div className="class-icon-container">
                    <img src="/images/PerksClass.png" alt="class-icon" className="class-icon" />
                  </div>
                  <div className="class-info">
                    <h2>{selectedClass.name} <span className="class-code">{selectedClass.class_code}</span></h2>
                    <div className="class-meta">
                      <span className="admin-list">
                        <strong>Admin:</strong> {selectedClass.admins?.map(admin => (
                          <span key={admin.id}>{admin.name}</span>
                        ))}
                      </span>
                      <span className="students-count"><strong>Students:</strong> {selectedClass.students.length}</span>
                    </div>
                  </div>
                  <button className="leave-button" onClick={handleLeaveClass}>Leave</button>
                </div>
              </div>
            ) : (
              <div>No class selected</div>
            )}

            {role === 'student' && (
              <div className="join-class-container">
                <h3>Join a New Class</h3>
                <input
                  type="text"
                  placeholder="Enter Class Code"
                  className="join-class-input"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                />
                <button onClick={handleJoinClass} className="join-class-button">Join Class</button>
                {joinError && <div className="join-error">{joinError}</div>}
              </div>
            )}

            {role === 'teacher' && (
              <>
                <button onClick={() => setShowCreateClassPopup(true)} className="create-class-button">Create Class</button>
                {showCreateClassPopup && (
                  <div className="create-class-popup">
                    <h3>Create a New Class</h3>
                    <label>
                      Class Name:
                      <input
                        type="text"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="create-class-input"
                        placeholder="Enter Class Name"
                      />
                    </label>
                    <label>
                      Description:
                      <input
                        type="text"
                        value={classDescription}
                        onChange={(e) => setClassDescription(e.target.value)}
                        className="create-class-input"
                        placeholder="Enter Class Description"
                      />
                    </label>
                    <label>
                      Class Code:
                      <input
                        type="text"
                        value={classCodeInput}
                        onChange={(e) => setClassCodeInput(e.target.value)}
                        className="create-class-input"
                        placeholder="Enter Class Code"
                      />
                    </label>
                    <button onClick={handleCreateClass} className="submit-class-button">Submit</button>
                    <button onClick={() => setShowCreateClassPopup(false)} className="cancel-button">Cancel</button>
                  </div>
                )}
              </>
            )}

            <div className="tabs">
              <button onClick={() => setActiveTab('Students')} className={`tab-button ${activeTab === 'Students' ? 'active' : ''}`}>Students</button>
              <button onClick={handleGuildsClick} className={`tab-button ${activeTab === 'Guilds' ? 'active' : ''}`}>Guilds</button>
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
                  placeholder="Search students"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="students-list">
                {filteredStudents.length > 0 ? filteredStudents.map((student, index) => (
                  <div key={index} className="student-card">
                    <div className="student-email">{student}</div>
                  </div>
                )) : <div>No students found</div>}
              </div>

              <div className="pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                <span>{currentPage}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={filteredStudents.length < studentsPerPage}>Next</button>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
