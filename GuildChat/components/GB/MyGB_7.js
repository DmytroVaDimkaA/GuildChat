import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebaseConfig'; // Шлях до конфігурації Firebase

const MyGB = () => {
  const [guilds, setGuilds] = useState([]);
    const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

        useEffect(() => {
            const fetchGuilds = () => {
                  const guildsRef = ref(database, 'guilds');

                        const unsubscribe = onValue(guildsRef, (snapshot) => {
                                if (snapshot.exists()) {
                                          const data = snapshot.val();
                                                    console.log('Fetched data:', data); // Перевірте отримані дані

                                                              // Перетворення даних на масив об'єктів
                                                                        const guildsList = Object.keys(data).map(key => ({
                                                                                    id: key,
                                                                                                ...data[key]
                                                                                                          }));
                                                                                                                    console.log('Parsed guildsList:', guildsList); // Перевірте оброблені дані
                                                                                                                              setGuilds(guildsList);
                                                                                                                                      } else {
                                                                                                                                                console.log('No data found'); // Якщо даних немає
                                                                                                                                                          setGuilds([]);
                                                                                                                                                                  }
                                                                                                                                                                          setLoading(false);
                                                                                                                                                                                }, (error) => {
                                                                                                                                                                                        console.error('Error fetching data:', error); // Обробка помилок
                                                                                                                                                                                                setError(error);
                                                                                                                                                                                                        setLoading(false);
                                                                                                                                                                                                              });

                                                                                                                                                                                                                    return () => unsubscribe(); // Очистити підписку при демонтажі компонента
                                                                                                                                                                                                                        };

                                                                                                                                                                                                                            fetchGuilds(); // Виклик функції отримання даних
                                                                                                                                                                                                                              }, []);

                                                                                                                                                                                                                                if (loading) {
                                                                                                                                                                                                                                    return <ActivityIndicator size="large" color="#0000ff" />;
                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                        if (error) {
                                                                                                                                                                                                                                            return <Text>Error: {error.message}</Text>;
                                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                                return (
                                                                                                                                                                                                                                                    <ScrollView style={styles.container}>
                                                                                                                                                                                                                                                          {guilds.length === 0 ? (
                                                                                                                                                                                                                                                                  <Text>No guilds available</Text>
                                                                                                                                                                                                                                                                        ) : (
                                                                                                                                                                                                                                                                                guilds.map(guild => (
                                                                                                                                                                                                                                                                                          <View key={guild.id} style={styles.guildItem}>
                                                                                                                                                                                                                                                                                                      <Text style={styles.guildName}>ID: {guild.id}</Text>
                                                                                                                                                                                                                                                                                                                  {Object.keys(guild).map((key, index) => key !== 'id' && (
                                                                                                                                                                                                                                                                                                                                <View key={index} style={styles.detailContainer}>
                                                                                                                                                                                                                                                                                                                                                <Text style={styles.detailKey}>{key}:</Text>
                                                                                                                                                                                                                                                                                                                                                                <Text style={styles.detailValue}>{JSON.stringify(guild[key])}</Text>
                                                                                                                                                                                                                                                                                                                                                                              </View>
                                                                                                                                                                                                                                                                                                                                                                                          ))}
                                                                                                                                                                                                                                                                                                                                                                                                    </View>
                                                                                                                                                                                                                                                                                                                                                                                                            ))
                                                                                                                                                                                                                                                                                                                                                                                                                  )}
                                                                                                                                                                                                                                                                                                                                                                                                                      </ScrollView>
                                                                                                                                                                                                                                                                                                                                                                                                                        );
                                                                                                                                                                                                                                                                                                                                                                                                                        };

                                                                                                                                                                                                                                                                                                                                                                                                                        const styles = StyleSheet.create({
                                                                                                                                                                                                                                                                                                                                                                                                                          container: {
                                                                                                                                                                                                                                                                                                                                                                                                                              flex: 1,
                                                                                                                                                                                                                                                                                                                                                                                                                                  padding: 10,
                                                                                                                                                                                                                                                                                                                                                                                                                                      backgroundColor: '#fff',
                                                                                                                                                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                                                                                                                                                          guildItem: {
                                                                                                                                                                                                                                                                                                                                                                                                                                              marginBottom: 15,
                                                                                                                                                                                                                                                                                                                                                                                                                                                  padding: 10,
                                                                                                                                                                                                                                                                                                                                                                                                                                                      borderRadius: 5,
                                                                                                                                                                                                                                                                                                                                                                                                                                                          backgroundColor: '#f0f0f0',
                                                                                                                                                                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                                                                                                                                                                              guildName: {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                  fontSize: 18,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      fontWeight: 'bold',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                                                                                                                                                                                          detailContainer: {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              marginBottom: 5,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  detailKey: {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      fontSize: 16,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          fontWeight: 'bold',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              detailValue: {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  fontSize: 14,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      color: '#666',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        });

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        export default MyGB;