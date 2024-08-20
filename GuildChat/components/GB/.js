import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyGB = () => {
    const [greatBuildings, setGreatBuildings] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGreatBuildings = async () => {
            try {
                const guildId = await AsyncStorage.getItem('guildId');
                const userId = await AsyncStorage.getItem('userId');

                                        if (guildId && userId) {
                                                  const userRef = database().ref(`/guilds/${guildId}/guildUsers/${userId}`);

                                                            userRef.once('value').then(snapshot => {
                                                                        if (snapshot.exists()) {
                                                                                      const userData = snapshot.val();
                                                                                                    const buildings = userData.greatBuild || {};
                                                                                                                  setGreatBuildings(Object.entries(buildings));
                                                                                                                              } else {
                                                                                                                                            setError('User data not found');
                                                                                                                                                        }
                                                                                                                                                                  });
                                                                                                                                                                          } else {
                                                                                                                                                                                    setError('GuildId or UserId not found in AsyncStorage');
                                                                                                                                                                                            }
                                                                                                                                                                                                  } catch (error) {
                                                                                                                                                                                                          setError(`Error fetching great buildings: ${error.message}`);
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
                                                                                                                                                                                                                                                                            <Text>Building: {item[0]}</Text>
                                                                                                                                                                                                                                                                                      <Text>Level: {item[1].level}</Text>
                                                                                                                                                                                                                                                                                              </View>
                                                                                                                                                                                                                                                                                                    )}
                                                                                                                                                                                                                                                                                                        />
                                                                                                                                                                                                                                                                                                          );
                                                                                                                                                                                                                                                                                                          };

                                                                                                                                                                                                                                                                                                          export default MyGB;