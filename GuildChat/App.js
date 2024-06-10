import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { database } from './firebaseConfig';
import { ref, onValue } from 'firebase/database';
import RoleSelectionScreen from './components/RoleSelectionScreen';
import AdminSettingsScreen from './components/AdminSettingsScreen';

export default function App() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedOption, setSelectedOption] = useState('Сервер'); // Для текста кнопки

  useEffect(() => {
    // ... (логика для проверки первого запуска, если необходимо)
    // ... (подключение к Firebase для получения приветственного сообщения)
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleCountryPressApp = (country) => {
    setSelectedOption(country.name); // Обновляем текст кнопки "Сервер"
  };

  return (
    <View style={styles.container}>
      {selectedRole === null ? (
        <RoleSelectionScreen onRoleSelect={handleRoleSelect} />
      ) : selectedRole === 'admin' ? (
        <AdminSettingsScreen selectedOption={selectedOption} onCountryPress={handleCountryPressApp} />
      ) : (
        <View>
          {/* Здесь можно добавить контент для роли "user" */}
        </View>
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
});
