import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, get } from 'firebase/database';

const GBPatrons = ({ buildId, level, buildAPI }) => {
  const [forgepointsArray, setForgepointsArray] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [suitableChats, setSuitableChats] = useState([]);
  const [dropdownVisibility, setDropdownVisibility] = useState({});
  const [selectedMultipliers, setSelectedMultipliers] = useState({});
  const [buttonWidths, setButtonWidths] = useState({}); // Додано для збереження ширини кнопки
  const db = getDatabase();

  useEffect(() => {
    const fetchForgepoints = async () => {
      try {
        if (buildAPI) {
          const response = await fetch(buildAPI);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          const forgepoints = data.response.patron_bonus.map((bonus) => bonus.forgepoints);
          setForgepointsArray(forgepoints);
        } else {
          setErrorMessage('Неправильний або порожній buildAPI URL: ' + buildAPI);
        }
      } catch (error) {
        setErrorMessage('Помилка отримання даних: ' + error.message);
      }
    };

    if (buildId && level !== null) {
      fetchForgepoints();
    }
  }, [buildId, level, buildAPI]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const guildId = await AsyncStorage.getItem('guildId');

        if (guildId && buildId) {
          const chatsRef = ref(db, `guilds/${guildId}/GBChat`);
          const snapshot = await get(chatsRef);

          if (snapshot.exists()) {
            const chats = snapshot.val();
            const suitable = Object.entries(chats)
              .filter(([chatId, chat]) => {
                const { inGuarant, levelThreshold, allowedGBs } = chat.rules;
                return (
                  inGuarant === true &&
                  levelThreshold <= level + 1 &&
                  allowedGBs &&
                  allowedGBs.includes(buildId)
                );
              })
              .map(([chatId, chat]) => chat);

            setSuitableChats(suitable);
          }
        }
      } catch (error) {
        console.error('Помилка під час отримання чатів:', error);
      }
    };

    if (buildId && level !== null) {
      fetchChats();
    }
  }, [buildId, level, db]);

  useEffect(() => {
    if (suitableChats.length > 0) {
      const initialSelected = Array.from({ length: rows.length }, (_, index) => {
        const filteredMultipliers = suitableChats
          .map((chat) => {
            if (chat.rules.placeLimit && chat.rules.placeLimit.includes(index + 1)) {
              return chat.rules.contributionMultiplier.toFixed(2);
            }
            return null;
          })
          .filter(Boolean)
          .sort((a, b) => b - a);
    
        return filteredMultipliers.length > 0 ? filteredMultipliers[0] : null;
      });
    
      setSelectedMultipliers(initialSelected);
    }
  }, [suitableChats]);

  const toggleDropdown = (index) => {
    setDropdownVisibility((prevState) => {
      const newVisibility = {};
      Object.keys(prevState).forEach(key => {
        newVisibility[key] = false;
      });
      return {
        ...newVisibility,
        [index]: !prevState[index],
      };
    });
  };

  const selectMultiplier = (index, value) => {
    setSelectedMultipliers((prevState) => {
      const updated = [...prevState];
      updated[index] = value;
      return updated;
    });
    setDropdownVisibility((prevState) => ({
      ...prevState,
      [index]: false,
    }));
  };

  const headers = ['Місце', 'Вкладник', 'Вклад', 'До гаранту', 'Коефіціент'];

  const rows = Array.from({ length: 5 }).map((_, rowIndex) => [
    rowIndex + 1,
    '-',
    forgepointsArray[rowIndex] !== undefined ? `${forgepointsArray[rowIndex]}` : '-',
    `${(rowIndex + 1) * 50} FP`,
    null,
  ]);

  const isDropdownDisabled = (index) => {
    const filteredMultipliers = suitableChats
      .map((chat) => {
        if (chat.rules.placeLimit && chat.rules.placeLimit.includes(index + 1)) {
          return chat.rules.contributionMultiplier.toFixed(2);
        }
        return null;
      })
      .filter(Boolean);

    return filteredMultipliers.length <= 1;
  };

  const handleLayout = (index, event) => {
    const { width } = event.nativeEvent.layout;
    setButtonWidths((prevWidths) => ({
      ...prevWidths,
      [index]: width,
    }));
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={true}>
        <View style={styles.tableContainer}>
          <View>
            <View style={styles.fixedColumn}>
              <Text style={styles.headerText}>{headers[0]}</Text>
            </View>
            {rows.map((row, rowIndex) => (
              <View style={styles.fixedColumn} key={rowIndex}>
                <Text style={styles.cellText}>{row[0]}</Text>
              </View>
            ))}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.scroll}>
            <View>
              <View style={styles.headerRow}>
                {headers.slice(1).map((header, index) => (
                  <View style={styles.headerCell} key={index}>
                    <Text style={styles.headerText}>{header}</Text>
                  </View>
                ))}
              </View>

              {rows.map((row, rowIndex) => (
                <View style={styles.tableRow} key={rowIndex}>
                  {row.slice(1, 4).map((cell, cellIndex) => (
                    <View style={styles.cell} key={cellIndex}>
                      <Text style={styles.cellText}>{cell}</Text>
                    </View>
                  ))}
                  <View style={styles.cell}>
                    {/* Кнопка для відкриття Dropdown для конкретного рядка */}
                    <TouchableOpacity
                      onPress={isDropdownDisabled(rowIndex) ? null : () => toggleDropdown(rowIndex)} // Перевірка на активність кнопки для конкретного рядка
                      style={[styles.button, { opacity: isDropdownDisabled(rowIndex) ? 0.5 : 1 }]} // Зменшуємо непрозорість, якщо кнопка пасивна
                      onLayout={(event) => handleLayout(rowIndex, event)} // Зберігаємо ширину кнопки
                    >
                      <Text style={styles.buttonText}>
                        {selectedMultipliers[rowIndex]
                          ? `${selectedMultipliers[rowIndex]}`
                          : 'Виберіть коефіціент'}
                      </Text>
                    </TouchableOpacity>

                    {/* Dropdown List для конкретного рядка */}
                    {dropdownVisibility[rowIndex] && (
                      <View style={[styles.dropdown, { width: buttonWidths[rowIndex] }]}>
                        {suitableChats
                          .map((chat) => chat.rules.contributionMultiplier.toFixed(2))
                          .filter((value, i) => 
                            rowIndex < 3 ? true : value === '1.90'
                          )
                          .sort((a, b) => b - a)
                          .map((value) => (
                            <TouchableOpacity
                              key={value}
                              onPress={() => selectMultiplier(rowIndex, value)}
                              style={styles.dropdownItem}
                            >
                              <Text>{value}</Text>
                            </TouchableOpacity>
                          ))}
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
    margin: 10,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    height: 'auto',
    zIndex: 1,
  },
  tableContainer: {
    flexDirection: 'row',
    marginTop: 5,
    height: 'auto',
    zIndex: 1,
  },
  scroll: {
    maxHeight: 800,
  },
  fixedColumn: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  headerCell: {
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 10,
  },
  headerText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 50,
  },
  cell: {
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  cellText: {
    textAlign: 'center',
    padding: 5,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
  dropdown: {
    position: 'absolute',
    //top: 40,
    //left: 0,
    //right: 0,
    zIndex: 1000,
    elevation: 10, // Для Android
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    maxHeight: 150,
    alignItems: 'center',
    top: '130%',
  },
  dropdownItem: {
    paddingTop: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
});

export default GBPatrons;
