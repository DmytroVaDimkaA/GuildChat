import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { getDatabase, ref, onValue, push } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { MultiSelect } from 'react-native-element-dropdown';
import CustomCheckBox from '../CustomElements/CustomCheckBox3';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const NewGBChat = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();

  const [nodeRatio, setNodeRatio] = useState('');
  const [levelThreshold, setLevelThreshold] = useState('');
  const [allowedGBs, setAllowedGBs] = useState([]);
  const [placeLimit, setPlaceLimit] = useState([false, false, false, false, false]);
  const [greatBuildings, setGreatBuildings] = useState([]);
  const [guildMembers, setGuildMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [contributionMultiplier, setContributionMultiplier] = useState(0);
  const [stepperWidth, setStepperWidth] = useState(200);
  const [coefficientText, setCoefficientText] = useState(t('newGBChat.contributionRatioLabel'));

  // Функція для локалізації значення, якщо воно є об'єктом
  const getLocalizedValue = (value) => {
    if (value && typeof value === 'object') {
      return value[i18n.language] || value['uk'] || '';
    }
    return value;
  };

  useEffect(() => {
    const db = getDatabase();

    // Отримання Великих Споруд
    const buildingsRef = ref(db, 'greatBuildings');
    onValue(buildingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const seenKeys = new Set();
        const buildingsArray = Object.keys(data)
          .map((key) => ({
            label: getLocalizedValue(data[key].buildingName), // локалізуємо назву
            value: key,
            image: data[key].buildingImage,
          }))
          .filter((item) => {
            if (seenKeys.has(item.value)) return false;
            seenKeys.add(item.value);
            return true;
          });
        // Додаємо опцію "Обрати все" на початок списку
        buildingsArray.unshift({ label: t('newGBChat.selectAllOption'), value: 'selectAll', image: null });
        setGreatBuildings(buildingsArray);
      }
    });

    // Отримання учасників гільдії
    const fetchGuildMembers = async () => {
      const guildId = await AsyncStorage.getItem('guildId');
      if (!guildId) {
        console.error(t('newGBChat.guildIdNotFound'));
        return;
      }
      console.log('Guild ID:', guildId);
      const db = getDatabase();
      const membersRef = ref(db, `guilds/${guildId}/guildUsers`);
      onValue(membersRef, (snapshot) => {
        const data = snapshot.val();
        console.log('Дані з guildUsers:', data);
        if (data) {
          const membersArray = Object.keys(data).map((key) => ({
            label: data[key].imageUrl, // URL аватара
            name: data[key].userName,
            userId: key,
          }));
          console.log('membersArray:', membersArray);
          setGuildMembers(membersArray);
        } else {
          console.warn(t('newGBChat.noGuildUsers'));
        }
      });
    };

    fetchGuildMembers();
  }, [t]);

  const handleSelectAll = (items) => {
    if (items.includes('selectAll')) {
      const allBuildingValues = greatBuildings
        .filter((item) => item.value !== 'selectAll')
        .map((item) => item.value);
      setAllowedGBs(allBuildingValues);
    } else {
      setAllowedGBs(items);
    }
  };

  const handleCheckBoxChange = (index) => {
    const newPlaceLimit = [...placeLimit];
    newPlaceLimit[index] = !newPlaceLimit[index];
    setPlaceLimit(newPlaceLimit);
  };

  const fetchContributionBoost = async (level) => {
    if (level === 0) {
      setCoefficientText(t('newGBChat.contributionRatioLabel'));
      setContributionMultiplier(0);
      return;
    }
    try {
      const response = await fetch(`https://api.foe-helper.com/v1/LegendaryBuilding/get?id=X_FutureEra_Landmark1&level=${level}`);
      const data = await response.json();
      const contributionBoost = data.response.rewards.contribution_boost;
      const coefficient = contributionBoost / 100 + 1;
      setCoefficientText(t('newGBChat.contributionRatioLabelWithCoefficient', { coefficient: coefficient.toFixed(3) }));
      setContributionMultiplier(coefficient);
    } catch (error) {
      console.error(t('newGBChat.fetchContributionError'), error);
    }
  };

  const handleCreateChat = async () => {
    try {
      const db = getDatabase();
      const auth = getAuth();
      const user = auth.currentUser;

      const selectedPlaceLimits = placeLimit
        .map((selected, index) => (selected ? index + 1 : null))
        .filter((value) => value !== null);

      const newChat = {
        rules: {
          ArcLevel: parseFloat(nodeRatio) || 0,
          levelThreshold: parseInt(levelThreshold, 10) || 0,
          allowedGBs,
          placeLimit: selectedPlaceLimits,
          contributionMultiplier: contributionMultiplier || 0,
          selectedMembers,
        },
        createdBy: user ? user.uid : null,
      };

      const guildId = await AsyncStorage.getItem('guildId');
      if (guildId) {
        await push(ref(db, `guilds/${guildId}/GBChat`), newChat);
        navigation.goBack();
      } else {
        console.error(t('newGBChat.guildIdNotFound'));
      }
    } catch (error) {
      console.error(t('newGBChat.createChatError'), error);
    }
  };

  // Компонент Stepper для зміни числових значень
  const Stepper = ({ value, onValueChange, buttonSize = 20, minValue = 0, maxValue = 200 }) => {
    const inputWidth = stepperWidth - buttonSize * 2;
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

    return (
      <View
        style={styles.stepperContainer}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setStepperWidth(width);
        }}
      >
        <TouchableOpacity onPress={handleDecrement} style={[styles.stepButton, { width: buttonSize, height: buttonSize }]}>
          <Text style={styles.stepButtonText}>-</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.valueInput, { width: inputWidth, height: buttonSize }]}
          keyboardType="numeric"
          value={inputValue}
          onChangeText={handleInputChange}
          onEndEditing={handleEndEditing}
          maxLength={String(maxValue).length}
        />
        <TouchableOpacity onPress={handleIncrement} style={[styles.stepButton, { width: buttonSize, height: buttonSize }]}>
          <Text style={styles.stepButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#ffffff' }}>
      {/* Блок для коефіцієнта внеску (nodeRatio) */}
      <View style={styles.block}>
        <Text style={{ marginBottom: 10 }}>{t('newGBChat.contributionRatioLabel')}</Text>
        <Text style={{ marginBottom: 10 }}>{coefficientText}</Text>
        <Stepper
          value={parseInt(nodeRatio, 10) || 0}
          onValueChange={(value) => {
            setNodeRatio(value);
            fetchContributionBoost(value);
          }}
          buttonSize={40}
          minValue={0}
          maxValue={200}
        />
      </View>

      {/* Блок для вибору дозволених ВС */}
      <View style={styles.block}>
        <Text style={{ marginBottom: 10 }}>{t('newGBChat.allowedGBsLabel')}</Text>
        <MultiSelect
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          data={greatBuildings}
          labelField="label"
          valueField="value"
          placeholder={t('newGBChat.selectGBPlaceholder')}
          value={allowedGBs}
          onChange={handleSelectAll}
          multiple={true}
          renderItem={(item) => (
            <View style={styles.itemContainer}>
              {item?.image && (
                <Image
                  source={{ uri: item.image }}
                  style={styles.buildingImage}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.itemText}>{item?.label}</Text>
              {allowedGBs.includes(item?.value) && (
                <FontAwesome name="check" size={16} color="#007AFF" style={{ marginLeft: 'auto' }} />
              )}
            </View>
          )}
          renderRightIcon={() => <FontAwesome name="chevron-down" size={12} color="#007AFF" />}
        />
      </View>

      {/* Блок для мінімального рівня ВС */}
      <View style={styles.block}>
        <Text style={{ marginBottom: 10 }}>{t('newGBChat.levelThresholdLabel')}</Text>
        <Stepper
          value={parseInt(levelThreshold, 10) || 0}
          onValueChange={(value) => setLevelThreshold(value)}
          buttonSize={40}
          minValue={0}
          maxValue={200}
        />
      </View>

      {/* Блок для вибору учасників гільдії */}
      <View style={styles.block}>
        <Text style={{ marginBottom: 10 }}>{t('newGBChat.guildMembersLabel')}</Text>
        <MultiSelect
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          data={guildMembers}
          labelField="name"
          valueField="userId"
          placeholder={t('newGBChat.selectMembersPlaceholder')}
          value={selectedMembers}
          onChange={(items) => setSelectedMembers(items)}
          multiple={true}
          renderItem={(item) => (
            <View style={styles.itemContainer}>
              <Image
                source={{ uri: item.label }}
                style={styles.memberImage}
                resizeMode="contain"
              />
              <Text style={styles.itemText}>{item.name}</Text>
              {selectedMembers.includes(item.userId) && (
                <FontAwesome name="check" size={16} color="#007AFF" style={{ marginLeft: 'auto' }} />
              )}
            </View>
          )}
          renderRightIcon={() => <FontAwesome name="chevron-down" size={12} color="#007AFF" />}
        />
      </View>

      {/* Блок для обмеження місць */}
      <View style={styles.block}>
        <Text style={{ marginBottom: 10 }}>{t('newGBChat.placeLimitLabel')}</Text>
        <View style={styles.checkboxContainer}>
          {[1, 2, 3, 4, 5].map((value, index) => (
            <CustomCheckBox
              key={index}
              title={`${value}`}
              checked={placeLimit[index]}
              onPress={() => handleCheckBoxChange(index)}
            />
          ))}
        </View>
      </View>

      {/* Кнопка для створення нового чату */}
      <TouchableOpacity style={styles.createButton} onPress={handleCreateChat}>
        <Text style={styles.createButtonText}>{t('newGBChat.createChatButton')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  block: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  dropdown: {
    borderWidth: 1,
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 6,
    borderColor: '#007AFF',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  stepButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  valueInput: {
    textAlign: 'center',
    backgroundColor: '#fff',
    borderColor: '#007AFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    fontSize: 16,
    color: '#000',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  buildingImage: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  memberImage: {
    width: 30,
    height: 30,
    marginRight: 10,
    borderRadius: 15,
  },
  itemText: {
    fontSize: 14,
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NewGBChat;
