import React, { useState } from 'react';
import axios from 'axios';

function RoomForm({ hotelId, fetchUpdatedRooms, rooms }) {
    const [showPopup, setShowPopup] = useState(false);
    const [roomData, setRoomData] = useState({
        roomNumber: '',
        guestName: '',
        isOccupied: false,
    });

    const togglePopup = () => {
        setShowPopup(!showPopup);
    };

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setRoomData({
            ...roomData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const { roomNumber, guestName, isOccupied } = roomData;

        if (roomNumber == '') {
            alert('Please enter room number');
            return;
        }

        const roomPayload = {
            room_number: roomNumber,
            is_occupied: isOccupied,
            current_guest_name: guestName,
            hotel_id: hotelId,
        };

        try {
            let response;
            if (roomData.id) {
                // Modify existing room
                response = await axios.put(`http://127.0.0.1:8000/update_room/${roomData.id}/`, roomPayload, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem('token')}`,
                    },
                });
            } else {
                // Add new room
                response = await axios.post('http://127.0.0.1:8000/add_room/', roomPayload, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem('token')}`,
                    },
                });
            }

            if (response.status === 200 || response.status === 201) {
                console.log('Room operation successful:', response.data);
                fetchUpdatedRooms();
                togglePopup(); // Close popup after adding/modifying room
            } else {
                console.error('Error:', response.data);
            }
        } catch (error) {
            console.error('Error:', error.response || error);
        }
    };

    const handleModify = (room) => {
        setRoomData({
            id: room.id,
            roomNumber: room.room_number,
            guestName: room.current_guest_name,
            isOccupied: room.is_occupied,
        });
        togglePopup();
    };

    const handleDelete = async (roomId) => {
        try {
            const response = await axios.delete(`http://127.0.0.1:8000/delete_room/${roomId}/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            });

            if (response.status === 204) {
                console.log('Room deleted successfully');
                fetchUpdatedRooms();
            } else {
                console.error('Error deleting room:', response.data);
            }
        } catch (error) {
            console.error('Error deleting room:', error.response || error);
        }
    };

    return (
        <div>
            <button onClick={() => {
                setRoomData({ roomNumber: '', guestName: '', isOccupied: false });
                togglePopup();
            }}>Add Room</button>
            {showPopup && (
                <div className="popup">
                    <div className="popup-inner">
                        <h2>{roomData.id ? 'Modify Room' : 'Add Room'}</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="roomNumber"
                                value={roomData.roomNumber}
                                onChange={handleInputChange}
                                placeholder="Room number"
                                required
                            />
                            <input
                                type="text"
                                name="guestName"
                                value={roomData.guestName}
                                onChange={handleInputChange}
                                placeholder="Guest name"
                                required
                            />
                            <label>
                                Occupied:
                                <input
                                    type="checkbox"
                                    name="isOccupied"
                                    checked={roomData.isOccupied}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <button type="submit">{roomData.id ? 'Modify' : 'Add'}</button>
                            <button type="button" onClick={togglePopup}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="rooms-list">
                {rooms.map((room) => (
                    <div key={room.id} className="room-details">
                        <span>Room {room.room_number} - {room.current_guest_name}</span>
                        <button onClick={() => handleModify(room)}>Modify</button>
                        <button onClick={() => handleDelete(room.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RoomForm;
