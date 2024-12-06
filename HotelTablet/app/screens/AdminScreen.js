import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './AuthContext';

function AdminScreen() {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Text>Please log in</Text>;
    }

    return (
        <View>
            <Text>Welcome</Text>
            {/* Admin content here */}
        </View>
    );
}

export default AdminScreen;