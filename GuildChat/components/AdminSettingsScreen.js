import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Dimensions } from 'react-native';

const AdminSettingsScreen = () => {
  const [selectedOption, setSelectedOption] = useState('server');

  const handleOptionPress = (option) => {
    setSelectedOption(option);
  };

  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = screenWidth * 0.8;

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={[styles.button, selectedOption === 'server' && styles.selectedButton, { width: buttonWidth }]}
          onPress={() => handleOptionPress('server')}
        >
          <Text style={styles.buttonText}>Сервер</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.disabledButton, { width: buttonWidth }]} disabled>
          <Text style={styles.disabledButtonText}>Світ</Text>
        </TouchableOpacity>
        <View style={[styles.inputContainer, { width: buttonWidth }]}>
          <TextInput 
            style={styles.input} 
            editable={false}
            placeholder="Введіть Id гільдії" // Добавили плейсхолдер
            placeholderTextColor={styles.placeholderText.color} // Применили стиль плейсхолдера
          />
        </View>
        <TouchableOpacity style={[styles.disabledButton, { width: buttonWidth }]} disabled>
          <Text style={styles.disabledButtonText}>Застосувати</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    //backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {},
  button: {
    backgroundColor: '#29ABE2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#0088CC',
  },
  disabledButton: {
    backgroundColor: '#B0B0B0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 10,
  },
 
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f2f2f2',
  },

  placeholderText: { // Добавлен новый стиль для плейсхолдера
    color: '#999999', // Светло-серый цвет текста плейсхолдера
  },
});

export default AdminSettingsScreen;
