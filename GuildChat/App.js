import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native'; // Убираем ненужные импорты
import { database } from './firebaseConfig';
import { ref, onValue } from 'firebase/database';
import RoleSelectionScreen from './components/RoleSelectionScreen';
import AdminSettingsScreen from './components/AdminSettingsScreen';

export default function App() {
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    // Здесь можно добавить логику для проверки первого запуска, если это необходимо
    
    // Подключение к Firebase для получения приветственного сообщения (если требуется)
    const messageRef = ref(database, 'messages/welcome');
    onValue(messageRef, (snapshot) => {
      // Обработка полученного сообщения (необязательно)
    });
  }, []);

  return (
    <View style={styles.container}>
      <RoleSelectionScreen onRoleSelect={setSelectedRole} />
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
});
