import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity } from 'react-native';
import { ref, get, update } from 'firebase/database';
import { database } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Stepper from '../Stepper'; // Імпортуємо компонент степера

// Компонент для відображення бонусу
const BonusView = ({ bonus, build }) => {
  const [parsedBonus, setParsedBonus] = useState('');

  useEffect(() => {
    // Функція для заміни закладок у тексті
    const replaceBookmarks = async () => {
      if (!bonus || !build) return;

      try {
        // Перевірка наявності build
        if (!build.levelBase || !build.level) {
          console.error('Invalid build data');
          return;
        }

        // Формування URL для JSON файлу
        const jsonFileURLNow = `${build.levelBase}${build.level}`;
        
        // Завантаження JSON файлу
        const response = await fetch(jsonFileURLNow);
        if (!response.ok) {
          console.error('Failed to fetch JSON data');
          return;
        }
        const data = await response.json();

        // Отримання значень для заміни
        const { rewards } = data.response;

        // Регулярний вираз для знаходження закладок
        const bookmarkPattern = /{([^{}]+)}/g;

        // Замінюємо закладки на значення з JSON
        const updatedBonus = bonus.replace(bookmarkPattern, (match, p1) => {
          if (p1 === 'bookmark') return match; // Пропускаємо закладки з текстом "bookmark"
          const keys = p1.split('/');
          let value = data.response;
          for (const key of keys) {
            value = value[key];
            if (value === undefined) return match;
          }
          return value !== undefined ? value : match;
        });

        setParsedBonus(updatedBonus);
      } catch (error) {
        console.error('Error fetching or processing JSON:', error);
      }
    };

    replaceBookmarks();
  }, [bonus, build]);

  // Нормалізація тексту
  const normalizedBonus = parsedBonus
    ? parsedBonus
        .replace(/\\n/g, '\n') // Замінюємо \\n на \n
        .replace(/\r\n/g, '\n') // Замінюємо \r\n на \n
        .replace(/\r/g, '\n') // Замінюємо \r на \n
        .trim() // Обрізаємо пробіли на початку та в кінці
    : '';

  // Розбиття на абзаци
  const paragraphs = normalizedBonus.split('\n\n').map(paragraph => paragraph.trim());

  return (
    <View style={styles.bonusContainer}>
      {paragraphs.length === 0 ? (
        <Text>No bonus information available</Text>
      ) : (
        paragraphs.map((paragraph, index) => (
          <Text key={index} style={styles.buildBonus}>
            {paragraph}
          </Text>
        ))
      )}
    </View>
  );
};

