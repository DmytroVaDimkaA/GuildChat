import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AddGBComponent = () => {
const [availableGBs, setAvailableGBs] = useState([]);
const [userGBs, setUserGBs] = useState([]);
const [guildId, setGuildId] = useState(null);
const [userId, setUserId] = useState(null);
const navigation = useNavigation();

useEffect(() => {
const fetchIds = async () => {
const guildId = await AsyncStorage.getItem('guildId');
const userId = await AsyncStorage.getItem('userId');
setGuildId(guildId);
setUserId(userId);
};
fetchIds();
}, []);

useEffect(() => {
if (guildId && userId) {
const db = getDatabase();
const allGBRef = ref(db, 'greatBuildings');
onValue(allGBRef, (snapshot) => {
const allGBs = [];
snapshot.forEach((childSnapshot) => {
const id = childSnapshot.key;
const data = childSnapshot.val();
allGBs.push({ id, name: data.buildingName, image: data.buildingImage });
});
setAvailableGBs(allGBs);
});

const userGBRef = ref(db, `guilds/${guildId}/guildUsers/${userId}/greatBuild`);
onValue(userGBRef, (snapshot) => {
const userGBs = [];
snapshot.forEach((childSnapshot) => {
userGBs.push(childSnapshot.key);
});
setUserGBs(userGBs);
});
}
}, [guildId, userId]);

const filteredGBs = availableGBs.filter((gb) => !userGBs.includes(gb.id));

const handlePress = (id) => {
const db = getDatabase();
const gbRef = ref(db, `guilds/${guildId}/guildUsers/${userId}/greatBuild/${id}`);
set(gbRef, { level: 1 })
.then(() => {
  navigation.replace('MyGB');
})
.catch((error) => {
console.error('Помилка при додаванні ВС:', error);
});
};

const renderItem = ({ item }) => (
<TouchableOpacity onPress={() => handlePress(item.id)}>
<View style={[styles.gbItem, { backgroundColor: '#f2f2f2' }]}>
<Image source={{ uri: item.image }} style={styles.gbImage} />
<Text style={styles.gbName}>{item.name}</Text>
</View>
</TouchableOpacity>
);

return (
<View style={styles.container}>
  <FlatList
data={filteredGBs}
renderItem={renderItem}
keyExtractor={(item) => item.id}
ListEmptyComponent={<Text style={styles.emptyMessage}>Немає доступних ВС для додавання</Text>}
/>
</View>
);
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white', // додаємо явний білий фон
  },

gbItem: {
flexDirection: 'row',
alignItems: 'center',
padding: 10,
backgroundColor: '#f2f2f2',
    
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
},
gbImage: {
width: 50,
height: 50,
marginRight: 15,
resizeMode: 'contain'
},
gbName: {
fontSize: 18
},
emptyMessage: {
padding: 15,
textAlign: 'center',
color: '#888',
fontSize: 16
}
});

export default AddGBComponent;
