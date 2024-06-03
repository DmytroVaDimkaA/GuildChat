import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, ScrollView } from 'react-native';
import { database } from './firebaseConfig';
import { ref, onValue } from 'firebase/database';
import RoleSelectionScreen from './components/RoleSelectionScreen';
import AdminSettingsScreen from './components/AdminSettingsScreen';

export default function App() {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [parsedServers, setParsedServers] = useState(null);
  const [parseError, setParseError] = useState(null);

  useEffect(() => {
    const messageRef = ref(database, 'messages/welcome');
    onValue(messageRef, (snapshot) => {
      const message = snapshot.val();
      setWelcomeMessage(message);
    });
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);

    if (role === 'admin') {
      parseData()
        .then(servers => setParsedServers(servers))
        .catch(error => setParseError(error.message));
    }
  };

  return (
    <View style={styles.container}>
      {selectedRole === null ? (
        <RoleSelectionScreen onRoleSelect={handleRoleSelect} />
      ) : selectedRole === 'admin' ? (
        <AdminSettingsScreen servers={parsedServers} parseError={parseError} />
      ) : (
        <ScrollView style={styles.scrollContainer}>
          <Text>Выбранная роль: {selectedRole}</Text>
          <Text>{welcomeMessage}</Text>
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
