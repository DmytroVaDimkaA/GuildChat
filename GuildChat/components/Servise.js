import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Image } from "react-native";
import { ref, onValue } from "firebase/database";
import { database } from '../firebaseConfig'; // Імпортуємо об’єкт database

const GuildSelector = () => {
  const [buildingNames, setBuildingNames] = useState([]);
  const [selectedBonus, setSelectedBonus] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchBuildingNames = () => {
      const buildingRef = ref(database, '/greatBuildings');
      onValue(buildingRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          console.log("Data from 'greatBuildings' node:", data); // Вивід всіх даних з вузла greatBuildings

          // Отримання всіх значень buildingName та imageUrl
          const buildingNamesArray = Object.keys(data).map(key => ({
            name: data[key].buildingName,
            imageUrl: data[key].imageUrl,
            bonus: data[key].bonus // додано ключ bonus
          }));
          console.log("Building names and images:", buildingNamesArray); // Вивід значень buildingName та imageUrl

          // Збереження значень у стані
          setBuildingNames(buildingNamesArray);
        }
      }, (error) => {
        console.error("Error fetching data: ", error);
      });
    };

    fetchBuildingNames();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.bonusContainer}>
        {selectedBonus && <Text style={styles.selectedBonusText}>Бонус: {selectedBonus}</Text>}
      </View>
      
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Виберіть гільдію:</Text>
            <FlatList
              data={buildingNames}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.itemContainer}
                  onPress={() => {
                    console.log("Selected:", item.name);
                    setSelectedBonus(item.bonus);
                    setModalVisible(false);
                  }}
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                  <Text style={styles.itemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {!selectedBonus && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>Обрати ВС</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: "white"
  },
  bonusContainer: {
    position: 'absolute',
    top: 50,
    alignItems: 'center',
  },
  selectedBonusText: {
    fontSize: 20,
    color: 'black',
    marginBottom: 10,
  },
  footer: {
    width: '100%',
    position: 'absolute',
    bottom: 50,
    padding: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#007bff',
    marginBottom: 10,
    borderRadius: 10,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  itemText: {
    color: 'white',
    fontSize: 18,
  },
  closeButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GuildSelector;
