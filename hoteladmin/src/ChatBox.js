import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';
import axios from 'axios';

function ChatBox({ activeRoom, handleRoomSelection, setActiveRoom, rooms, activeChatRoomId, setActiveChatRoomId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [ws, setWs] = useState(null);
    const [showChatBoxes, setShowChatBoxes] = useState(true); // State to track whether to show chat-boxes
    const messagesEndRef = useRef(null);

    //Scroll to bottom of chat
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, showChatBoxes]);

    useEffect(() => {
        if (activeChatRoomId) {
            const webSocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${activeChatRoomId}/`);
            setWs(webSocket);

            webSocket.onmessage = function (event) {
                const data = JSON.parse(event.data);
                console.log('Received message:', data);
                if (data) {
                    setMessages(messages => [...messages, data]);
                }
            };

            // Before return statement in your component
            console.log('Messages to render:', messages);


            webSocket.onclose = function (e) {
                console.error('Chat socket closed unexpectedly');
            };

            return () => {
                webSocket.close();
            };
        }
    }, [activeChatRoomId]);

    useEffect(() => {
        const getChat = async () => {
            if (!activeRoom) return;

            try {
                const response = await axios.get(`http://127.0.0.1:8000/update_chat/${activeChatRoomId}/`);
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching chat: ', error);
            }
        };

        getChat();
    }, [activeRoom]);

    const renderMessage = (message, index) => {
        const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleString() : '';
        const messageClass = message.is_from_guest ? 'guest' : 'hotel';

        return (
            <div key={`${message.id}_${index}`} className={`message ${messageClass}`}>
                <div className="message-content">
                    <p className="message-text">{message.text}</p>
                    <span className="timestamp">{timestamp}</span>
                </div>
            </div>
        );
    };

    const sendMessage = async (event) => {
        event.preventDefault();
        if (!newMessage.trim() || !ws) return;

        const messageData = {
            message: newMessage,
            timestamp: new Date().toISOString(),
            is_from_guest: false
        };

        ws.send(JSON.stringify(messageData));
        setNewMessage(''); // Clear the input after sending the message
    };

    return (
        <div className="active-chat">
            <button className="back-button" onClick={() => setActiveRoom(null)}>Back</button>
            <h2>{activeRoom ? `Room ${activeRoom.room_number} - Chat` : 'Select a room'}</h2>
            <div className="chat-container">
                <div className="messages-container">
                    {messages.map(renderMessage)}
                    <div ref={messagesEndRef} /> {/* Invisible element to scroll to */}
                </div>
                <form className="input-container" onSubmit={sendMessage}>
                    <input
                        className="input"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onClick={e => e.stopPropagation()} // Prevent click event from bubbling up
                        placeholder="Type your message here..."
                    />
                    <button type="submit">Send</button>
                </form>
            </div>

            {!showChatBoxes && ( // Hide chat-boxes if showChatBoxes is false
                <div className="chat-boxes">
                    {rooms.map(room => (
                        <div key={room.id} className="chat-box" onClick={() => handleRoomSelection(room)}>
                            Room {room.room_number} - {room.current_guest_name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ChatBox;
