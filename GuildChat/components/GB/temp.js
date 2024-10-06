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
          members.push({ label: memberData.userName, value: childSnapshot.key });
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
              data={guildMembers}
              labelField="label"
              valueField="value"
              placeholder="Оберіть члена гільдії"
              value={selectedValue}
              onChange={(item) => setSelectedValue(item.value)}
              maxHeight={200}
            />
            <TextInput
              style={styles.input}
              value={contributorName}
              placeholder="Ім'я вкладника"
              onChangeText={setContributorName}
            />
            <TextInput
              style={styles.input}
              value={contributionAmount}
              placeholder="Розмір вкладу"
              onChangeText={setContributionAmount}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveContributor}
            >
              <Text style={styles.saveButtonText}>Зберегти</Text>
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
    backgroundColor: 'white',
    alignItems: 'center',
  },
  imageLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 5,
    overflow: 'hidden',
  },
  buildingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  levelContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  levelLabel: {
    marginBottom: 5,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  additionalTextContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  contributionContainer: {
    marginBottom: 10,
  },
  contributionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#2E86C1',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dropdown: {
    marginBottom: 20,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#28A745',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E86C1',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  stepButtonText: {
    color: 'white',
    fontSize: 20,
  },
  valueInput: {
    textAlign: 'center',
    fontSize: 18,
    color: 'black',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default GBGuarant;
