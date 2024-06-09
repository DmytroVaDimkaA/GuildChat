import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, Dimensions, FlatList } from 'react-native';

const AdminSettingsScreen = () => {
  const [selectedOption, setSelectedOption] = useState('server');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = screenWidth * 0.8;

  const handleOptionPress = (option) => {
    setSelectedOption(option);
    if (option === 'server') {
      setIsModalVisible(true);
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
        <View style={[styles.inputContainer, { width: buttonWidth }]}>
          <TextInput
            style={styles.input}
            editable={selectedOption === 'server'}
            placeholder="Введіть Id гільдії"
            placeholderTextColor="#999999"
          />
        </View>
        <TouchableOpacity
          style={[styles.button, styles.disabledButton, { width: buttonWidth }]} // Добавлен disabledButton стиль
          disabled={true} // Кнопка всегда пассивна
        >
          <Text style={styles.disabledButtonText}>Застосувати</Text> 
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выберите страну</Text>

            {/* Здесь будет список стран (пока пустой) */}

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
  contentContainer: {
    flex: 1, // Занимает все доступное пространство
    justifyContent: 'center', // Выравнивание содержимого по центру вертикали
  },

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
    backgroundColor: '#0088cc', // Более темный синий для выбранной кнопки
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end', // Выравнивание содержимого по нижнему краю
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Полупрозрачный фон
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20, // Закругленные углы сверху
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center', // Выравнивание текста по центру
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#2196F3', // Цвет кнопки (синий)
    padding: 15,
    borderRadius: 5, // Более сильное закругление углов
    alignItems: 'center',
    marginTop: 20, // Отступ сверху
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AdminSettingsScreen;
