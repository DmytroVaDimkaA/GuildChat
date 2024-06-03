import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from './firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { parseData } from './parser'; // Импортируем функцию parseData

export default function App() {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const gameId = await AsyncStorage.getItem('game_id');
        if (gameId === null) {
          setIsFirstLaunch(true);
          // Здесь можно добавить логику для создания нового game_id
          await AsyncStorage.setItem('game_id', 'new_game_id'); // Пример
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
      }
    };

    checkFirstLaunch();

    const messageRef = ref(database, 'messages/welcome');
    onValue(messageRef, (snapshot) => {
      const message = snapshot.val();
      setWelcomeMessage(message);
    });
  }, []);

  return (
    <View style={styles.container}>
      {isFirstLaunch === null ? (
        <Text>Loading...</Text>
      ) : isFirstLaunch ? (
        <Text>Вы впервые зашли! {welcomeMessage}</Text>
      ) : (
        <Text>{welcomeMessage}</Text>
      )}
      <Button title="Спарсить" onPress={parseData} /> 
    </View>
  );
}

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
