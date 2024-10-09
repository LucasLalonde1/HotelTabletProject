import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [roomId, setRoomId] = useState(null);
    const [hotelId, setHotelId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [roomData, setRoomData] = useState(null); // State to store room data
    const [chatRoomId, setChatRoomId] = useState(null);


    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                // Retrieve IDs from AsyncStorage or set default values for development/testing
                const storedHotelId = /* await AsyncStorage.getItem('hotelId') || */'2'; // Example default ID
                const storedRoomId = /*await AsyncStorage.getItem('roomId') ||*/ '7'; // Example default ID

                setHotelId(storedHotelId);
                setRoomId(storedRoomId);

                // Fetch room details from the backend
                await fetchRoomDetails(storedHotelId, storedRoomId);

            } catch (error) {
                console.error('Failed to fetch hotelId and roomId', error);
            }
            setIsLoading(false);
        };

        bootstrapAsync();
    }, []);

    const fetchRoomDetails = async (hotelId, roomId) => {
        try {
            const response = await axios.get(`http://10.0.2.2:8000/tabletlogin/${hotelId}/${roomId}/`);
            if (response.data && response.data.roomDetails) {
                setRoomData(response.data.roomDetails); // Set the room details from the response
                setChatRoomId(response.data.chatRoomDetails.id);
            } else {
                console.error('Room details not found in the response');
            }
        } catch (error) {
            console.error('Error fetching room details:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ isLoading, roomId, hotelId, roomData, fetchRoomDetails, chatRoomId }}>
            {children}
        </AuthContext.Provider>
    );
};
