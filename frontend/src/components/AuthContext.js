// frontend/src/components/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Исправленный импорт

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
      token: localStorage.getItem('token'),
      user: null
  });

  // Добавляем функцию обновления данных пользователя
  const updateUserData = async () => {
    if (auth.token) {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            console.log('Updated user data:', response.data); // Добавляем лог
            setAuth(prev => ({
                ...prev,
                user: response.data
            }));
            return response.data; // Возвращаем данные
        } catch (err) {
            console.error('Error updating user data:', err);
            throw err; // Пробрасываем ошибку дальше
        }
    }
};

  useEffect(() => {
      const fetchUser = async () => {
          if (auth.token) {
              try {
                  const decoded = jwtDecode(auth.token);
                  setAuth(prev => ({ ...prev, user: { id: decoded.user.id, role: decoded.user.role } }));
                  
                  const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
                      headers: {
                          Authorization: `Bearer ${auth.token}`
                      }
                  });
                  setAuth(prev => ({ ...prev, user: res.data }));
              } catch (err) {
                  console.error(err);
                  setAuth({ token: null, user: null });
                  localStorage.removeItem('token');
              }
          }
      };
      fetchUser();
  }, [auth.token]);


  const login = (token) => {
    localStorage.setItem('token', token);
    setAuth({ token, user: null });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, updateUserData }}>
        {children}
    </AuthContext.Provider>
);
};

export default AuthProvider;
