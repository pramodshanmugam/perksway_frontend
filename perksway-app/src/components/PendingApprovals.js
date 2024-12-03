import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PendingApprovals.css';

const PendingApprovals = ({ groupId }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetchPendingRequests(token);
  }, []);

  const fetchPendingRequests = (token) => {
    axios.get(`http://localhost:8000/api/v1/classes/group/${groupId}/approve-request/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setPendingRequests(response.data.pending_approvals);
        // Reset selection when new data is fetched
        setSelectedUserIds([]);
      })
      .catch(error => {
        console.error('Error fetching pending requests:', error);
        setError('Failed to load pending requests.');
      });
  };

  const handleApproval = (userId, action) => {
    const token = localStorage.getItem('access_token');
    axios.post(`http://localhost:8000/api/v1/classes/group/${groupId}/approve-request/`, {
      user_id: userId,
      action: action // 'approve' or 'decline'
    }, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setPendingRequests(pendingRequests.filter(request => request.id !== userId));
        alert(`Request ${action === 'approve' ? 'approved' : 'declined'} successfully.`);
      })
      .catch(error => {
        console.error(`Error ${action}ing request:`, error);
        alert(`Failed to ${action} request.`);
      });
  };

  const handleBulkApproval = (action) => {
    const token = localStorage.getItem('access_token');
    axios.post(`http://localhost:8000/api/v1/classes/group/${groupId}/bulk-approve/`, {
      user_ids: selectedUserIds,
      action: action // 'approve' or 'decline'
    }, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      setPendingRequests(pendingRequests.filter(request => !selectedUserIds.includes(request.id)));
      setSelectedUserIds([]);
      alert(`Requests ${action === 'approve' ? 'approved' : 'declined'} successfully.`);
    })
    .catch(error => {
      console.error(`Error ${action}ing requests:`, error);
      alert(`Failed to ${action} requests.`);
    });
  };

  const handleCheckboxChange = (userId) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const selectAllRequests = () => {
    if (selectedUserIds.length === pendingRequests.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(pendingRequests.map(request => request.id));
    }
  };

  return (
    <div className="pending-approvals">
      <h3>Pending Join Requests</h3>
      {error && <div className="error-message">{error}</div>}
      <button onClick={selectAllRequests}>{selectedUserIds.length === pendingRequests.length ? 'Deselect All' : 'Select All'}</button>
      <button onClick={() => handleBulkApproval('approve')} disabled={selectedUserIds.length === 0}>Approve All</button>
      <button onClick={() => handleBulkApproval('decline')} disabled={selectedUserIds.length === 0}>Decline All</button>
      <ul>
        {pendingRequests.length > 0 ? (
          pendingRequests.map((request) => (
            <li key={request.id}>
              <input
                type="checkbox"
                checked={selectedUserIds.includes(request.id)}
                onChange={() => handleCheckboxChange(request.id)}
              />
              <span>{request.username}</span>
              <button 
  className={selectedUserIds.length === pendingRequests.length ? "deselect-all-button" : "select-all-button"}
  onClick={selectAllRequests}
>
  {selectedUserIds.length === pendingRequests.length ? 'Deselect All' : 'Select All'}
</button>
            </li>
          ))
        ) : (
          <p>No pending requests.</p>
        )}
      </ul>
    </div>
  );
};

export default PendingApprovals;


