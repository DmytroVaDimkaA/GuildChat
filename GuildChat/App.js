import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from './firebaseConfig'; // Предполагается, что у вас есть файл firebaseConfig.js с конфигурацией Firebase
import { ref, onValue } from 'firebase/database';
import { parseData } from './parser';
import RoleSelectionScreen from './components/RoleSelectionScreen';

export default function App() {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [parsedServers, setParsedServers] = useState(null);
  const [parseError, setParseError] = useState(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const gameId = await AsyncStorage.getItem('game_id');
        if (gameId === null) {
          setSelectedRole(null); // Показываем экран выбора роли при первом запуске
        } else {
          // Здесь можно добавить логику для загрузки данных пользователя, если это не первый запуск
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
      }

      // Получаем приветственное сообщение из Firebase
      const messageRef = ref(database, 'messages/welcome');
      onValue(messageRef, (snapshot) => {
        const message = snapshot.val();
        setWelcomeMessage(message);
      });
    };

    checkFirstLaunch();
  }, []); // Пустой массив зависимостей - useEffect выполнится только один раз при монтировании компонента

  const handleRoleSelect = async (role) => {
    try {
      await AsyncStorage.setItem('game_id', 'new_game_id'); // Заменяем 'new_game_id' на реальную логику генерации ID
      setSelectedRole(role);

      if (role === 'admin') {
        try {
          const servers = await parseData();
          setParsedServers(servers);
        } catch (error) {
          console.error('Error parsing servers:', error);
          setParseError(error.message);
        }
      }
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  return (
    <View style={styles.container}>
      {selectedRole === null ? (
        <RoleSelectionScreen onRoleSelect={handleRoleSelect} />
      ) : (
        <ScrollView style={styles.scrollContainer}>
          <Text>Выбранная роль: {selectedRole}</Text>
          <Text>{welcomeMessage}</Text>
          <Button title="Спарсить" onPress={parseData} /> 
          {parsedServers && (
            <Text style={styles.jsonOutput}>{JSON.stringify(parsedServers, null, 2)}</Text>
          )}
          {parseError && <Text style={styles.errorText}>{parseError}</Text>}
        </ScrollView>
      )}
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
  scrollContainer: {
    padding: 20,
  },
  welcomeMessage: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  jsonOutput: {
    fontFamily: 'monospace',
  },
  errorText: {
    color: 'red',
  },
});

