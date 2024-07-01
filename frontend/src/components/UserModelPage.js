import React, { useState } from 'react';
import axios from 'axios';

function UserManagement({ users, setUsers }) {
  const [newUser, setNewUser] = useState({ username: '', password: '', isAdmin: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('http://localhost:3000/api/users', newUser);
      setUsers([...users, response.data]);
      setNewUser({ username: '', password: '', isAdmin: false });
      setSuccess('User added successfully');
    } catch (error) {
      console.error('Error adding user:', error);
      setError(error.response?.data?.message || 'Error adding user');
    }
  };

  const handleDeleteUser = async (id) => {
    setError('');
    setSuccess('');
    try {
      await axios.delete(`http://localhost:3000/api/users/${id}`);
      setUsers(users.filter(user => user._id !== id));
      setSuccess('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.message || 'Error deleting user');
    }
  };

  return (
    <div className="user-management">
      <h3>User Management</h3>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleAddUser}>
        {/* ... form inputs remain the same ... */}
      </form>
      <ul className="user-list">
        {users.map(user => (
          <li key={user._id} className="user-item">
            {user.username} - {user.isAdmin ? 'Admin' : 'User'}
            <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserManagement;