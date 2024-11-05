// PendingApprovals.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PendingApprovals.css';

const PendingApprovals = ({ groupId }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
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

  return (
    <div className="pending-approvals">
      <h3>Pending Join Requests</h3>
      {error && <div className="error-message">{error}</div>}
      <ul>
        {pendingRequests.length > 0 ? (
          pendingRequests.map((request) => (
            <li key={request.id}>
              <span>{request.username}</span>
              <button onClick={() => handleApproval(request.id, 'approve')}>Approve</button>
              <button onClick={() => handleApproval(request.id, 'decline')}>Decline</button>
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
