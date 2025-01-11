import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import './ItemList.css';

const ItemList = () => {
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');
    const [role, setRole] = useState(null);
    const [newItem, setNewItem] = useState({ name: '', description: '', price: '' });
    const [showModal, setShowModal] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedPurchaseRequest, setSelectedPurchaseRequest] = useState(null);
    const [showPendingRequests, setShowPendingRequests] = useState(false);
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchUserRole(token);
        }
    }, []);

    const fetchUserRole = (token) => {
        axios.get('http://localhost:8000/api/v1/users/user/', {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
            const user = response.data;
            setRole(user.role);
            fetchItems(token);
        })
        .catch(error => {
            console.error('Error fetching user details:', error);
            setError('Failed to load user details.');
        });
    };

    const fetchItems = (token) => {
        const classId = localStorage.getItem('class_id');

        if (!classId) {
            setError('Class ID is not available.');
            return;
        }

        axios.get(`http://localhost:8000/api/v1/classes/${classId}/items/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setItems(response.data);
        })
        .catch(error => {
            console.error('Error fetching items:', error);
            setError('Failed to load items.');
        });

        if (role === 'teacher') {
            axios.get(`http://localhost:8000/api/v1/classes/${classId}/purchase-approval/`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                setPendingRequests(response.data);
            })
            .catch(error => {
                console.error('Error fetching purchase requests:', error);
            });
        }
    };

    const handlePurchase = (itemId, price) => {
        const walletBalance = parseFloat(localStorage.getItem('wallet_balance') || 0);
        if (walletBalance >= price) {
            const classId = localStorage.getItem('class_id');
            axios.post(`http://localhost:8000/api/v1/classes/${classId}/purchase-item/${itemId}/`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
            })
            .then(response => {
                alert('Purchase request is pending approval');
            })
            .catch(error => {
                alert('Failed to create purchase request');
            });
        } else {
            alert('Insufficient balance');
        }
    };

    const handleCreateItem = () => {
        const token = localStorage.getItem('access_token');
        const classId = localStorage.getItem('class_id');

        if (!classId) {
            alert('Class ID is not available.');
            return;
        }

        if (newItem.name && newItem.description && newItem.price) {
            axios.post(`http://localhost:8000/api/v1/classes/${classId}/items/`, newItem, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                alert('Item created successfully');
                setItems([...items, response.data]);
                setShowModal(false);
                setNewItem({ name: '', description: '', price: '' });
            })
            .catch(error => {
                alert('Failed to create item');
                console.error(error);
            });
        } else {
            alert('Please fill in all fields');
        }
    };

    const handleApprovePurchase = (requestId, action) => {
        const token = localStorage.getItem('access_token');
        axios.post(`http://localhost:8000/api/v1/classes/purchase-request/${requestId}/action/`, { action }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            alert('Purchase request processed successfully');
            setShowApprovalModal(false);
            fetchItems(token);
        })
        .catch(error => {
            alert('Failed to process purchase request');
            console.error(error);
        });
    };

    const handleApproveAll = () => {
        selectedRequests.forEach(requestId => {
            handleApprovePurchase(requestId, 'approve');
        });
    };

    const togglePendingRequests = () => {
        const token = localStorage.getItem('access_token');
        const classId = localStorage.getItem('class_id');

        axios.get(`http://localhost:8000/api/v1/classes/${classId}/purchase-approval/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setPendingRequests(response.data);
            setShowPendingRequests(!showPendingRequests);
        })
        .catch(error => {
            console.error('Error fetching purchase requests:', error);
        });
    };

    const handleRequestSelect = (requestId) => {
        const isSelected = selectedRequests.includes(requestId);
        if (isSelected) {
            setSelectedRequests(selectedRequests.filter(id => id !== requestId));
        } else {
            setSelectedRequests([...selectedRequests, requestId]);
        }
    };

    const toggleSelectAll = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            setSelectedRequests(pendingRequests.map(req => req.id)); // Select all requests
        } else {
            setSelectedRequests([]); // Deselect all requests
        }
    };

    return (
        <div className="item-list">
            <Navbar />
            
            <div className="content">
                <h2>Byte Bazaar</h2>
                {error && <p>{error}</p>}

                {role === 'teacher' && (
                    <button className="create-item-button" onClick={() => setShowModal(true)}>
                        Create Item
                    </button>
                )}

                {role === 'teacher' && (
                    <button className="show-pending-button" onClick={togglePendingRequests}>
                        Show Pending Purchase Requests
                    </button>
                )}

                {/* Modal for Pending Purchase Requests */}
                {role === 'teacher' && showPendingRequests && pendingRequests.length > 0 && (
                    <div className="modal show">
                        <div className="modal-content">
                            <h3>Pending Purchase Requests</h3>
                            <button className="select-all-button" onClick={toggleSelectAll}>
                                {selectAll ? 'Deselect All' : 'Select All'}
                            </button>
                            {pendingRequests.map(request => (
                                <div key={request.id} className="request-card">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedRequests.includes(request.id)} 
                                        onChange={() => handleRequestSelect(request.id)} 
                                    />
                                    <p>Student: {request.student.username}</p>
                                    <p>Item: {request.item.name}</p>
                                    <p>Amount: ฿{request.amount}</p>
                                    <button onClick={() => { setSelectedPurchaseRequest(request); setShowApprovalModal(true); }}>
                                        Approve/Decline
                                    </button>
                                </div>
                            ))}
                            <button className="approve-all-btn" onClick={handleApproveAll}>
                                Approve All
                            </button>
                            <button onClick={() => setShowPendingRequests(false)}>Close</button>
                        </div>
                    </div>
                )}

                <div className="items">
                    {items.map(item => (
                        <div key={item.id} className="item-card">
                            <img src={item.image || '/images/PerksClass.png'} alt={item.name} className="item-image" />
                            <h3>{item.name}</h3>
                            <p>{item.description}</p>
                            <p className="price">Price: ฿{item.price}</p>
                            <button onClick={() => handlePurchase(item.id, item.price)}>
                                Buy Now
                            </button>
                        </div>
                    ))}
                </div>

                {showModal && (
                    <div className="modal show">
                        <div className="modal-content">
                            <h3>Create a New Item</h3>
                            <label>Name:</label>
                            <input 
                                type="text" 
                                value={newItem.name} 
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            />
                            <label>Description:</label>
                            <input 
                                type="text" 
                                value={newItem.description} 
                                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            />
                            <label>Price:</label>
                            <input 
                                type="number" 
                                value={newItem.price} 
                                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                            />
                            <button onClick={handleCreateItem}>Create Item</button>
                            <button onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                {showApprovalModal && selectedPurchaseRequest && (
                    <div className="modal show">
                        <div className="modal-content">
                            <h3>Approve or Decline Purchase</h3>
                            <p>Student: {selectedPurchaseRequest.student.username}</p>
                            <p>Item: {selectedPurchaseRequest.item.name}</p>
                            <p>Amount: ฿{selectedPurchaseRequest.amount}</p>
                            <button onClick={() => handleApprovePurchase(selectedPurchaseRequest.id, 'approve')}>Approve</button>
                            <button onClick={() => handleApprovePurchase(selectedPurchaseRequest.id, 'decline')}>Decline</button>
                            <button onClick={() => setShowApprovalModal(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default ItemList;
