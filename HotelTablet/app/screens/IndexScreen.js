import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Button, StyleSheet, TouchableWithoutFeedback, Keyboard, ImageBackground, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './AuthContext';
import axios from 'axios';


const hotelImage = require('../assets/images/hotel.jpg');
const logoImage = require('../assets/images/hotelLogo.jpg');

const DefaultScreen = ({ onEnter, roomData }) => (
    <ImageBackground style={[styles.fullSize, styles.center]} source={hotelImage}>
        <TouchableOpacity onPress={onEnter} style={styles.centerContent}>
            <Image source={logoImage} style={styles.logo} />
            <Text style={styles.welcomeText}>
                Welcome to the hotel{roomData?.current_guest_name ? `, ${roomData.current_guest_name}` : ""}!
            </Text>
        </TouchableOpacity>
    </ImageBackground>
);

const ChatMenu = () => {
    const { roomData, chatRoomId } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollViewRef = useRef();
    const ws = useRef(null);

    useEffect(() => {
        const fetchMessages = async () => {
            if (chatRoomId) {
                try {
                    const response = await axios.get(`http://10.0.2.2:8000/update_chat/${chatRoomId}/`);
                    setMessages(response.data);
                } catch (error) {
                    console.error('Error fetching chat:', error);
                }
            }
        };

        fetchMessages();

        if (chatRoomId) {
            ws.current = new WebSocket(`ws://10.0.2.2:8000/ws/chat/${chatRoomId}/`);

            ws.current.onopen = () => {
                console.log('WebSocket Connected');
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data) {
                    setMessages((prevMessages) => [...prevMessages, data]);
                }
            };

            ws.current.onerror = (error) => {
                console.log('WebSocket Error: ', error);
            };

            ws.current.onclose = () => {
                console.log('WebSocket Disconnected');
            };
        }

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [chatRoomId]); // Depend on chatRoomId so that effect runs when it changes

    const sendMessage = () => {
        if (newMessage.trim() && ws.current && ws.current.readyState === WebSocket.OPEN) {
            try {
                const messageData = {
                    // Adjust this payload as per your backend expectations
                    message: newMessage,
                    timestamp: new Date().toISOString(),
                    is_from_guest: true
                };

                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify(messageData));
                    console.log("Message sent:", messageData);
                } else {
                    console.log("WebSocket is not open. Current state:", ws.current ? ws.current.readyState : "WebSocket instance not created");
                }
                setNewMessage("");
                // Use functional form of setMessages to ensure correct state update
                setMessages(prevMessages => [...prevMessages, messageData]);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };


    return (
        <View style={styles.chatContainer}>
            <ScrollView
                style={styles.messagesContainer}
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
            >
                {messages.map((message, index) => (
                    // Check if the message text is not empty before rendering
                    message.text && (
                        <View
                            key={index}
                            style={[
                                styles.message,
                                message.is_from_guest ? styles.guestMessage : styles.hotelMessage
                            ]}
                        >
                            <Text style={styles.messageText}>{message.text}</Text>
                        </View>
                    )
                ))}
            </ScrollView>


            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type your message here..."
                />
                <Button title="Send" onPress={sendMessage} />
            </View>
        </View>
    );
};


