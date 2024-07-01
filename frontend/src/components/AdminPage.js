import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPage.css';

function AdminPage({ setModels }) {
  const [newModel, setNewModel] = useState({ name: '', file: null, forFrontPage: false });
  const [existingModels, setExistingModels] = useState([]);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', isAdmin: false });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchModels();
    fetchUsers();
  }, []);

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:3000/api/models');
      setExistingModels(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching models:', error);
      setError(`Failed to fetch models. ${error.response?.data?.message || error.message}`);
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(`Failed to fetch users. ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newModel.name);
    formData.append('file', newModel.file);
    formData.append('forFrontPage', newModel.forFrontPage);

    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:3000/api/models', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setExistingModels(prevModels => [...prevModels, response.data]);
      setModels(prevModels => [...prevModels, response.data]);
      setNewModel({ name: '', file: null, forFrontPage: false });
      setIsLoading(false);
    } catch (error) {
      console.error('Error adding model:', error);
      setError(`Failed to add model. ${error.response?.data?.message || error.message}`);
      setIsLoading(false);
    }
  };

  const handleDeleteModel = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:3000/api/models/${id}`);
      setExistingModels(prevModels => prevModels.filter(model => model._id !== id));
      setModels(prevModels => prevModels.filter(model => model._id !== id));
      setIsLoading(false);
    } catch (error) {
      console.error('Error deleting model:', error);
      setError(`Failed to delete model. ${error.response?.data?.message || error.message}`);
      setIsLoading(false);
    }
  };

  const handleToggleFrontPage = async (id, currentStatus) => {
    try {
      setIsLoading(true);
      const response = await axios.patch(`http://localhost:3000/api/models/${id}`, {
        forFrontPage: !currentStatus
      });
      setExistingModels(prevModels => 
        prevModels.map(model => 
          model._id === id ? { ...model, forFrontPage: response.data.forFrontPage } : model
        )
      );
      setModels(prevModels => 
        prevModels.map(model => 
          model._id === id ? { ...model, forFrontPage: response.data.forFrontPage } : model
        )
      );
      setIsLoading(false);
    } catch (error) {
      console.error('Error updating model:', error);
      setError(`Failed to update model. ${error.response?.data?.message || error.message}`);
      setIsLoading(false);
    }
  };

  const handleAssociateUser = async (modelId, userId) => {
    try {
      const response = await axios.post(`http://localhost:3000/api/models/${modelId}/users/${userId}`);
      setExistingModels(prevModels =>
        prevModels.map(model =>
          model._id === modelId ? { ...model, associatedUsers: response.data.associatedUsers } : model
        )
      );
    } catch (error) {
      console.error('Error associating user with model:', error);
      setError(`Failed to associate user with model. ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddUser = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post('http://localhost:3000/api/users', newUser);
    setUsers([...users, response.data]);
    setNewUser({ username: '', password: '', isAdmin: false });
  } catch (error) {
    console.error('Error adding user:', error);
    setError(`Failed to add user. ${error.response?.data?.message || error.message}`);
  }
};

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/users/${id}`);
      setUsers(users.filter(user => user._id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(`Failed to delete user. ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="admin-page">
      <h2>Admin Dashboard</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="admin-section">
        <h3>Add New Model</h3>
        <form onSubmit={handleAddModel} className="add-model-form">
          <input
            type="text"
            placeholder="Model Name"
            value={newModel.name}
            onChange={(e) => setNewModel({...newModel, name: e.target.value})}
            required
          />
          <input
            type="file"
            accept=".obj"
            onChange={(e) => setNewModel({...newModel, file: e.target.files[0]})}
            required
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={newModel.forFrontPage}
              onChange={(e) => setNewModel({...newModel, forFrontPage: e.target.checked})}
            />
            Show on Front Page
          </label>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Model'}
          </button>
        </form>
      </div>

      <div className="admin-section">
        <h3>Existing Models</h3>
        {isLoading ? (
          <p>Loading models...</p>
        ) : (
          <ul className="model-list">
            {existingModels.map(model => (
              <li key={model._id} className="model-item">
                <div className="model-preview">
                  <img 
                    src={`http://localhost:3000/api/models/${model._id}/thumbnail`} 
                    alt={model.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'path/to/fallback/image.png';
                    }}
                  />                </div>
                <div className="model-info">
                  <h4>{model.name}</h4>
                  <p>Uploaded: {new Date(model.uploadDate).toLocaleString()}</p>
                  <p>Last Modified: {new Date(model.lastModified).toLocaleString()}</p>
                  <p>File Size: {model.fileSize} bytes</p>
                  <div className="associated-users">
                    <h5>Associated Users:</h5>
                    <select 
                      value="" 
                      onChange={(e) => {
                        if (e.target.value) handleAssociateUser(model._id, e.target.value);
                      }}
                    >
                      <option value="">Select a user</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>{user.username}</option>
                      ))}
                    </select>
                    <ul>
                      {model.associatedUsers && model.associatedUsers.length > 0 ? (
                        model.associatedUsers.map(userId => {
                          const user = users.find(u => u._id === userId);
                          return user ? <li key={userId}>{user.username}</li> : null;
                        })
                      ) : (
                        <li>No associated users</li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="model-actions">
                  <button 
                    onClick={() => handleToggleFrontPage(model._id, model.forFrontPage)}
                    className={model.forFrontPage ? 'active' : ''}
                  >
                    {model.forFrontPage ? 'Remove from Front Page' : 'Add to Front Page'}
                  </button>
                  <button onClick={() => handleDeleteModel(model._id)} className="delete-button">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="admin-section">
        <h3>User Management</h3>
        <form onSubmit={handleAddUser} className="add-user-form">
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
          <label className="checkbox-label">
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
    </div>
  );
}

export default AdminPage;