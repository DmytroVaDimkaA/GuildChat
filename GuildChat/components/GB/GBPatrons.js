import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, onValue } from 'firebase/database';

const GBPatrons = ({ buildId, level, buildAPI, personalContribution }) => {
  console.log('Вклад власника:', personalContribution);
  const [forgepointsArray, setForgepointsArray] = useState([null]);
  const [errorMessage, setErrorMessage] = useState('');
  const [suitableChats, setSuitableChats] = useState([]);
  const [dropdownVisibility, setDropdownVisibility] = useState({});
  const [selectedMultipliers, setSelectedMultipliers] = useState([]);
  const [buttonWidths, setButtonWidths] = useState({});
  const [patronIdArray, setPatronIdArray] = useState([]);
  const [investArray, setInvestArray] = useState([]);
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
          console.log('forgepointsArray після fetchForgepoints:', forgepoints);

          // Вивід вартості закриття рівня
          const totalFP = data.response.total_fp; // Отримуємо total_fp
          console.log('Вартість закриття рівня:', totalFP); // Виводимо в консоль
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
    const fetchPatrons = async () => {
      try {
        const guildId = await AsyncStorage.getItem('guildId');
        const userId = await AsyncStorage.getItem('userId');
    
        if (guildId && userId && buildId) {
          const patronRef = ref(
            db,
            `guilds/${guildId}/guildUsers/${userId}/greatBuild/${buildId}/investment/patrons`
          );
    
          onValue(patronRef, (snapshot) => {
            if (snapshot.exists()) {
              const patrons = snapshot.val();
              const patronsArray = Object.entries(patrons).map(([patronId, data]) => ({
                patronId,
                ...data,
              }));
    
              const sortedPatrons = patronsArray.sort((a, b) => {
                if (b.invest !== a.invest) {
                  return b.invest - a.invest;
                }
                return a.timestamp - b.timestamp;
              });
    
              const newPatronIdArray = sortedPatrons.map(patron => patron.patron);
              const newInvestArray = sortedPatrons.map(patron => {
                // Ensure we convert the investment to a number
                return Number(patron.invest) || 0; // Use 0 if conversion fails
              });
    
              setPatronIdArray(newPatronIdArray);
              setInvestArray(newInvestArray);
    
              // Calculate total investment after patrons are fetched
              const totalInvest = newInvestArray.reduce((acc, invest) => acc + invest, 0);
              console.log('Сума вкладень:', totalInvest);
    
              // Assuming forgepointsArray is updated from the API call
              const totalFP = forgepointsArray.reduce((acc, fp) => acc + (fp || 0), 0); // Use your method to get totalFP
    
              const remaining = totalFP - totalInvest; // Calculate remaining forge points
              console.log('Залишок:', remaining); // Output the remaining forge points
            } else {
              console.log('Дані не знайдено для patronRef');
            }
          });
        } else {
          console.log('guildId або userId відсутні');
        }
      } catch (error) {
        console.error('Помилка отримання патронів:', error);
      }
    };
    
  
    fetchPatrons();
  }, [buildId, forgepointsArray]); // Ensure to include forgepointsArray to recalculate when it changes
  

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const guildId = await AsyncStorage.getItem('guildId');
        if (guildId && buildId) {
          const chatsRef = ref(db, `guilds/${guildId}/GBChat`);
          onValue(chatsRef, (snapshot) => {
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
                .map(([chatId, chat]) => ({ ...chat, chatId }));

              setSuitableChats(suitable);
            }
          });
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
    console.log('patronIdArray:', patronIdArray);
    console.log('investArray:', investArray);
  }, [patronIdArray, investArray]);

  useEffect(() => {
    console.log('Масив selectedMultipliers:', selectedMultipliers);
  }, [selectedMultipliers]);

  useEffect(() => {
    if (Array.isArray(selectedMultipliers) && Array.isArray(forgepointsArray)) {
      const multipliedValues = selectedMultipliers.map((multiplier, index) => {
        const forgepoint = forgepointsArray[index] || 0; // Використовуємо forgepointsArray
        return Math.round(multiplier * forgepoint); // Перемножуємо значення та округлюємо
      });
  
      console.log('Масив перемножених значень:', multipliedValues); // Виводимо в консоль
    }
  }, [selectedMultipliers, forgepointsArray]);

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

      const initialChatIds = Array.from({ length: rows.length }, (_, index) => {
        const filteredChats = suitableChats
          .filter(chat => chat.rules.placeLimit && chat.rules.placeLimit.includes(index + 1))
          .map(chat => chat.chatId);

        return filteredChats.length > 0 ? filteredChats[0] : null;
      });

      setSelectedMultipliers(initialSelected);
      console.log('Початкові активні ID чатів для dropdown:', initialChatIds);
    }
  }, [suitableChats]);

  const toggleDropdown = (index) => {
    setDropdownVisibility((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const selectMultiplier = (index, value, chatId) => {
    setSelectedMultipliers((prevState) => {
      const updated = [...prevState];
      updated[index] = value;
      return updated;
    });
    setDropdownVisibility((prevState) => ({
      ...prevState,
      [index]: false,
    }));
    console.log('Вибрано ID чату:', chatId);
  };

  const headers = ['Місце', 'Вкладник', 'Вклад', 'До гаранту', 'Коефіціент'];
  const rows = Array.from({ length: 5 }).map((_, rowIndex) => {
    return [
      rowIndex + 1,
      '-',
      forgepointsArray && forgepointsArray[rowIndex] !== undefined
        ? `${forgepointsArray[rowIndex]}`
        : '-', 
      `${(rowIndex + 1) * 50} FP`,
      null,
    ];
  });

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
                    <TouchableOpacity
                      onPress={isDropdownDisabled(rowIndex) ? null : () => toggleDropdown(rowIndex)}
                      style={[styles.button, { opacity: isDropdownDisabled(rowIndex) ? 0.5 : 1 }]}
                      onLayout={(event) => handleLayout(rowIndex, event)}
                    >
                      <Text style={styles.buttonText}>
                        {selectedMultipliers[rowIndex] || 'Виберіть коефіцієнт'}
                      </Text>
                    </TouchableOpacity>
                    {dropdownVisibility[rowIndex] && (
                      <View style={styles.dropdown}>
                        {suitableChats
                          .filter((chat) => chat.rules.placeLimit && chat.rules.placeLimit.includes(rowIndex + 1))
                          .map((chat) => (
                            <TouchableOpacity
                              key={chat.chatId}
                              onPress={() => selectMultiplier(rowIndex, chat.rules.contributionMultiplier.toFixed(2), chat.chatId)}
                              style={styles.dropdownItem}
                            >
                              <Text style={styles.dropdownText}>
                                {chat.rules.contributionMultiplier.toFixed(2)}
                              </Text>
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
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
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
    overflow: 'visible',
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
    zIndex: 1,
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
});

export default GBPatrons;
