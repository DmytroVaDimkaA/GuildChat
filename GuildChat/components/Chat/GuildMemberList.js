import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

const GuildMembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuildMembers = async () => {
      try {
        // Отримуємо guildId з AsyncStorage
        const guildId = await AsyncStorage.getItem('guildId');
        if (!guildId) throw new Error('guildId not found');

        // Отримуємо список користувачів з Firebase
        const usersSnapshot = await firestore().collection('users').get();

        // Фільтруємо та формуємо список членів гільдії
        const guildMembers = [];
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData[guildId]) {
            guildMembers.push({
              id: doc.id,
              name: userData.userName,
              avatarUrl: userData[guildId].imageUrl,
            });
          }
        });

        setMembers(guildMembers);
      } catch (error) {
        console.error('Error fetching guild members: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuildMembers();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.memberContainer}>
      <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberStatus}>активність — недавно</Text>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <FlatList
      data={members}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
};

const styles = StyleSheet.create({
  memberContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberStatus: {
    fontSize: 14,
    color: 'gray',
  },
});

export default GuildMembersList;