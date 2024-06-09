import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { parseData } from '../parser';

const AdminSettingsScreen = () => {
  const [selectedOption, setSelectedOption] = useState('server');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [guildId, setGuildId] = useState('');
  const [parseError, setParseError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = screenWidth * 0.8;

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const parsedData = await parseData();
        setCountries(Object.keys(parsedData));
      } catch (error) {
        setParseError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCountries();
  }, []);

  const handleOptionPress = (option) => {
    setSelectedOption(option);
    if (option === 'server') {
      setIsModalVisible(true);
    }
  };

  const handleCountryPress = (country) => {
    setSelectedCountry(country);
  };

  const handleServerPress = (server) => {
    setSelectedServer(server);
    setIsModalVisible(false);
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
        // Обработка ошибки: сервер не выбран
      }
    } catch (error) {
      console.error('Ошибка при сохранении настроек:', error);
      // Обработка ошибки сохранения в AsyncStorage
    }
  };

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

        {/* Отображение списка серверов (если выбрана страна) */}
        {selectedCountry && servers && (
          <FlatList
            data={servers[selectedCountry]}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.button, selectedServer === item && styles.selectedButton, { width: buttonWidth }]}
                onPress={() => handleServerPress(item)}
              >
                <Text style={styles.buttonText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.server_name}
          />
        )}

        <View style={[styles.inputContainer, { width: buttonWidth }]}>
          <TextInput
            style={styles.input}
            value={guildId}
            onChangeText={setGuildId}
            editable={selectedOption === 'server'}
            placeholder="Введіть Id гільдії"
            placeholderTextColor="#999999"
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

      {/* Модальное окно для выбора страны */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выберите страну</Text>

            {/* Отображение списка стран или индикатора загрузки/ошибки */}
            {isLoading ? (
              <ActivityIndicator size="large" color="#0000ff" /> 
            ) : parseError ? (
              <Text style={styles.errorText}>{parseError}</Text>
            ) : (
              <FlatList
                data={countries}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => handleCountryPress(item)}
                  >
                    <Text style={styles.modalButtonText}>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
              />
            )}

            <TouchableOpacity style={styles.modalButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.modalButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  placeholderText: {
    color: '#999999',
  },
  modalContainer: { // Стили для модального окна
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#29ABE2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminSettingsScreen;


