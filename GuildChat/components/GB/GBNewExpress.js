import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import { ref, get } from 'firebase/database';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import WheelPickerExpo from 'react-native-wheel-picker-expo'; 
import { database } from '../../firebaseConfig'; 

// Масив назв днів тижня (скорочені)
const dayOfWeekUkr = ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
// Масив назв місяців (скорочені)
const monthsUkr = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру'];

/**
 * Генеруємо 7 пунктів:
 * 0: Сьогодні
 * 1: Завтра
 * 2..6: наступні 5 днів у форматі "ср, 8 бер"
 */
function generate7DayOptions() {
  const result = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    if (i === 0) {
      result.push({ label: 'Сьогодні', date: d });
    } else if (i === 1) {
      result.push({ label: 'Завтра', date: d });
    } else {
      const w = dayOfWeekUkr[d.getDay()];
      const dayNum = d.getDate();
      const monthLabel = monthsUkr[d.getMonth()];
      const label = `${w}, ${dayNum} ${monthLabel}`;
      result.push({ label, date: d });
    }
  }
  return result;
}

const GBNewExpress = () => {
  // Список ВС
  const [buildings, setBuildings] = useState([]);
  const [allowedGB, setAllowedGB] = useState(null);

  // Мінімальний рівень ВС (Stepper)
  const [levelThreshold, setLevelThreshold] = useState(0);
  const [stepperWidth, setStepperWidth] = useState(200);

  // Логіка для модального вікна вибору дати та часу
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const dayOptions = generate7DayOptions();

  // Фінальні значення, які відображаються
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // 0..6
  // Початково часу не встановлено – кнопка покаже "Призначте час"
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedMinute, setSelectedMinute] = useState(null);

  // Тимчасові значення для вибору в модалці
  const [tempDayIndex, setTempDayIndex] = useState(0);
  const [tempHourIndex, setTempHourIndex] = useState(0);
  const [tempMinuteIndex, setTempMinuteIndex] = useState(0);

  // Завантаження списку ВС із Firebase
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const storedGuildId = await AsyncStorage.getItem('guildId');
        const storedUserId = await AsyncStorage.getItem('userId');

        if (!storedGuildId || !storedUserId) {
          console.log('GuildId або UserId не знайдено в AsyncStorage');
          return;
        }

        const dbPath = `guilds/${storedGuildId}/guildUsers/${storedUserId}/greatBuild`;
        const dbRef = ref(database, dbPath);
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const buildingIds = Object.keys(data);

          const buildingPromises = buildingIds.map(async (id) => {
            const buildingRef = ref(database, `greatBuildings/${id}`);
            const buildingSnapshot = await get(buildingRef);
            if (buildingSnapshot.exists()) {
              const buildingData = buildingSnapshot.val();
              return {
                value: id,
                label: buildingData.buildingName,
                image: buildingData.buildingImage,
              };
            }
            return null;
          });

          const buildingsResults = await Promise.all(buildingPromises);
          const buildingsArray = buildingsResults.filter(item => item !== null);
          setBuildings(buildingsArray);
        } else {
          console.log('Дані за шляхом не знайдено');
        }
      } catch (error) {
        console.error('Помилка отримання даних з Firebase:', error);
      }
    };

    fetchBuildings();
  }, []);

  // Обробка вибору ВС
  const handleSelectGB = (item) => {
    setAllowedGB(item.value);
  };

  // Stepper (мінімальний рівень ВС)
  const Stepper = ({ value, onValueChange, buttonSize = 40, minValue = 0, maxValue = 200 }) => {
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
        <TouchableOpacity
          onPress={handleDecrement}
          style={[styles.stepButton, { width: buttonSize, height: buttonSize }]}
        >
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
        <TouchableOpacity
          onPress={handleIncrement}
          style={[styles.stepButton, { width: buttonSize, height: buttonSize }]}
        >
          <Text style={styles.stepButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // При відкритті модального вікна встановлюємо значення = поточний час + 2 години
  const openDateTimeModal = () => {
    const minTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
    // Знаходимо індекс у dayOptions, який відповідає даті minTime
    let foundIndex = dayOptions.findIndex(opt =>
      opt.date.getFullYear() === minTime.getFullYear() &&
      opt.date.getMonth() === minTime.getMonth() &&
      opt.date.getDate() === minTime.getDate()
    );
    if (foundIndex === -1) {
      foundIndex = 6;
    }
    setTempDayIndex(foundIndex);
    setTempHourIndex(minTime.getHours());
    setTempMinuteIndex(minTime.getMinutes());
    setShowDateTimeModal(true);
  };

  // Форматування рядка для відображення на кнопці. Якщо час не встановлено, повертаємо "Призначте час"
  const formatDayHourMinute = () => {
    if (selectedHour === null || selectedMinute === null) {
      return 'Призначте час';
    }
    if (!dayOptions[selectedDayIndex]) return 'Вказати';
    const labelDay = dayOptions[selectedDayIndex].label;
    const hh = String(selectedHour).padStart(2, '0');
    const mm = String(selectedMinute).padStart(2, '0');
    return `${labelDay}, ${hh}:${mm}`;
  };

  // Функція, що перетворює dayIndex, hour, minute у Date
  function getFullDate(dayIndex, hour, minute) {
    const base = dayOptions[dayIndex].date;
    return new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      hour,
      minute
    );
  }

  // При натисканні "Зберегти" у модальному вікні:
  const handleSaveDateTime = () => {
    let newDt = getFullDate(tempDayIndex, tempHourIndex, tempMinuteIndex);
    const minDt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    if (newDt < minDt) {
      newDt = minDt;
    }
    let foundIndex = dayOptions.findIndex(opt =>
      opt.date.getFullYear() === newDt.getFullYear() &&
      opt.date.getMonth() === newDt.getMonth() &&
      opt.date.getDate() === newDt.getDate()
    );
    if (foundIndex === -1) {
      foundIndex = 6;
    }
    setSelectedDayIndex(foundIndex);
    setSelectedHour(newDt.getHours());
    setSelectedMinute(newDt.getMinutes());
    setShowDateTimeModal(false);
  };

  return (
    <ScrollView style={{ backgroundColor: '#FFF' }}>
      <View style={styles.container}>
        {/* 1) Вибір ВС */}
        <View style={styles.block}>
          <Text style={{ marginBottom: 10 }}>ВС для експресу</Text>
          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            data={buildings}
            labelField="label"
            valueField="value"
            placeholder="Оберіть ВС"
            value={allowedGB}
            onChange={handleSelectGB}
            renderLeftIcon={() => {
              const selBuilding = buildings.find(b => b.value === allowedGB);
              if (selBuilding && selBuilding.image) {
                return (
                  <Image
                    source={{ uri: selBuilding.image }}
                    style={styles.buildingImage}
                    resizeMode="contain"
                  />
                );
              }
              return null;
            }}
            renderRightIcon={() => (
              <FontAwesome name="chevron-down" size={12} color="#007AFF" />
            )}
            renderItem={(item) => (
              <View style={styles.itemContainer}>
                {item?.image && (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.buildingImage}
                    resizeMode="contain"
                  />
                )}
                <Text style={styles.itemText}>{item.label}</Text>
              </View>
            )}
          />
        </View>

        {/* 2) Stepper для мінімального рівня ВС */}
        <View style={styles.block}>
          <Text style={{ marginBottom: 10 }}>Орієнтовна кількість рівнів</Text>
          <Stepper
            value={parseInt(levelThreshold, 10) || 0}
            onValueChange={(val) => setLevelThreshold(val)}
            buttonSize={40}
            minValue={0}
            maxValue={200}
          />
        </View>

        {/* 3) Кнопка для відкриття модального вікна вибору дати/часу */}
        <View style={styles.block}>
          <Text style={{ marginBottom: 10 }}>Запланувати час</Text>
          <TouchableOpacity style={styles.dateButton} onPress={openDateTimeModal}>
            <Text style={styles.dateButtonText}>
              {formatDayHourMinute()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Модальне вікно для вибору дати та часу */}
        {showDateTimeModal && (
          <Modal
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDateTimeModal(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowDateTimeModal(false)}>
              <View style={styles.modalBackground}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Запланувати</Text>
                    <View style={styles.wheelWrapper}>
                      <View style={styles.wheelContainer}>
                        {/* Колесо для дня (7 пунктів) */}
                        <WheelPickerExpo
                          height={180}
                          width={140}
                          initialSelectedIndex={tempDayIndex}
                          items={dayOptions.map((item, idx) => ({
                            label: item.label,
                            value: idx
                          }))}
                          onChange={({ item }) => setTempDayIndex(item.value)}
                        />
                        {/* Колесо для годин */}
                        <WheelPickerExpo
                          height={180}
                          width={60}
                          initialSelectedIndex={tempHourIndex}
                          items={Array.from({ length: 24 }, (_, i) => ({
                            label: String(i).padStart(2, '0'),
                            value: i
                          }))}
                          onChange={({ item }) => setTempHourIndex(item.value)}
                        />
                        {/* Колесо для хвилин */}
                        <WheelPickerExpo
                          height={180}
                          width={60}
                          initialSelectedIndex={tempMinuteIndex}
                          items={Array.from({ length: 60 }, (_, i) => ({
                            label: String(i).padStart(2, '0'),
                            value: i
                          }))}
                          onChange={({ item }) => setTempMinuteIndex(item.value)}
                        />
                      </View>
                      <View style={styles.selectionOverlay} pointerEvents="none" />
                    </View>
                    <TouchableOpacity
                      style={styles.modalButtonSave}
                      onPress={handleSaveDateTime}
                    >
                      <Text style={styles.modalButtonText}>Зберегти</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    paddingTop: 20,
  },
  block: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
    width: '90%',
  },
  dropdown: {
    borderWidth: 1,
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 6,
    borderColor: '#007AFF',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
  },
  buildingImage: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  itemText: {
    fontSize: 14,
  },
  // Stepper
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
  dateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  // Модальне вікно
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: '100%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#000',
    textAlign: 'center',
  },
  wheelWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  wheelContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    height: 40,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#007AFF',
  },
  modalButtonSave: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default GBNewExpress;
