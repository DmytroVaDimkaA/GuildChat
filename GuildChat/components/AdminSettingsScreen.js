import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Picker } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Импортируем AsyncStorage

const AdminSettingsScreen = ({ servers, parseError }) => {
  const [selectedOption, setSelectedOption] = useState('server');
  const [selectedServer, setSelectedServer] = useState(null);
  const [guildId, setGuildId] = useState('');

  const handleOptionPress = (option) => {
    setSelectedOption(option);
  };

  const handleApplyPress = async () => {
    try {
      if (selectedServer) {
        await AsyncStorage.setItem('game_id', selectedServer.server_name);
        await AsyncStorage.setItem('role', 'admin');
        // Здесь можно добавить переход к другому экрану или выполнение других действий
      } else {
        // Обработка ошибки: сервер не выбран
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      // Обработка ошибки сохранения в AsyncStorage
    }
  };

  // Проверка наличия данных серверов
  if (!servers) {
    return <Text>Loading servers...</Text>; 
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, selectedOption === 'server' && styles.selectedButton, styles.buttonWidth]}
        onPress={() => handleOptionPress('server')}
      >
        <Text style={styles.buttonText}>Сервер</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.disabledButton, styles.buttonWidth]} disabled>
        <Text style={styles.disabledButtonText}>Світ</Text>
      </TouchableOpacity>

      {selectedOption === 'server' && ( // Отображаем Picker только при выборе "Сервер"
        <Picker
          style={styles.buttonWidth}
          selectedValue={selectedServer}
          onValueChange={(itemValue) => setSelectedServer(itemValue)}
        >
          <Picker.Item label="Выберите сервер" value={null} />
          {Object.keys(servers).map((country) => (
            servers[country].map((server) => (
              <Picker.Item label={server.name} value={server} key={server.server_name} />
            ))
          ))}
        </Picker>
      )}

      <View style={[styles.inputContainer, styles.buttonWidth]}>
        <Text style={styles.inputLabel}>Id гільдії</Text>
        <TextInput
          style={styles.input}
          value={guildId}
          onChangeText={setGuildId}
          editable={selectedOption === 'server'} // Делаем поле ввода активным только при выборе "Сервер"
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, styles.buttonWidth]}
        onPress={handleApplyPress}
        disabled={!selectedServer} // Делаем кнопку активной только при выборе сервера
      >
        <Text style={styles.buttonText}>Застосувати</Text>
      </TouchableOpacity>

      {parseError && <Text style={styles.errorText}>{parseError}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0088cc',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#006699',
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
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
    color: '#999999',
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
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  buttonWidth: {
    width: '80%', 
  },
});

export default AdminSettingsScreen;

