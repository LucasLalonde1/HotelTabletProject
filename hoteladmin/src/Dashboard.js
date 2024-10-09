import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import TabBar from './TabBar';
import ChatBox from './ChatBox';
import RoomForm from './RoomForm';
import './Dashboard.css';

function Dashboard() {
    const { isAuthenticated, loading, hotelId } = useAuth();
    const [activeTab, setActiveTab] = useState('Chat');
    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null); // Define activeRoom state
    const [activeChatRoomId, setActiveChatRoomId] = useState(null); // Define this if you use it

    const [guestName, setGuestName] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [isOccupied, setIsOccupied] = useState(false);
    const [currentGuestName, setCurrentGuestName] = useState('');

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/hotel_rooms/');
                setRooms(response.data);
            } catch (error) {
                console.error('Error fetching rooms:', error);
            }
        };

        if (isAuthenticated) {
            fetchRooms();
        }
    }, [isAuthenticated]);


    if (loading) return <div>Loading...</div>;
    if (!isAuthenticated) return <div>Please log in to view this page.</div>;

    const handleRoomSelection = (room) => {
        setActiveRoom(room);
        selectChat(room);
    };

    const selectChat = (room) => {
        setActiveRoom(room);
        setActiveChatRoomId(room.chat_room_id); // Update the activeChatRoomId if needed
    };

    const addRoom = async (event) => {
        event.preventDefault();
        console.log("HOTEL ID: ", hotelId);

        const roomData = {
            room_number: roomNumber,
            is_occupied: isOccupied,
            current_guest_name: guestName,
            hotel_id: hotelId,
        };

        try {
            const response = await axios.post('http://127.0.0.1:8000/add_room/', roomData, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            });

            if (response.status === 201) {
                console.log('Room added successfully:', response.data);
                fetchUpdatedRooms();
            } else {
                console.error('Error adding room:', response.data);
            }
        } catch (error) {
            console.error('Error adding room:', error.response || error);
        }
    };

    const fetchUpdatedRooms = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/hotel_rooms/', {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            });
            if (response.status === 200) {
                setRooms(response.data); // Update the state with the fetched rooms
            } else {
                console.error('Failed to fetch updated rooms:', response.data);
            }
        } catch (error) {
            console.error('Error fetching updated rooms:', error.response || error);
        }
    };


    return (
        <div className="dashboard">
            <aside className="sidebar">
                <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
            </aside>
            <main className="content">
                {activeTab === 'Manage Rooms' && (
                    <>
                        <RoomForm
                            hotelId={hotelId}
                            fetchUpdatedRooms={fetchUpdatedRooms}
                            activeroom={activeRoom}
                            currentGuestName={currentGuestName}
                            roomNumber={roomNumber}
                            setRoomNumber={setRoomNumber} // Ensure this function is defined
                            guestName={guestName}
                            setGuestName={setGuestName} // Ensure this function is defined
                            isOccupied={isOccupied}
                            setIsOccupied={setIsOccupied} // Ensure this function is defined
                            rooms={rooms} // Make sure rooms is defined and passed here
                        />
                    </>
                )}
                {activeTab === 'Chat' && !activeRoom ? (
                    <div className="chat-boxes">
                        {rooms.filter(room => room.is_occupied).map((room) => (
                            <div key={room.id} className="chat-box" onClick={() => selectChat(room)}>
                                Room {room.room_number} - {room.current_guest_name}
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'Chat' && activeRoom ? (
                    <ChatBox
                        activeRoom={activeRoom}
                        handleRoomSelection={handleRoomSelection}
                        setActiveRoom={setActiveRoom}
                        activeChatRoomId={activeChatRoomId} // Pass the activeChatRoomId as a prop
                        rooms={rooms}  // Ensure that 'rooms' is defined and contains an array
                    />) : (
                    <h1>{activeTab}</h1>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
