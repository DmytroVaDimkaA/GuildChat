import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';

const AdminSettingsScreen = () => {
  const [selectedOption, setSelectedOption] = useState('server'); // Состояние для выбранной опции

  const handleOptionPress = (option) => {
    setSelectedOption(option);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, selectedOption === 'server' && styles.selectedButton]}
        onPress={() => handleOptionPress('server')}
      >
        <Text style={styles.buttonText}>Сервер</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.disabledButton} disabled>
        <Text style={styles.disabledButtonText}>Світ</Text>
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Id гільдії</Text>
        <TextInput style={styles.input} editable={false} /> 
      </View>
      <TouchableOpacity style={styles.disabledButton} disabled>
        <Text style={styles.disabledButtonText}>Застосувати</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff', // Белый фон как в Telegram
  },
  button: {
    backgroundColor: '#0088cc', // Синий цвет кнопки
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#006699', // Более темный синий для выбранной кнопки
  },
  disabledButton: {
    backgroundColor: '#e0e0e0', // Серый цвет для неактивной кнопки
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#999999', // Более светлый серый для текста неактивной кнопки
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc', // Светло-серый цвет границы
    padding: 10,
    borderRadius: 5,
  },
});

export default AdminSettingsScreen;
