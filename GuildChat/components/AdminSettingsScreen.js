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
  const [isLoading, setIsLoading] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = screenWidth * 0.8;

  useEffect(() => {
    const loadCountries = async () => {
      setIsLoading(true);
      try {
        const parsedData = await parseData();
        setCountries(parsedData);
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

  const handleCountryPress = () => {
    setIsModalVisible(false);
  };

  const handleApplyPress = () => {
    if (selectedServer) {
      console.log('Настройки сохранены!');
      // Здесь добавьте логику сохранения настроек (без AsyncStorage)
    } else {
      console.error('Ошибка: сервер не выбран');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#ffffff',
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
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: 20,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      maxHeight: Dimensions.get('window').height * 0.5,
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
      marginBottom: 10,
    },
    modalButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    errorText: {
      color: 'red',
      marginBottom: 10,
    },
  });

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

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { height: Dimensions.get('window').height * 0.5 }]}>
            <Text style={styles.modalTitle}>Оберіть країну</Text>

            {isLoading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : parseError ? (
              <Text style={styles.errorText}>{parseError}</Text>
            ) : (
              <FlatList
                data={countries}
                renderItem={({ item }) => (
                  <TouchableOpacity style={[styles.modalButton, { marginBottom: 10 }]} onPress={handleCountryPress}>
                    <Text style={styles.modalButtonText}>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
              />
            )}

            <TouchableOpacity style={styles.modalButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.modalButtonText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminSettingsScreen;