const FoodMenu = () => {
    const [menuItems, setMenuItems] = useState([
        { id: 1, name: "Cheeseburger", description: "A juicy cheeseburger with all the fixings" },
        { id: 2, name: "Pizza", description: "Classic margherita pizza with fresh basil" },
        { id: 3, name: "Salad", description: "Fresh garden salad with your choice of dressing" },
    ]);

    const addMenuItem = () => {
        const newItem = {
            id: Date.now(), // simple id generation
            name: "New Dish",
            description: "Description of the new dish",
        };
        setMenuItems([...menuItems, newItem]);
    };

    const deleteMenuItem = (itemId) => {
        setMenuItems(menuItems.filter(item => item.id !== itemId));
    };

    return (
        <View style={styles.menuContainer}>
            <Button title="Add New Item" onPress={addMenuItem} />
            <ScrollView>
                {menuItems.map((item) => (
                    <View key={item.id} style={styles.menuItem}>
                        <Text style={styles.menuItemText}>{item.name}</Text>
                        <Text>{item.description}</Text>
                        <Button title="Delete" onPress={() => deleteMenuItem(item.id)} />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const AmenitiesMenu = () => {
    const amenitiesDetails = [
        {
            title: "Gym",
            details: "Located on the 2nd floor, open 24/7, equipped with state-of-the-art fitness machines.",
            image: require('../assets/images/gym.jpg'),
        },
        {
            title: "Pool",
            details: "Rooftop infinity pool, open from 6 AM to 10 PM, offering panoramic city views.",
            image: require('../assets/images/pool.jpg'),
        },
        {
            title: "Wifi",
            details: "Complimentary high-speed wireless internet access available throughout the hotel.",
            image: require('../assets/images/wifi.jpg'),
        },
        {
            title: "Ice Machine",
            details: "Conveniently located on every floor, accessible 24/7 for all guests.",
            image: require('../assets/images/ice_machine.jpg'),
        },
    ];


    return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.amenitiesContainer}>
                {amenitiesDetails.map((amenity, index) => (
                    <View key={index} style={styles.amenityItem}>
                        <ImageBackground source={amenity.image} style={styles.amenityImage} resizeMode="cover">
                            <View style={styles.textContainer}>
                                <Text style={styles.amenityTitle}>{amenity.title}</Text>
                                <Text style={styles.amenityDetails}>{amenity.details}</Text>
                            </View>
                        </ImageBackground>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const IndexScreen = () => {
    const { roomData, fetchRoomDetails, hotelId, roomId } = useContext(AuthContext);
    const [selectedAmenity, setSelectedAmenity] = useState('Welcome');
    const [showDefaultScreen, setShowDefaultScreen] = useState(true);

    const idleTimerRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        // Function to refetch room data periodically
        const refreshRoomData = async () => {
            if (fetchRoomDetails) {
                await fetchRoomDetails(hotelId, roomId);
            }
        };

        const intervalRef = setInterval(refreshRoomData, 300000); // refresh every 5 minutes

        return () => clearInterval(intervalRef);
    }, [hotelId, roomId, fetchRoomDetails]);

    useEffect(() => {
        const resetIdleTimer = () => {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = setTimeout(() => {
                setShowDefaultScreen(true);
            }, 60000); // 30 seconds
        };

        resetIdleTimer();

        return () => {
            clearTimeout(idleTimerRef.current);
        };
    }, []);

    const resetIdleTimer = () => {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            setShowDefaultScreen(true);
        }, 30000); // 5 minutes = 300000 milliseconds
    };

    const handleUserActivity = () => {
        setShowDefaultScreen(false);
        resetIdleTimer();
    };

    const enterApp = () => {
        setShowDefaultScreen(false);
    };

    const amenities = ['Contact Front Desk', 'Food', 'Amenities'];

    const renderContent = (amenity) => {
        switch (amenity) {
            case 'Contact Front Desk':
                return <ChatMenu />;
            case 'Food':
                return <FoodMenu />;
            case 'Amenities':
                return <AmenitiesMenu />;
            default:
                return <FoodMenu />;
        }
    };


    return (
        <TouchableWithoutFeedback onPress={handleUserActivity}>
            <View style={styles.container}>
                {showDefaultScreen ? (
                    <DefaultScreen onEnter={handleUserActivity} roomData={roomData} />
                ) : (
                    <View style={styles.appContent}>
                        <View style={styles.panel}>
                            {amenities.map((amenity, index) => (
                                <TouchableOpacity key={index} style={styles.button} onPress={() => setSelectedAmenity(amenity)}>
                                    <Text style={styles.buttonText}>{amenity}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.content}>
                            {renderContent(selectedAmenity)}
                        </View>
                    </View>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    appContent: {
        flex: 1,
        flexDirection: 'row',
    },
    panel: {
        width: 200,
        backgroundColor: '#f0f0f0',
        padding: 10,
    },
    content: {
        flex: 3,
        padding: 10,
    },
    button: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#ddd',
    },
    buttonText: {
        fontSize: 16,
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
    fullSize: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 50,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        color: 'white',
    },
    logo: {
        width: 150,
        height: 150,
        borderRadius: 100, // Makes the image circular
    },


    /**
     * Front desk chat styles
     */
    chatContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    messagesContainer: {
        flex: 1,
        padding: 10,
    },
    message: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        marginBottom: 10,
        maxWidth: '80%',
    },
    guestMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#dcf8c6', // light green background for guest messages
    },
    hotelMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#ffffff', // white background for hotel messages
    },
    messageText: {
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        marginRight: 10,
    },


    /**
     * Food menu styles
     */
    menuContainer: {
        flex: 1,
        padding: 10,
    },
    menuItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
        marginBottom: 5,
    },
    menuItemText: {
        fontSize: 18,
        fontWeight: 'bold',
    },


    /**
     * Amenities styling
     */
    scrollViewContainer: {
        flexGrow: 1,
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 10,
    },
    amenityItem: {
        width: '48%', // Slightly less than half to fit two items per row with some spacing
        aspectRatio: 1, // Keeps items square-shaped
        marginBottom: 10,
    },
    amenityImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    textContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adds readability to text over the image
        padding: 10,
    },
    amenityTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    amenityDetails: {
        fontSize: 14,
        color: 'white',
    },
});

export default IndexScreen;
