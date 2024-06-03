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
        style={[styles.button, selectedOption === 'server' && styles.selectedButton, styles.buttonWidth]} // Добавили styles.buttonWidth
        onPress={() => handleOptionPress('server')}
      >
        <Text style={styles.buttonText}>Сервер</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.disabledButton, styles.buttonWidth]} // Добавили styles.buttonWidth
        disabled
      >
        <Text style={styles.disabledButtonText}>Світ</Text>
      </TouchableOpacity>
      <View style={[styles.inputContainer, styles.buttonWidth]}> // Добавили styles.buttonWidth
        <Text style={styles.inputLabel}>Id гільдії</Text>
        <TextInput style={styles.input} editable={false} />
      </View>
      <TouchableOpacity 
        style={[styles.disabledButton, styles.buttonWidth]} // Добавили styles.buttonWidth
        disabled
      >
        <Text style={styles.disabledButtonText}>Застосувати</Text>
      </TouchableOpacity>

      {/* Отображение данных серверов или ошибки */}
      {servers && (
        <View>
          {Object.keys(servers).map((country) => (
            <View key={country}>
              <Text>{country}</Text>
              {servers[country].map((server) => (
                <Text key={server.server_name}>{server.name} - {server.server_name}</Text>
              ))}
            </View>
          ))}
        </View>
      )}
      {parseError && <Text style={styles.errorText}>{parseError}</Text>}
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
  buttonWidth: {
    width: '80%', // Аналогично ширине кнопок в RoleSelectionScreen
  },
});

export default AdminSettingsScreen;
