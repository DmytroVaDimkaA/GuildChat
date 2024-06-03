import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Picker, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminSettingsScreen = ({ servers, parseError }) => {
  const [selectedOption, setSelectedOption] = useState('server');
  const [selectedServer, setSelectedServer] = useState(null);
  const [guildId, setGuildId] = useState('');

  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = screenWidth * 0.8;

  const handleOptionPress = (option) => {
    setSelectedOption(option);
  };

  const handleApplyPress = async () => {
    try {
      if (selectedServer) {
        await AsyncStorage.setItem('game_id', selectedServer.server_name);
        await AsyncStorage.setItem('role', 'admin');
        await AsyncStorage.setItem('guild_id', guildId);

        // Здесь можно добавить переход к другому экрану или выполнение других действий
        console.log('Настройки сохранены!');
      } else {
        console.error('Ошибка: сервер не выбран');
      }
    } catch (error) {
      console.error('Ошибка при сохранении настроек:', error);
    }
  };

  if (!servers) {
    return <Text>Loading servers...</Text>;
  }

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

        {selectedOption === 'server' && (
          <Picker
            style={{ width: buttonWidth }}
            selectedValue={selectedServer}
            onValueChange={(itemValue) => setSelectedServer(itemValue)}
          >
            <Picker.Item label="Выберите сервер" value={null} />
            {servers.map((server) => (
              <Picker.Item label={server.name} value={server} key={server.server_name} />
            ))}
          </Picker>
        )}

        <View style={[styles.inputContainer, { width: buttonWidth }]}>
          <Text style={styles.inputLabel}>Id гільдії</Text>
          <TextInput
            style={styles.input}
            value={guildId}
            onChangeText={setGuildId}
            editable={selectedOption === 'server'}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { width: buttonWidth }]}
          onPress={handleApplyPress}
          disabled={!selectedServer}
        >
          <Text style={styles.buttonText}>Застосувати</Text>
        </TouchableOpacity>
      </View>

      {parseError && <Text style={styles.errorText}>{parseError}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {},
  button: {
    backgroundColor: '#29ABE2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#2798c8',
  },
  disabledButton: {
    backgroundColor: '#B0B0B0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10,
    width: '100%',
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
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f2f2f2',
  },
  buttonWidth: {
    width: '80%',
  },
  errorText: {
    color: 'red',
  },
});

export default AdminSettingsScreen;
