import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Dimensions } from 'react-native';

const AdminSettingsScreen = () => {
  const [selectedOption, setSelectedOption] = useState('server');

  const handleOptionPress = (option) => {
    setSelectedOption(option);
  };

  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = screenWidth * 0.8; // 80% от ширины экрана

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}> // Добавлен контейнер для центрирования элементов
        <TouchableOpacity
          style={[styles.button, selectedOption === 'server' && styles.selectedButton, { width: buttonWidth }]} // Фиксированная ширина
          onPress={() => handleOptionPress('server')}
        >
          <Text style={styles.buttonText}>Сервер</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.disabledButton, { width: buttonWidth }]} disabled>
          <Text style={styles.disabledButtonText}>Світ</Text>
        </TouchableOpacity>
        <View style={[styles.inputContainer, { width: buttonWidth }]}>
          <Text style={styles.inputLabel}>Id гільдії</Text>
          <TextInput style={styles.input} editable={false} />
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
    backgroundColor: '#f8f8f8', // Светло-серый фон Telegram
    alignItems: 'center', // Выравнивание по горизонтали
    justifyContent: 'center', // Выравнивание по вертикали
  },
  contentContainer: {}, // Пустой контейнер для центрирования элементов
  button: {
    backgroundColor: '#29ABE2', // Голубой цвет активной кнопки Telegram
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20, // Увеличенный радиус для более скругленных углов
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#2798c8', // Более темный голубой для выбранной кнопки
  },
  disabledButton: {
    backgroundColor: '#B0B0B0', // Серый цвет для неактивной кнопки Telegram
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16, // Уменьшенный размер шрифта
    fontWeight: '500', // Средний вес шрифта
  },
  disabledButtonText: {
    color: '#666666', // Более темный серый для текста неактивной кнопки
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333333', // Темно-серый цвет текста
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0', // Более светлый серый для границы
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f2f2f2', // Светло-серый фон поля ввода
  },
});

export default AdminSettingsScreen;
