import React, { useState } from 'react';
import axios from 'axios';

function UserManagement({ users, setUsers }) {
  const [newUser, setNewUser] = useState({ username: '', password: '', isAdmin: false });

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/users', newUser);
      setUsers([...users, response.data]);
      setNewUser({ username: '', password: '', isAdmin: false });
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/users/${id}`);
      setUsers(users.filter(user => user._id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="user-management">
      <h3>User Management</h3>
      <form onSubmit={handleAddUser}>
        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({...newUser, username: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
          required
        />
        <label>
          <input
            type="checkbox"
            checked={newUser.isAdmin}
            onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
          />
          Is Admin
        </label>
        <button type="submit">Add User</button>
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