// Компонент для відображення решти інформації
const DetailsView = ({ build }) => {
  useEffect(() => {
    if (build.levelBase !== undefined && build.level !== undefined) {
      const baseURL = 'https://example.com/json/';
      
      // Конкатенація для поточного рівня
      const jsonFileURLNow = `${baseURL}${build.levelBase}_level_${build.level}.json`;
      console.log('Current JSON File URL:', jsonFileURLNow);

      // Конкатенація для наступного рівня
      const jsonFileURLNext = `${baseURL}${build.levelBase}_level_${build.level + 1}.json`;
      console.log('Next JSON File URL:', jsonFileURLNext);
    }
  }, [build.levelBase, build.level]);

  return (
    <View style={styles.detailsContainer}>
      {Object.keys(build).map((key, index) =>
        key !== 'id' && key !== 'bonus' && key !== 'buildingImage' && key !== 'buildingName' && (
          <View key={index} style={styles.detailContainer}>
            <Text style={styles.detailKey}>{key}:</Text>
            <Text style={styles.detailValue}>{JSON.stringify(build[key])}</Text>
          </View>
        )
      )}
    </View>
  );
};
const MyGB = () => {
  const [greatBuilds, setGreatBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBuildId, setExpandedBuildId] = useState(null);

  useEffect(() => {
    const fetchGreatBuilds = async () => {
      try {
        const storedGuildId = await AsyncStorage.getItem('guildId');
        const storedUserId = await AsyncStorage.getItem('userId');

        if (!storedGuildId || !storedUserId) {
          throw new Error('Guild ID or User ID not found in AsyncStorage');
        }

        const guildsRef = ref(database, `guilds/${storedGuildId}/guildUsers/${storedUserId}/greatBuild`);
        const greatBuildingsRef = ref(database, 'greatBuildings');

        const buildSnapshot = await get(guildsRef);
        if (buildSnapshot.exists()) {
          const buildData = buildSnapshot.val();

          const buildingsSnapshot = await get(greatBuildingsRef);
          if (buildingsSnapshot.exists()) {
            const buildingsData = buildingsSnapshot.val();

            const buildsList = Object.keys(buildData).map(key => ({
              id: key,
              ...buildData[key]
            }));

            const mergedBuilds = buildsList.map(build => ({
              ...build,
              ...(buildingsData[build.id] || {})
            }));

            setGreatBuilds(mergedBuilds);
          } else {
            setGreatBuilds(Object.keys(buildData).map(key => ({
              id: key,
              ...buildData[key]
            })));
          }
        } else {
          setGreatBuilds([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error during fetch:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchGreatBuilds();

    return () => {};
  }, []);

  const handleToggle = (id) => {
    setExpandedBuildId(expandedBuildId === id ? null : id);
  };

  const handleValueChange = async (buildId, newValue) => {
    try {
      const storedGuildId = await AsyncStorage.getItem('guildId');
      const storedUserId = await AsyncStorage.getItem('userId');

      if (!storedGuildId || !storedUserId) {
        throw new Error('Guild ID or User ID not found in AsyncStorage');
      }

      const buildRef = ref(database, `guilds/${storedGuildId}/guildUsers/${storedUserId}/greatBuild/${buildId}`);
      await update(buildRef, { level: newValue });

      setGreatBuilds(prevBuilds =>
        prevBuilds.map(build =>
          build.id === buildId ? { ...build, level: newValue } : build
        )
      );
    } catch (err) {
      console.error('Error updating build level:', err);
    }
  };

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
            <TouchableOpacity style={styles.closeButton}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.imageNameContainer}>
              <View style={styles.imageContainer}>
                {build.buildingImage ? (
                  <Image source={{ uri: build.buildingImage }} style={styles.buildingImage} />
                ) : (
                  <Text>Image not available</Text>
                )}
              </View>
              <View style={styles.nameContainer}>
                <View style={styles.nameBlock}>
                  <Text style={styles.buildName}>{build.buildingName}</Text>
                </View>
                <View style={styles.additionalLevelBlock}>
                  <View style={styles.additionalLevelText}>
                    <Text>Рівень:</Text>
                  </View>
                  <View style={styles.additionalLevelStepper}>
                    <Stepper
                      initialValue={build.level}
                      step={1}
                      maxValue={200}
                      buildId={build.id}
                      onValueChange={handleValueChange}
                    />
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleToggle(build.id)} style={styles.chevronContainer}>
              <Ionicons
                name={expandedBuildId === build.id ? "chevron-up" : "chevron-down"}
                size={24}
                color="black"
              />
            </TouchableOpacity>
            {expandedBuildId === build.id && (
              <>
                <BonusView bonus={build.bonus} build={build} />
                <DetailsView build={build} />
              </>
            )}
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
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
  },
  imageNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#e0e0e0',
  },
  buildingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nameContainer: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'blue',
    justifyContent: 'flex-start', // Вирівнювання блоків по верхньому краю
    alignItems: 'stretch', // Розтягує блоки на всю ширину
    backgroundColor: '#e0e0e0',
  },
  nameBlock: {
    borderWidth: 1,
    borderColor: 'green', // Колір рамки для nameBlock
    padding: 5,
    alignItems: 'center',
    // Висота буде автоматично підганятися під висоту тексту
  },
  additionalLevelBlock: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'orange', // Колір рамки для additionalLevelBlock
    
    alignItems: 'center'
    //padding: 5,
  },
  additionalLevelText: {
    flex: 1,
    //margin: 5,
    //padding: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  additionalLevelStepper: {
    flex: 1,
    //margin: 5,
    //padding: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    //alignItems: 'flex-end',
  },
  

  chevronContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    zIndex: 1,
  },
  bonusContainer: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
    backgroundColor: '#ffffff',
  },
  detailsContainer: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
    backgroundColor: '#ffffff',
  },
  buildName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buildBonus: {
    fontSize: 16,
    color: '#333',
    textIndent: 10, // Додати відступ на початку кожного абзацу
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
