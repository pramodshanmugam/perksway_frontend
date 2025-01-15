import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import Navbar from './Navbar';
import Footer from './Footer';

const Dashboard = () => {
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [classCodeInput, setClassCodeInput] = useState('');
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
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedStudentEmail, setSelectedStudentEmail] = useState('');
  const [walletAmount, setWalletAmount] = useState('');
  const [showOrdersModal, setShowOrdersModal] = useState(false); // New state for orders modal
  const [purchaseRequests, setPurchaseRequests] = useState([]); // New state for purchase requests


  const studentsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setLoading(true);
    axios.get('http://167.88.45.167:8000/api/v1/users/user/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setRole(response.data.role);
        fetchClasses(token);
      })
      .catch(error => {
        console.error('Error fetching user details:', error);
        setError('Failed to load user details.');
        setLoading(false);
      });
  }, []);

  const fetchClasses = (token) => {
    axios.get('http://167.88.45.167:8000/api/v1/classes/', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => {
      const fetchedClasses = response.data;
      setClasses(fetchedClasses);

      let selected = fetchedClasses.find(cls => cls.id.toString() === localStorage.getItem('class_id')) || fetchedClasses[0];
  
      if (selected) {
        setSelectedClass(selected);
        setStudents(selected.students);
        localStorage.setItem('class_id', selected.id.toString());
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
    const class_id = localStorage.getItem('class_id');
  
    if (!class_id) {
      alert('Class ID is not available.');
      return;
    }
  
    axios.delete(`http://167.88.45.167:8000/api/v1/classes/${class_id}/leave/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      alert('Successfully left the class');
      setSelectedClass(null);
      setStudents([]);
    })
    .catch(error => {
      console.error('Error leaving class:', error);
      setError('Failed to leave class.');
    });
  };
  

  const handleJoinClass = () => {
    const token = localStorage.getItem('access_token');
    setJoinError(null);
    axios.post(`http://167.88.45.167:8000/api/v1/classes/join/${classCode}/`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => {
      const newClass = response.data;
      setClasses(prevClasses => [...prevClasses, newClass]);
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

    axios.post('http://167.88.45.167:8000/api/v1/classes/create/', classData, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => {
      const createdClass = response.data;
      setClasses(prevClasses => [...prevClasses, createdClass]);
      setSelectedClass(createdClass);
      setShowCreateClassPopup(false);
      setClassName('');
      setClassDescription('');
      setClassCodeInput('');
      alert('Class created successfully');
    })
    .catch(error => {
      console.error('Error creating class:', error);
      alert('Failed to create class.');
    });
  };

  const updateWalletBalance = () => {
    const token = localStorage.getItem('access_token');
    if (selectedClass && selectedClass.id && selectedStudentEmail && walletAmount) {
      axios.put(`http://167.88.45.167:8000/api/v1/classes/wallets/${selectedClass.id}/`, {
        email: selectedStudentEmail,
        amount: walletAmount
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        alert('Wallet balance updated successfully');
        setShowWalletModal(false);
        setWalletAmount('');
      })
      .catch(error => {
        console.error('Error updating wallet balance:', error);
        alert('Failed to update wallet balance.');
      });
    } else {
      alert('Invalid data for update');
    }
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
  const handleViewOrders = () => {
    const token = localStorage.getItem('access_token');
    const classId = selectedClass.id;

    axios
      .get(`http://167.88.45.167:8000/api/v1/classes/${classId}/purchase/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setPurchaseRequests(response.data);
        setShowOrdersModal(true);
      })
      .catch((error) => {
        console.error('Error fetching purchase requests:', error);
        alert('Failed to fetch purchase requests.');
      });
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
                        <strong>Admin:</strong> {selectedClass.teacher}
                      </span>
                      <span className="students-count"><strong>Students:</strong> {selectedClass.students.length}</span>
                    </div>
                    {role === 'teacher' && (
                <button className="view-orders-button" onClick={handleViewOrders}>
                  View Orders
                </button>
              )}
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
            {showOrdersModal && (
          <div className="orders-modal">
            <div className="modal-content">
              <h3>Purchase Requests</h3>
              {purchaseRequests.length > 0 ? (
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Student Username</th>
                      <th>Item Name</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.student}</td>
                        <td>{request.item}</td>
                        <td>฿{request.amount}</td>
                        <td>{request.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No purchase requests found.</p>
              )}
              <button
                className="close-orders-modal"
                onClick={() => setShowOrdersModal(false)}
              >
                Close
              </button>
            </div>
          </div>
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
                  <div key={index} className="student-card" onClick={() => {
                    setSelectedStudentEmail(student);
                    setShowWalletModal(true);
                  }}>
                    <div className="student-email">{student}</div>
                  </div>
                )) : <div>No students found</div>}
              </div>

              {showWalletModal && (
                <div className="modal-wallet">
                  <div className="modal-content-wallet">
                    <span className="close" onClick={() => setShowWalletModal(false)}>&times;</span>
                    <h2>Update Wallet Balance for {selectedStudentEmail}</h2>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={walletAmount}
                      onChange={(e) => setWalletAmount(e.target.value)}
                    />
                    <button onClick={updateWalletBalance}>Update Balance</button>
                  </div>
                </div>
              )}
              

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
