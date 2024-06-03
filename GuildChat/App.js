// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { database } from './firebaseConfig';
import { ref, onValue } from 'firebase/database';

export default function App() {
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    const messageRef = ref(database, 'messages/welcome');
    onValue(messageRef, (snapshot) => {
      const message = snapshot.val();
      setWelcomeMessage(message);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeMessage}>{welcomeMessage}</Text>
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
