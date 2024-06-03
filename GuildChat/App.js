import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from './firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { parseData } from './parser';
import RoleSelectionScreen from './components/RoleSelectionScreen';

export default function App() {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const gameId = await AsyncStorage.getItem('game_id');
        if (gameId === null) {
          // Первый запуск, показываем экран выбора роли
          setSelectedRole(null); 
        } else {
          // Если не первый запуск, не нужно получать роль из AsyncStorage
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
      }

      const messageRef = ref(database, 'messages/welcome');
      onValue(messageRef, (snapshot) => {
        const message = snapshot.val();
        setWelcomeMessage(message);
      });
    };

    checkFirstLaunch();
  }, []);

  const handleRoleSelect = async (role) => {
    try {
      await AsyncStorage.setItem('game_id', 'new_game_id'); // Сохраняем game_id
      setSelectedRole(role); // Обновляем состояние с выбранной ролью
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  return (
    <View style={styles.container}>
      {selectedRole === null ? (
        <RoleSelectionScreen onRoleSelect={handleRoleSelect} />
      ) : (
        <>
          <Text>Выбранная роль: {selectedRole}</Text> 
          <Text>{welcomeMessage}</Text>
          <Button title="Спарсить" onPress={parseData} />
        </>
      )}
    </View>
  );
}

// ... (styles)


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeMessage: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
