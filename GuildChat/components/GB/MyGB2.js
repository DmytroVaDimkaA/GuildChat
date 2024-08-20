import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyGB = () => {
  const [greatBuildings, setGreatBuildings] = useState([]);
    const [error, setError] = useState(null);

      useEffect(() => {
          const fetchGreatBuildings = async () => {
                try {
                        // Видобуваємо дані з AsyncStorage
                                const guildId = await AsyncStorage.getItem('guildId');
                                        const userId = await AsyncStorage.getItem('userId');

                                                if (guildId && userId) {
                                                          // Формуємо посилання на потрібну гілку в Realtime Database
                                                                    const userRef = database().ref(`guilds/${guildId}/guildUsers/${userId}/greatBuild`);

                                                                              // Отримуємо дані з Realtime Database
                                                                                        userRef.once('value', (snapshot) => {
                                                                                                    if (snapshot.exists()) {
                                                                                                                  const buildingsData = snapshot.val();
                                                                                                                                // Перетворюємо дані у формат, придатний для FlatList
                                                                                                                                              const buildingsArray = Object.entries(buildingsData);
                                                                                                                                                            setGreatBuildings(buildingsArray);
                                                                                                                                                                        } else {
                                                                                                                                                                                      setError('Дані користувача не знайдено');
                                                                                                                                                                                                  }
                                                                                                                                                                                                            });
                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                              setError('guildId або userId не знайдено в AsyncStorage');
                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                            } catch (error) {
                                                                                                                                                                                                                                                    setError(`Помилка при отриманні даних: ${error.message}`);
                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                              };

                                                                                                                                                                                                                                                                  fetchGreatBuildings();
                                                                                                                                                                                                                                                                    }, []);

                                                                                                                                                                                                                                                                      if (error) {
                                                                                                                                                                                                                                                                          return <Text>{error}</Text>;
                                                                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                                                              return (
                                                                                                                                                                                                                                                                                  <FlatList
                                                                                                                                                                                                                                                                                        data={greatBuildings}
                                                                                                                                                                                                                                                                                              keyExtractor={(item) => item[0]}
                                                                                                                                                                                                                                                                                                    renderItem={({ item }) => (
                                                                                                                                                                                                                                                                                                            <View style={{ padding: 10 }}>
                                                                                                                                                                                                                                                                                                                      <Text>Будівля: {item[0]}</Text>
                                                                                                                                                                                                                                                                                                                                <Text>Рівень: {item[1].level}</Text>
                                                                                                                                                                                                                                                                                                                                          <Text>Інвестори: {item[1].investors ? JSON.stringify(item[1].investors) : 'Немає даних'}</Text>
                                                                                                                                                                                                                                                                                                                                                  </View>
                                                                                                                                                                                                                                                                                                                                                        )}
                                                                                                                                                                                                                                                                                                                                                            />
                                                                                                                                                                                                                                                                                                                                                              );
                                                                                                                                                                                                                                                                                                                                                              };

                                                                                                                                                                                                                                                                                                                                                              export default MyGB;