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
  const [parsedServers, setParsedServers] = useState(null);
  const [parseError, setParseError] = useState(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const gameId = await AsyncStorage.getItem('game_id');
        if (gameId === null) {
          setSelectedRole(null);
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
      await AsyncStorage.setItem('game_id', 'new_game_id');
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
        <>
          <Text>Выбранная роль: {selectedRole}</Text>
          <Text>{welcomeMessage}</Text>
          <Button title="Спарсить" onPress={parseData} />
          {parsedServers && (
            <View>
              {parsedServers.map((country) => (
                <View key={country.country}>
                  <Text>{country.country}</Text>
                  {country.servers.map((server) => (
                    <Text key={server.url}>{server.name} - {server.url}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}
          {parseError && <Text style={styles.errorText}>{parseError}</Text>}
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
