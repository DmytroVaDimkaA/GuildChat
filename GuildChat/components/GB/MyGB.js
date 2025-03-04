import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity, Modal, Alert } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { ref, get, update, remove } from 'firebase/database';
import { database } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Stepper from '../CustomElements/Stepper';
import FloatingActionButton from '../CustomElements/FloatingActionButton';
//import BonusView from './BonusView'; // Імпорт компонента
import BonusView from './ContributionsComponent'; // Імпорт компонента




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
  const navigation = useNavigation();

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

  const handlePress = (gbName) => {
    navigation.navigate('GBGuarant', { gbName });
};

  const handleDelete = async (buildId) => {
    try {
        // Виведення вікна підтвердження
        Alert.alert(
            'Підтвердження видалення',
            'Ви впевнені, що хочете видалити цей об\'єкт?',
            [
                {
                    text: 'Скасувати',
                    style: 'cancel',
                },
                {
                    text: 'Видалити',
                    onPress: async () => {
                        const storedGuildId = await AsyncStorage.getItem('guildId');
                        const storedUserId = await AsyncStorage.getItem('userId');

                        if (!storedGuildId || !storedUserId) {
                            throw new Error('Guild ID або User ID не знайдено в AsyncStorage');
                        }

                        const buildRef = ref(database, `guilds/${storedGuildId}/guildUsers/${storedUserId}/greatBuild/${buildId}`);
                        console.log(buildRef);

                        await remove(buildRef); // Видаляємо запис
                        
                        // Оновлюємо стан, видаляючи об'єкт з масиву
                        setGreatBuilds(prevBuilds => prevBuilds.filter(build => build.id !== buildId));
                    }
                }
            ],
            { cancelable: false }
        );
    } catch (err) {
        console.error('Error deleting build:', err);
    }
  };


  const handleToggle = (id) => {
    setExpandedBuildId(expandedBuildId === id ? null : id);
  };

  const handleFabPress = () => {
    navigation.replace('AddGBComponent'); // Перехід до AddGBComponent
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
  {greatBuilds.length === 0 ? (
    <Text>No great builds available</Text>
  ) : (
    greatBuilds.map(build => (
      <TouchableOpacity 
        key={build.id} 
        onPress={() => navigation.navigate('GBGuarant', {
          buildingName: build.buildingName,
          buildingId: build.id,
          buildingImage: build.buildingImage
        })}
      >
        <View style={styles.buildItem}>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(build.id)}>
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
          <TouchableOpacity style={styles.createButton}>
        <Text style={styles.createButtonText}>Створити новий чат</Text>
      </TouchableOpacity>
          
        </View>
      </TouchableOpacity>
    ))
  )}
</ScrollView>


      <View style={styles.fabContainer}>
        <FloatingActionButton 
          onPress={handleFabPress} 
          iconName="plus" 
        />
      </View>
    </View>
    
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
  deleteButton: {
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
    borderWidth: 1,
    //borderColor: 'red',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  buildingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  nameContainer: {
    flex: 1,
    //borderWidth: 2,
    //borderColor: 'blue',
    justifyContent: 'flex-start', // Вирівнювання блоків по верхньому краю
    alignItems: 'stretch', // Розтягує блоки на всю ширину
    backgroundColor: '#e0e0e0',
  },
  nameBlock: {
    //borderWidth: 1,
    //borderColor: 'green', // Колір рамки для nameBlock
    padding: 5,
    alignItems: 'center',
    // Висота буде автоматично підганятися під висоту тексту
  },
  additionalLevelBlock: {
    flex: 1,
    flexDirection: 'row',
    //borderWidth: 1,
    borderColor: 'orange', // Колір рамки для additionalLevelBlock
    
    alignItems: 'center'
    //padding: 5,
  },
  additionalLevelText: {
    flex: 1,
    //margin: 5,
    //padding: 10,
    //backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  additionalLevelStepper: {
    flex: 1,
    //margin: 5,
    //padding: 10,
    //backgroundColor: '#f0f0f0',
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
  highlightedText: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  tooltipContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  tooltipText: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    fontSize: 14,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 16, // Відстань від нижнього краю екрану
    right: 16,  // Відстань від правого краю екрану
    zIndex: 1,  // Забезпечує, що кнопка буде поверх інших елементів
  },
});

export default MyGB;
