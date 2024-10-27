import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './Guilds.css';
import Navbar from './Navbar';
import Footer from './Footer';

const Guilds = () => {
  const [groups, setGroups] = useState([]);
  const [role, setRole] = useState(null); // User role: student or teacher
  const [showCreateGroupPopup, setShowCreateGroupPopup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook to navigate to other pages
  const { classId } = useParams(); // Retrieve classId from URL

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetchUserRole(token);
  }, []);

  const fetchUserRole = (token) => {
    axios.get('http://localhost:8000/api/v1/users/user/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        const user = response.data;
        setRole(user.role);
        fetchGroups(token, classId); // Fetch groups for the selected class
      })
      .catch(error => {
        console.error('Error fetching user details:', error);
        setError('Failed to load user details.');
      });
  };

  const fetchGroups = (token, classId) => {
    axios.get(`http://localhost:8000/api/v1/classes/group/all-groups/${classId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setGroups(response.data);
      })
      .catch(error => {
        console.error('Error fetching groups:', error);
        setError('Failed to load groups.');
      });
  };
  
  const handleJoinGroup = (groupId) => {
    const token = localStorage.getItem('access_token');
    axios.post(`http://localhost:8000/api/v1/classes/group/join/${groupId}/`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        alert('Successfully joined the group');
        fetchGroups(token, classId); // Refresh the group list
      })
      .catch(error => {
        console.error('Error joining group:', error);
        setError('Failed to join group.');
      });
  };

  const handleCreateGroup = () => {
    const token = localStorage.getItem('access_token');
    const groupData = {
      name: groupName,
      description: groupDescription,
      class_ref: classId, // Use the actual class ID from URL params
    };

    axios.post('http://localhost:8000/api/v1/classes/group/create-group/', groupData, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        const createdGroup = response.data;
        setGroups([...groups, createdGroup]);
        setShowCreateGroupPopup(false);
        alert('Group created successfully');
        setGroupName('');
        setGroupDescription('');
      })
      .catch(error => {
        console.error('Error creating group:', error);
        alert('Failed to create group.');
      });
  };

  const handleGroupClick = (groupId) => {
    // Navigate to the GroupDetails page for the clicked group
    navigate(`/groups/${groupId}`);
  };

  return (
    <div className="guilds-page">
      <Navbar />
      <div className="main-content guilds-container">
        {error && <div className="error-message">{error}</div>}
        <h3>Groups (Guilds)</h3>
        
        {role === 'teacher' && (
          <button onClick={() => setShowCreateGroupPopup(true)} className="create-group-button">Create Group</button>
        )}
        
        {groups.length > 0 ? (
          <div className="groups-list">
            {groups.map((group) => (
              <div key={group.id} className="group-card" onClick={() => handleGroupClick(group.id)}>
                <h4>{group.name}</h4>
                <p>{group.description}</p>
                {role === 'student' && (
                  <button onClick={(e) => {
                    e.stopPropagation();
                    handleJoinGroup(group.id);
                  }} className="join-group-button">Join Group</button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>No groups found</div>
        )}
  
        {showCreateGroupPopup && (
          <div className="create-group-popup">
            <h3>Create a New Group</h3>
            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Group Description"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
            />
            <button onClick={handleCreateGroup} className="submit-group-button">Create Group</button>
            <button onClick={() => setShowCreateGroupPopup(false)} className="cancel-button">Cancel</button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Guilds;
