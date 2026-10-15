import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/profile');
      setUser(res.data);
      setError(null);
    } catch (err) {
      console.error('Fetch profile error:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    try {
      setError(null);
      const res = await API.post('/auth/login', { email, password, role });
      const { token: userToken, ...userData } = res.data;
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials and selected role.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (formData) => {
    try {
      setError(null);
      const res = await API.post('/auth/register', formData);
      const { token: userToken, ...userData } = res.data;
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await API.put('/auth/profile', profileData);
      setUser(res.data);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const connectTeacher = async (teacherCode) => {
    try {
      const res = await API.post('/auth/connect-teacher', { teacherCode });
      await fetchUserProfile();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to connect to teacher');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        connectTeacher,
        fetchUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
