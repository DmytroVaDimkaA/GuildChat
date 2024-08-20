import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { database } from '../../firebaseConfig'; // Імпортуйте ваш Firebase конфігураційний файл
import { ref, onValue } from 'firebase/database'; // Імпортуйте функції Firebase

const MyGB = () => {
  const [guilds, setGuilds] = useState([]);
    const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

        useEffect(() => {
            const fetchGuilds = () => {
                  const guildsRef = ref(db, 'guilds'); // Змінюємо 'guilds' на потрібний шлях у вашій БД

                        const unsubscribe = onValue(guildsRef, (snapshot) => {
                                if (snapshot.exists()) {
                                          const data = snapshot.val();
                                                    const guildsList = Object.keys(data).map(key => ({
                                                                id: key,
                                                                            ...data[key]
                                                                                      }));
                                                                                                setGuilds(guildsList);
                                                                                                        } else {
                                                                                                                  setGuilds([]);
                                                                                                                          }
                                                                                                                                  setLoading(false);
                                                                                                                                        }, (error) => {
                                                                                                                                                setError(error);
                                                                                                                                                        setLoading(false);
                                                                                                                                                              });

                                                                                                                                                                    return () => unsubscribe(); // Очистити підписку при демонтажі компонента
                                                                                                                                                                        };

                                                                                                                                                                            fetchGuilds();
                                                                                                                                                                              }, []);

                                                                                                                                                                                if (loading) {
                                                                                                                                                                                    return <ActivityIndicator size="large" color="#0000ff" />;
                                                                                                                                                                                      }

                                                                                                                                                                                        if (error) {
                                                                                                                                                                                            return <Text>Error: {error.message}</Text>;
                                                                                                                                                                                              }

                                                                                                                                                                                                return (
                                                                                                                                                                                                    <View style={styles.container}>
                                                                                                                                                                                                          <FlatList
                                                                                                                                                                                                                  data={guilds}
                                                                                                                                                                                                                          keyExtractor={(item) => item.id}
                                                                                                                                                                                                                                  renderItem={({ item }) => (
                                                                                                                                                                                                                                            <View style={styles.guildItem}>
                                                                                                                                                                                                                                                        <Text style={styles.guildName}>{item.name}</Text>
                                                                                                                                                                                                                                                                    <Text style={styles.guildDetails}>{item.details}</Text>
                                                                                                                                                                                                                                                                              </View>
                                                                                                                                                                                                                                                                                      )}
                                                                                                                                                                                                                                                                                            />
                                                                                                                                                                                                                                                                                                </View>
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
                                                                                                                                                                                                                                                                                                                                                    guildDetails: {
                                                                                                                                                                                                                                                                                                                                                        fontSize: 14,
                                                                                                                                                                                                                                                                                                                                                            color: '#666',
                                                                                                                                                                                                                                                                                                                                                              },
                                                                                                                                                                                                                                                                                                                                                              });

                                                                                                                                                                                                                                                                                                                                                              export default MyGB;