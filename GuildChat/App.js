import React, { useEffect } from 'react'; // Убираем useState
import { StyleSheet, Text, View, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from './firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { parseData } from './parser';

export default function App() {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  let isFirstLaunch = true; // Используем переменную вместо состояния

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const gameId = await AsyncStorage.getItem('game_id');
        if (gameId !== null) {
          isFirstLaunch = false; // Обновляем переменную
        } else {
          await AsyncStorage.setItem('game_id', 'new_game_id'); 
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
  }, []); // Пустой массив зависимостей

  return (
    <View style={styles.container}>
      {isFirstLaunch ? ( // Используем переменную в JSX
        <Text>Вы впервые зашли! {welcomeMessage}</Text>
      ) : (
        <Text>{welcomeMessage}</Text>
      )}
      <Button title="Спарсить" onPress={parseData} />
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
