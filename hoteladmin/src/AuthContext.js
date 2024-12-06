import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hotelId, setHotelId] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            // Use sessionStorage to retrieve the token
            const token = sessionStorage.getItem('token');
            if (token) {
                try {
                    const config = {
                        headers: {
                            'Authorization': `Token ${token}`
                        }
                    };
                    // Your endpoint to verify the token
                    const response = await axios.get('http://127.0.0.1:8000/verify_token/', config);
                    if (response.data.valid) {
                        setUser({ ...response.data.user, token });
                        setHotelId(response.data.user.hotel);
                    } else {
                        sessionStorage.removeItem('token');
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Token verification failed:', error);
                    sessionStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        verifyToken();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/login/', { username, password });
            const { token, user, rooms } = response.data;

            if (token) {
                // Use sessionStorage to store the token
                sessionStorage.setItem('token', token);
                setUser(user);
                setHotelId(user.hotel);
            } else {
                console.error('No token received');
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, loading, hotelId }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
