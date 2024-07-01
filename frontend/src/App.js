import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Home from './components/Home';
import Login from './components/Login';
import AdminPage from './components/AdminPage';
import UserPage from './components/UserPage';
import UserModelPage from './components/UserModelPage';
import './App.css';

function App() {
  const [models, setModels] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const decodedToken = jwtDecode(token);
      setIsAdmin(decodedToken.isAdmin);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    setIsLoading(true);
    axios.get('http://localhost:3000/api/models')  // Ensure this matches your backend address
      .then(response => {
        setModels(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching models:', error);
        setIsLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsAdmin(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <ul>
            <li><Link to="/">Home</Link></li>
            {!isAuthenticated && <li><Link to="/login">Login</Link></li>}
            {isAdmin && <li><Link to="/admin">Admin</Link></li>}
            {isAuthenticated && <li><Link to="/user">User Page</Link></li>}
            {isAuthenticated && <li><button onClick={handleLogout}>Logout</button></li>}
          </ul>
        </nav>

        <main className="main-content">
          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : (
            <Routes>
              <Route path="/" element={<Home models={models} />} />
              <Route 
                path="/login" 
                element={
                  <Login 
                    setIsAuthenticated={setIsAuthenticated} 
                    setIsAdmin={setIsAdmin} 
                  />
                } 
              />
              <Route 
                path="/admin" 
                element={isAdmin ? <AdminPage setModels={setModels} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/user" 
                element={isAuthenticated ? <UserPage models={models} /> : <Navigate to="/login" />} 
              />
              <Route path="/model/:id" element={<UserModelPage />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
