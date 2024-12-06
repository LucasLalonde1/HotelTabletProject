import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, AuthContext } from './app/screens/AuthContext';
import IndexScreen from './app/screens/IndexScreen';
import AdminScreen from './app/screens/AdminScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

const RootNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator initialRouteName={user ? "AdminScreen" : "IndexScreen"}>
      <Stack.Screen name="IndexScreen" component={IndexScreen} />
      <Stack.Screen name="AdminScreen" component={AdminScreen} />
    </Stack.Navigator>
  );
};

export default App;