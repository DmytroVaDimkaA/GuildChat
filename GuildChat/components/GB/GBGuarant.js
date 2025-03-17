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
import GBPatrons from './GBPatrons';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { buildingName, buildingId, buildingImage } = route.params;
  const [buildingLevel, setBuildingLevel] = useState(null);
  const [levelBase, setLevelBase] = useState(null);
  const [stepValue, setStepValue] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [contributorName, setContributorName] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);
  const [guildMembers, setGuildMembers] = useState([]); // Члени гільдії
  const [buildAPI, setBuildAPI] = useState('');

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
            setBuildingLevel(buildingLevelSnapshot.val());
          } else {
            setBuildingLevel(t('gbScreen.levelNotFound') || 'Рівень не знайдено');
          }

          if (levelBaseSnapshot.exists()) {
            setLevelBase(levelBaseSnapshot.val());
          } else {
            setLevelBase(t('gbScreen.levelBaseNotFound') || 'levelBase не знайдено');
          }

          if (levelBaseSnapshot.exists() && buildingLevelSnapshot.exists()) {
            const base = levelBaseSnapshot.val();
            const level = buildingLevelSnapshot.val();
            const buildAPIResult = `${base}${level + 1}`;
            setBuildAPI(buildAPIResult);
          }

          const personalValue = investmentSnapshot.exists() && investmentSnapshot.val().personal
            ? parseInt(investmentSnapshot.val().personal, 10)
            : 0;
          setStepValue(personalValue);
        }
      } catch (error) {
        console.error(t('gbScreen.loadUserDataError'), error);
      }
    };

    fetchBuildingData();
  }, [buildingId, t]);

  useEffect(() => {
    const fetchPatrons = async () => {
      const guildId = await AsyncStorage.getItem('guildId');
      const userId = await AsyncStorage.getItem('userId');

      if (guildId && userId) {
        const investmentRef = ref(database, `guilds/${guildId}/guildUsers/${userId}/greatBuild/${buildingId}/investment/patrons`);
        try {
          const snapshot = await get(investmentRef);
          if (snapshot.exists()) {
            const patrons = [];
            snapshot.forEach((childSnapshot) => {
              const patronData = childSnapshot.val();
              if (patronData.patron !== 'friend' && patronData.patron !== 'stranger') {
                patrons.push(patronData.patron);
              }
            });
            console.log('Вкладники (крім friend та stranger):', patrons);
          }
        } catch (error) {
          console.error('Помилка отримання вкладників:', error);
        }
      }
    };

    if (modalVisible) {
      fetchPatrons();
    }
  }, [modalVisible, buildingId, t]);

  const nextLevel = buildingLevel !== null && typeof buildingLevel === 'number' ? buildingLevel + 1 : null;

  const screenWidth = Dimensions.get('window').width;

  const handleSaveContributor = async () => {
    if (!selectedValue || !contributionAmount) {
      alert(t('gbGuarant.fillAllFields'));
      return;
    }
    
    try {
      const guildId = await AsyncStorage.getItem('guildId');
      const userId = await AsyncStorage.getItem('userId');
      const patronId = uuidv4();

      if (guildId && userId) {
        const patronRef = ref(database, `guilds/${guildId}/guildUsers/${userId}/greatBuild/${buildingId}/investment/patrons/${patronId}`);
        const patronData = {
          patron: selectedValue,
          invest: contributionAmount,
          timestamp: Date.now(),
        };
        await set(patronRef, patronData);
        console.log('Дані вкладника успішно збережено:', patronData);
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Помилка при збереженні вкладника:', error);
    }
  };

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
        await set(investmentRef, { personal: newValue });
        console.log('Значення успішно оновлено в Firebase:', newValue);
      }
    } catch (error) {
      console.error('Помилка оновлення даних в Firebase: ', error);
    }
  };

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
            <Text style={styles.levelText}>{t('gbGuarant.levelLabel')}</Text>
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
          <Text style={styles.contributionText}>{t('gbGuarant.myContribution')}</Text>
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
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>{t('gbGuarant.addContributorButton')}</Text>
        </TouchableOpacity>
      </View>
      <GBPatrons
        buildId={buildingId}
        level={buildingLevel}
        buildAPI={buildAPI}
        personalContribution={stepValue}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('gbGuarant.contributorModalTitle')}</Text>
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={[
                { label: t('gbGuarant.optionStranger'), value: 'stranger' },
                { label: t('gbGuarant.optionFriend'), value: 'friend' },
                { label: '---', value: null, separator: true },
                ...guildMembers,
              ]}
              labelField="label"
              valueField="value"
              value={selectedValue}
              onChange={item => {
                setSelectedValue(item.value);
              }}
              renderRightIcon={() => (
                <FontAwesome name="chevron-down" size={14} color="#007AFF" />
              )}
              placeholder={t('gbGuarant.selectContributorPlaceholder')}
              renderItem={item => (
                item.separator ? (
                  <View style={styles.separator}>
                    <Text>---</Text>
                  </View>
                ) : (
                  <View style={styles.item}>
                    {item.imageUrl && (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={{ width: 30, height: 30, borderRadius: 15, marginRight: 10 }}
                      />
                    )}
                    <Text>{item.label}</Text>
                  </View>
                )
              )}
            />
            <Text style={styles.modalTitle}>{t('gbGuarant.contributionAmountTitle')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('gbGuarant.contributionAmountPlaceholder')}
              value={contributionAmount}
              onChangeText={setContributionAmount}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveContributor}>
                <Text style={styles.saveButtonText}>{t('gbGuarant.saveButton')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>{t('gbGuarant.cancelButton')}</Text>
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
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  imageLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 110,
    height: 110,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildingImage: {
    width: 100,
    height: 100,
    borderRadius: 15,
    resizeMode: 'contain',
  },
  levelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelLabel: {
    marginBottom: 5,
  },
  levelValue: {
    padding: 5,
    borderRadius: 5,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  additionalTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  contributionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  contributionText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '80%',
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
    borderColor: '#007AFF',
    borderRadius: 8,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  stepButton: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  valueInput: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 5,
  },
  separator: {
    height: 10,
    backgroundColor: '#dddddd',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
});

export default GBGuarant;
