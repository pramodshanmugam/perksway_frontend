import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './Guilds.css';
import Navbar from './Navbar';
import Footer from './Footer';
import PendingApprovals from './PendingApprovals';

const Guilds = () => {
  const [groups, setGroups] = useState([]);
  const [role, setRole] = useState(null);
  const [showCreateGroupPopup, setShowCreateGroupPopup] = useState(false);
  const [groupNamePrefix, setGroupNamePrefix] = useState('');
  const [numberOfGroups, setNumberOfGroups] = useState(1);
  const [maxStudents, setMaxStudents] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [error, setError] = useState(null);
  const [showPendingApprovals, setShowPendingApprovals] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [selectedGroupName, setSelectedGroupName] = useState('');
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  // Edit Group States
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editMaxStudents, setEditMaxStudents] = useState('');
  const [editRequiresApproval, setEditRequiresApproval] = useState(false);

  const navigate = useNavigate();
  const { classId } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetchUserRole(token);
  }, []);

  const fetchUserRole = (token) => {
    axios.get('http://167.88.45.167:8000/api/v1/users/user/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        const user = response.data;
        setRole(user.role);
        fetchGroups(token, classId);
      })
      .catch(error => {
        console.error('Error fetching user details:', error);
        setError('Failed to load user details.');
      });
  };

  const fetchGroups = (token, classId) => {
    axios.get(`http://167.88.45.167:8000/api/v1/classes/group/all-groups/${classId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        const groupsWithPendingCounts = response.data.map(group => {
          return axios.get(`http://167.88.45.167:8000/api/v1/classes/group/${group.id}/approve-request/?count=true`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(countResponse => ({
            ...group,
            pendingApprovalsCount: countResponse.data.count
          }))
          .catch(error => {
            console.error('Error fetching pending approvals count:', error);
            return { ...group, pendingApprovalsCount: 0 }; // Default to 0 in case of error
          });
        });

        Promise.all(groupsWithPendingCounts).then(groups => setGroups(groups));
      })
      .catch(error => {
        console.error('Error fetching groups:', error);
        setError('Failed to load groups.');
      });
  };

  const handleJoinGroup = (groupId) => {
    const token = localStorage.getItem('access_token');
    axios.post(`http://167.88.45.167:8000/api/v1/classes/group/join/${groupId}/`, {}, {
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

  const handleBulkCreateGroups = () => {
    const token = localStorage.getItem('access_token');
    const bulkData = {
      number_of_groups: numberOfGroups,
      group_name_prefix: groupNamePrefix,
      max_students: maxStudents,
      requires_approval: requiresApproval
    };

    axios.post(`http://167.88.45.167:8000/api/v1/classes/${classId}/bulk-create-groups/`, bulkData, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        alert(`${numberOfGroups} groups created successfully.`);
        setShowCreateGroupPopup(false);
        fetchGroups(token, classId); // Refresh the group list
        setGroupNamePrefix('');
        setNumberOfGroups(1);
        setMaxStudents('');
        setRequiresApproval(false);
      })
      .catch(error => {
        console.error('Error creating groups:', error);
        alert('Failed to create groups.');
      });
  };

  const handleShowPendingApprovals = (groupId) => {
    const token = localStorage.getItem('access_token');
    axios.get(`http://167.88.45.167:8000/api/v1/classes/group/${groupId}/approve-request/?count=true`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setPendingApprovalsCount(response.data.count);
        setSelectedGroupId(groupId);
        setShowPendingApprovals(true);
      })
      .catch(error => {
        console.error('Error fetching pending approvals', error);
      });
  };

  const fetchGroupMembers = (groupId, groupName) => {
    const token = localStorage.getItem('access_token');
    axios.get(`http://167.88.45.167:8000/api/v1/classes/group/details/${groupId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setSelectedGroupMembers(response.data.students);
        setSelectedGroupName(groupName);
        setShowGroupMembers(true);
      })
      .catch(error => {
        console.error('Error fetching group members:', error);
        setError('Failed to load group members.');
      });
  };

  const handleShowEditPopup = (group) => {
    setEditGroupName(group.name);
    setEditMaxStudents(group.max_students);
    setEditRequiresApproval(group.requires_approval);
    setSelectedGroupId(group.id); // Reuse selectedGroupId for editing
    setShowEditPopup(true);
  };

  const handleEditGroupSubmit = () => {
    const token = localStorage.getItem('access_token');
    const updatedData = {
      name: editGroupName,
      max_students: editMaxStudents,
      requires_approval: editRequiresApproval,
    };

    axios.put(`http://167.88.45.167:8000/api/v1/classes/group/${selectedGroupId}/`, updatedData, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        alert('Group updated successfully');
        setShowEditPopup(false);
        fetchGroups(token, classId); // Refresh the groups list
      })
      .catch(error => {
        console.error('Error updating group:', error);
        setError('Failed to update group.');
      });
  };
  const handleDeleteGroup = (groupId) => {
    const token = localStorage.getItem('access_token');
    if (window.confirm('Are you sure you want to delete this group?')) {
      axios
        .delete(`http://167.88.45.167:8000/api/v1/classes/group/${groupId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          alert('Group deleted successfully');
          fetchGroups(token, classId); // Refresh the groups list
        })
        .catch((error) => {
          console.error('Error deleting group:', error);
          alert('Failed to delete the group.');
        });
    }
  };
  

  return (
    <div className="guilds-page">
      <Navbar />
      <div className="main-content guilds-container">
        {error && <div className="error-message">{error}</div>}
        <h3>Groups (Guilds)</h3>
        {role === 'teacher' && (
          <button onClick={() => setShowCreateGroupPopup(true)} className="create-group-button">Bulk Create Groups</button>
        )}

        {groups.length > 0 ? (
          <div className="groups-list">
            {groups.map((group) => (
              <div key={group.id} className="group-card">
                <h4 onClick={() => fetchGroupMembers(group.id, group.name)} className="group-name clickable">
                  {group.name}
                </h4>
                <p>{group.description}</p>
                {role === 'student' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinGroup(group.id);
                    }}
                    className="join-group-button"
                  >
                    Join Group
                  </button>
                )}
                {role === 'teacher' && (
                  <>
                    <div className="approvals-button" onClick={() => handleShowPendingApprovals(group.id)}>
                      Approvals
                      {group.pendingApprovalsCount > 0 && (
                        <div className="badge">
                          {group.pendingApprovalsCount}
                        </div>
                      )}
                    </div>
                    <div
                      className="edit-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowEditPopup(group);
                      }}
                    >
                      ✏️
                    </div>
                    <div
    className="delete-icon"
    onClick={(e) => {
      e.stopPropagation();
      handleDeleteGroup(group.id);
    }}
  >
    🗑️
  </div>
                  </>
                  
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>No groups found</div>
        )}

        {showCreateGroupPopup && (
          <div className="create-group-popup">
            <h3>Bulk Create Groups</h3>
            <input
              type="text"
              placeholder="Group Name Prefix"
              value={groupNamePrefix}
              onChange={(e) => setGroupNamePrefix(e.target.value)}
            />
            <input
              type="number"
              placeholder="Number of Groups"
              value={numberOfGroups}
              onChange={(e) => setNumberOfGroups(e.target.value)}
              min="1"
            />
            <input
              type="number"
              placeholder="Max Students per Group"
              value={maxStudents}
              onChange={(e) => setMaxStudents(e.target.value)}
              min="1"
            />
            <label>
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
              />
              Requires Approval
            </label>
            <div>
              <button onClick={handleBulkCreateGroups} className="submit-group-button">Create Groups</button>
              <button onClick={() => setShowCreateGroupPopup(false)} className="cancel-button">Cancel</button>
            </div>
          </div>
        )}

        {showEditPopup && (
          <div className="edit-popup">
            <div className="edit-popup-content">
              <h3>Edit Group</h3>
              <label>
                Group Name:
                <input
                  type="text"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                />
              </label>
              <label>
                Max Students:
                <input
                  type="number"
                  value={editMaxStudents}
                  onChange={(e) => setEditMaxStudents(e.target.value)}
                />
              </label>
              <label>
                Requires Approval:
                <input
                  type="checkbox"
                  checked={editRequiresApproval}
                  onChange={(e) => setEditRequiresApproval(e.target.checked)}
                />
              </label>
              <div className="edit-popup-actions">
                <button onClick={handleEditGroupSubmit} className="save-button">Save</button>
                <button onClick={() => setShowEditPopup(false)} className="cancel-button">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showPendingApprovals && selectedGroupId && (
          <PendingApprovals groupId={selectedGroupId} />
        )}

        {showGroupMembers && (
          <div className="group-members">
            <h3>Members of {selectedGroupName}</h3>
            <ul>
              {selectedGroupMembers.length > 0 ? (
                selectedGroupMembers.map((member) => (
                  <li key={member.id}>
                    {member.first_name} {member.last_name} ({member.email})
                  </li>
                ))
              ) : (
                <p>No members found in this group.</p>
              )}
            </ul>
            <button onClick={() => setShowGroupMembers(false)}>Close</button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Guilds;
