import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import { ref, get, onValue, off } from 'firebase/database';
import { database } from '../../firebaseConfig'; // Шлях до конфігурації Firebase
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyGB = () => {
  const [greatBuilds, setGreatBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGreatBuilds = async () => {
      try {
        // Отримання guildId і userId з AsyncStorage
        const storedGuildId = await AsyncStorage.getItem('guildId');
        const storedUserId = await AsyncStorage.getItem('userId');

        if (!storedGuildId || !storedUserId) {
          throw new Error('Guild ID or User ID not found in AsyncStorage');
        }

        // Отримання даних про великі будівлі користувача
        const guildsRef = ref(database, `guilds/${storedGuildId}/guildUsers/${storedUserId}/greatBuild`);
        const greatBuildingsRef = ref(database, 'greatBuildings');

        const buildSnapshot = await get(guildsRef);
        if (buildSnapshot.exists()) {
          const buildData = buildSnapshot.val();

          // Отримання даних про всі великі будівлі
          const buildingsSnapshot = await get(greatBuildingsRef);
          if (buildingsSnapshot.exists()) {
            const buildingsData = buildingsSnapshot.val();

            // Форматування та об'єднання даних
            const buildsList = Object.keys(buildData).map(key => ({
              id: key,
              ...buildData[key]
            }));

            const mergedBuilds = buildsList.map(build => ({
              ...build,
              ...buildingsData[build.id] || {}
            }));

            setGreatBuilds(mergedBuilds);
          } else {
            console.log('No greatBuildings data found');
            setGreatBuilds(Object.keys(buildData).map(key => ({
              id: key,
              ...buildData[key]
            })));
          }
        } else {
          console.log('No greatBuild found for this user');
          setGreatBuilds([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error during fetch:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchGreatBuilds(); // Виклик функції отримання даних

    // Очищення підписок, якщо вони є
    return () => {
      // Тепер ви можете не використовувати `off` у цьому випадку, якщо не використовуються підписки
    };
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {greatBuilds.length === 0 ? (
        <Text>No great builds available</Text>
      ) : (
        greatBuilds.map(build => (
          <View key={build.id} style={styles.buildItem}>
            <View style={styles.imageContainer}>
              {build.buildingImage ? (
                <Image source={{ uri: build.buildingImage }} style={styles.buildingImage} />
              ) : (
                <Text>Image not available</Text>
              )}
              <View style={styles.nameContainer}>
                <Text style={styles.buildName}>{build.buildingName}</Text>
              </View>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.buildBonus}>Bonus: {build.bonus}</Text>
              {Object.keys(build).map((key, index) => key !== 'id' && key !== 'bonus' && key !== 'buildingImage' && key !== 'buildingName' && (
                <View key={index} style={styles.detailContainer}>
                  <Text style={styles.detailKey}>{key}:</Text>
                  <Text style={styles.detailValue}>{JSON.stringify(build[key])}</Text>
                </View>
              ))}
            </View>
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
  buildItem: {
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    marginBottom: 15,
    padding: 10,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
    marginBottom: 10,
    backgroundColor: '#e0e0e0',
  },
  buildingImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  nameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  emptyContainer: {
    borderWidth: 1,
    borderColor: '#000',
    height: 20,
    marginBottom: 10,
    backgroundColor: '#e0e0e0',
  },
  detailsContainer: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
    backgroundColor: '#ffffff',
  },
  buildName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  buildBonus: {
    fontSize: 16,
    color: '#333',
  },
  detailContainer: {
    marginBottom: 5,
  },
  detailKey: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 16,
    color: '#555',
  },
});

export default MyGB;
