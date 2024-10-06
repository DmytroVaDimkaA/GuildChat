import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
} from 'react-native';
import { get, ref, set } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../firebaseConfig';
import { Dropdown } from 'react-native-element-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Stepper = ({ value, onValueChange, buttonSize = 14, minValue = 0, maxValue }) => {
  const [inputValue, setInputValue] = useState(String(value));

  const handleIncrement = () => {
    const newValue = Math.min(value + 1, maxValue);
    onValueChange(newValue);
    setInputValue(String(newValue));
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - 1, minValue);
    onValueChange(newValue);
    setInputValue(String(newValue));
  };

  const handleInputChange = (text) => {
    if (/^\d*$/.test(text)) {
      setInputValue(text);
    }
  };

  const handleEndEditing = () => {
    let newValue = parseInt(inputValue, 10);
    if (isNaN(newValue)) {
      newValue = minValue;
    } else if (newValue > maxValue) {
      newValue = maxValue;
    } else if (newValue < minValue) {
      newValue = minValue;
    }
    onValueChange(newValue);
    setInputValue(String(newValue));
  };

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  return (
    <View style={styles.stepperContainer}>
      <TouchableOpacity
        onPress={handleDecrement}
        style={[styles.stepButton, { width: buttonSize, height: buttonSize }]}
      >
        <Text style={styles.stepButtonText}>-</Text>
      </TouchableOpacity>
      <TextInput
        style={[styles.valueInput, { width: 75, height: 28 }]}
        keyboardType="numeric"
        value={inputValue}
        onChangeText={handleInputChange}
        onEndEditing={handleEndEditing}
        maxLength={String(maxValue).length}
      />
      <TouchableOpacity
        onPress={handleIncrement}
        style={[styles.stepButton, { width: buttonSize, height: buttonSize }]}
      >
        <Text style={styles.stepButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const GBGuarant = ({ route, navigation }) => {
  const { buildingName, buildingId, buildingImage } = route.params;
  const [buildingLevel, setBuildingLevel] = useState(null);
  const [levelBase, setLevelBase] = useState(null);
  const [stepValue, setStepValue] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [contributorName, setContributorName] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);
  const [guildMembers, setGuildMembers] = useState([]); // Стан для членів гільдії

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -10 }}>
          <Text style={styles.headerText}>{buildingName}</Text>
        </View>
      ),
    });
  }, [navigation, buildingName]);

  useEffect(() => {
    const fetchBuildingData = async () => {
      try {
        const guildId = await AsyncStorage.getItem('guildId');
        const userId = await AsyncStorage.getItem('userId');

        if (guildId && userId) {
          const buildingLevelRef = ref(database, `guilds/${guildId}/guildUsers/${userId}/greatBuild/${buildingId}/level`);
          const levelBaseRef = ref(database, `greatBuildings/${buildingId}/levelBase`);
          const investmentRef = ref(database, `guilds/${guildId}/guildUsers/${userId}/greatBuild/${buildingId}/investment`);

          const [buildingLevelSnapshot, levelBaseSnapshot, investmentSnapshot] = await Promise.all([
            get(buildingLevelRef),
            get(levelBaseRef),
            get(investmentRef),
          ]);

          if (buildingLevelSnapshot.exists()) {
            const level = buildingLevelSnapshot.val();
            setBuildingLevel(level);
          } else {
            setBuildingLevel('Рівень не знайдено');
          }

          if (levelBaseSnapshot.exists()) {
            const base = levelBaseSnapshot.val();
            setLevelBase(base);
          } else {
            setLevelBase('levelBase не знайдено');
          }

          const personalValue = investmentSnapshot.exists() && investmentSnapshot.val().personal
            ? parseInt(investmentSnapshot.val().personal, 10)
            : 0;

          setStepValue(personalValue);
        }
      } catch (error) {
        console.error('Помилка отримання даних: ', error);
      }
    };

    fetchBuildingData();
  }, [buildingId]);

  const fetchGuildMembers = async (guildId) => {
    try {
        const guildUsersRef = ref(database, `guilds/${guildId}/guildUsers`);
        const snapshot = await get(guildUsersRef);
        if (snapshot.exists()) {
            const members = [];
            snapshot.forEach((childSnapshot) => {
                const memberData = childSnapshot.val();
                // Додаємо імена та зображення до списку членів гільдії
                members.push({
                    label: memberData.userName,
                    value: childSnapshot.key,
                    imageUrl: memberData.imageUrl, // Додаємо поле з URL зображення
                });
                // Виводимо дані про кожного члена гільдії в консоль
                console.log('User:', memberData.userName, 'Image URL:', memberData.imageUrl);
            });
            setGuildMembers(members);
        }
    } catch (error) {
        console.error('Помилка отримання членів гільдії: ', error);
    }
};


  useEffect(() => {
    const getGuildIdAndFetchMembers = async () => {
      const guildId = await AsyncStorage.getItem('guildId');
      if (guildId) {
        await fetchGuildMembers(guildId);
      }
    };
    getGuildIdAndFetchMembers();
  }, []);

  const handleValueChange = (newValue) => {
    setStepValue(newValue);
    updateInvestmentInFirebase(newValue);
  };

  const updateInvestmentInFirebase = async (newValue) => {
    try {
      const guildId = await AsyncStorage.getItem('guildId');
      const userId = await AsyncStorage.getItem('userId');
      
      if (guildId && userId) {
        const investmentRef = ref(database, `guilds/${guildId}/guildUsers/${userId}/greatBuild/${buildingId}/investment`);
        
        await set(investmentRef, {
          personal: newValue,
        });
        
        console.log('Значення успішно оновлено в Firebase:', newValue);
      }
    } catch (error) {
      console.error('Помилка оновлення даних в Firebase: ', error);
    }
  };

  const handleSaveContributor = () => {
    console.log('Вкладник:', contributorName, 'Розмір вкладу:', contributionAmount, 'Вибрано:', selectedValue);
    setModalVisible(false);
  };

  const nextLevel = buildingLevel !== null && typeof buildingLevel === 'number' ? buildingLevel + 1 : null;

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <View style={styles.imageLevelContainer}>
        <View style={styles.imageContainer}>
          {buildingImage && (
            <Image
              source={{ uri: buildingImage }}
              style={styles.buildingImage}
            />
          )}
        </View>
        <View style={styles.levelContainer}>
          <View style={styles.levelLabel}>
            <Text style={styles.levelText}>Рівень</Text>
          </View>
          <View style={styles.levelValue}>
            <Text style={styles.levelText}>
              {buildingLevel !== null ? `${buildingLevel} → ${nextLevel}` : '...'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.additionalTextContainer}>
        <View style={styles.contributionContainer}>
          <Text style={styles.contributionText}>Мій вклад</Text>
        </View>
        <Stepper
          value={stepValue}
          onValueChange={handleValueChange}
          buttonSize={28}
          minValue={0}
          maxValue={200000}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.addButton, { width: screenWidth * 0.8 }]}
          onPress={() => setModalVisible(true)} // Відкриваємо модальне вікно
        >
          <Text style={styles.addButtonText}>Додати вкладника</Text>
        </TouchableOpacity>
      </View>

      {/* Модальне вікно для вибору вкладника */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Вкладник</Text>
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={[
                { label: 'Чужинець', value: 'stranger' },
                { label: 'Друг', value: 'friend' },
                { label: '---', value: null, separator: true }, // Сепаратор
                ...guildMembers, // Динамічно отримані члени гільдії
              ]}
              labelField="label"
              valueField="value"
              value={selectedValue}
              onChange={item => {
                setSelectedValue(item.value);
                setContributorName(item.label); // Встановлюємо ім'я вкладника
              }}
              renderRightIcon={() => (
                <FontAwesome
                  name="chevron-down" // Назва іконки
                  size={14}
                  color="#007AFF" // Колір шеврона
                />
              )}
              placeholder="Оберіть вкладника..."
              renderItem={item => (
                item.separator ? (
                  <View style={[styles.separator]}>
                    <Text>---</Text>
                  </View>
                ) : (
                  <View style={styles.item}>
            {item.imageUrl && (
                <Image
                    source={{ uri: item.imageUrl }} // Виводимо зображення
                    style={{ width: 30, height: 30, borderRadius: 15, marginRight: 10 }}
                />
            )}
            <Text>{item.label}</Text>
        </View>
                )
              )}
            />
            <Text style={styles.modalTitle}>Розмір вкладу</Text>
            <TextInput
              style={styles.input}
              placeholder="Розмір вкладу"
              value={contributionAmount}
              onChangeText={setContributionAmount}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveContributor}
              >
                <Text style={styles.saveButtonText}>Зберегти</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Скасувати</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  headerText: {//-------
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  imageLevelContainer: {//-------
    flexDirection: 'row',
    alignItems: 'center',
    //marginBottom: 16,
  },
  imageContainer: {//-------
    width: 110,
    height: 110,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildingImage: {//-------
    width: 100,
    height: 100,
    borderRadius: 15,
    resizeMode: 'contain',
  },
  levelContainer: {//-------
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelLabel: {//-------
    marginBottom: 5,
  },
  levelValue: {//-------
    //backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 5,
  },
  levelText: {//-------
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  additionalTextContainer: {//-------
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  contributionContainer: {//-------
    flex: 1,
    justifyContent: 'center',
  },
  contributionText: {//-------
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {//-------
    width: '100%', // Встановлюємо ширину на весь екран
    justifyContent: 'center', // Центрування по горизонталі
    alignItems: 'center', // Центрування по горизонталі
  },
  addButton: {//-------
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: '#007AFF', // колір кнопки
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {//-------
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderColor: '#007AFF',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dropdown: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderColor: '#007AFF',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#007AFF', // Колір рамки для самого списку вибору
    borderRadius: 8,
  },
  stepperContainer: {//-------
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  stepButton: {//-------
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtonText: {//-------
    fontSize: 16,
    color: '#fff',
  },
  valueInput: {//-------
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#dddddd', // Колір сепаратора
    //marginVertical: 10, // Відстань зверху і знизу
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center', 
    paddingVertical: 10, // Відступи зверху і знизу для кожного елемента
    paddingHorizontal: 15, // Відступи з боків
  },
});

export default GBGuarant;
