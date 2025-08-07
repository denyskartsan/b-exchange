import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, message } from 'antd';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import BookList from './components/BookList';
import AddBook from './components/AddBook';
import Exchanges from './components/Exchanges';
import Header from './components/Header';
import { getToken, setToken, removeToken, decodeToken } from './utils/auth';

const { Content } = Layout;

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded = decodeToken(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
        } else {
          removeToken();
        }
      } catch (error) {
        removeToken();
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    message.success('Login successful!');
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
    message.success('Logged out successfully!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Layout className="min-h-screen bg-gray-50">
        {user && <Header user={user} onLogout={handleLogout} />}
        <Content className={user ? 'mt-16' : ''}>
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={user ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/books" 
              element={user ? <BookList /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/exchanges" 
              element={user ? <Exchanges /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/add-book" 
              element={user ? <AddBook /> : <Navigate to="/login" />} 
            />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
};

export default App;
