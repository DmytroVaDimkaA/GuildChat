import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { getDatabase, ref, onValue, push } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { MultiSelect } from 'react-native-element-dropdown';
import { Dropdown } from 'react-native-element-dropdown';
import CustomCheckBox from '../CustomElements/CustomCheckBox3';

const NewGBChat = ({ navigation }) => {
const [chatName, setChatName] = useState('');
const [nodeComparison, setNodeComparison] = useState('more');
const [nodeRatio, setNodeRatio] = useState('');
const [levelThreshold, setLevelThreshold] = useState('');
const [allowedGBs, setAllowedGBs] = useState([]);
const [placeLimit, setPlaceLimit] = useState([false, false, false, false, false]);
const [contributionMultiplier, setContributionMultiplier] = useState('');
const [greatBuildings, setGreatBuildings] = useState([]);
const [modalVisible, setModalVisible] = useState(false);
const comparisonOptions = [
{ label: 'Менше', value: 'less' },
{ label: 'Рівно', value: 'equals' },
{ label: 'Не менше', value: 'more' }
];
const [stepperWidth, setStepperWidth] = useState(200);

useEffect(() => {
const db = getDatabase();
const buildingsRef = ref(db, 'greatBuildings');

onValue(buildingsRef, (snapshot) => {
const data = snapshot.val();
if (data) {
const buildingsArray = Object.keys(data).map((key) => ({
label: data[key].buildingName,
value: key,
image: data[key].buildingImage
}));
setGreatBuildings(buildingsArray);
}
});
}, []);

const renderBuildingItem = (item) => (
<View style={styles.item}>
<Image source={{ uri: item.image }} style={styles.image} />
<Text>{item.label}</Text>
</View>
);

const handleCheckBoxChange = (index) => {
const newPlaceLimit = [...placeLimit];
newPlaceLimit[index] = !newPlaceLimit[index];
setPlaceLimit(newPlaceLimit);
};

const handleCreateChat = async () => {
try {
const db = getDatabase();
const auth = getAuth();
const user = auth.currentUser;

const selectedPlaceLimits = placeLimit
.map((selected, index) => (selected ? index + 1 : null))
.filter((value) => value !== null);

const newChat = {
chatName,
rules: {
nodeComparison,
nodeRatio: parseFloat(nodeRatio),
levelThreshold: parseInt(levelThreshold),
allowedGBs,
placeLimit: selectedPlaceLimits,
contributionMultiplier: parseFloat(contributionMultiplier)
},
createdBy: user ? user.uid : null,
createdAt: new Date().toISOString()
};

await push(ref(db, 'chats'), newChat);
navigation.goBack();
} catch (error) {
console.error('Помилка при створенні чату:', error);
}
};

const Stepper = ({ value, onValueChange, buttonSize = 20, minValue = 0, maxValue = 200 }) => {
const inputWidth = stepperWidth - buttonSize * 2;
const [inputValue, setInputValue] = useState(String(value));

const handleIncrement = () => {
const newValue = Math.min(value + 1, maxValue);
onValueChange(newValue);
setInputValue(String(newValue));
};

const handleDecrement = () => {
const newValue = Math.max(value - 1, minValue);
onValueChange(newValue);
setInputValue(String(newValue));
};

const handleInputChange = (text) => {
if (/^\d*$/.test(text)) {
setInputValue(text);
}
};

const handleEndEditing = () => {
let newValue = parseInt(inputValue, 10);
if (isNaN(newValue)) {
newValue = minValue;
} else if (newValue > maxValue) {
newValue = maxValue;
} else if (newValue < minValue) {
newValue = minValue;
}
onValueChange(newValue);
setInputValue(String(newValue));
};

return (
<View style={styles.stepperContainer} onLayout={(event) => {
const { width } = event.nativeEvent.layout;
setStepperWidth(width);
}}>
<TouchableOpacity
onPress={handleDecrement}
style={[styles.stepButton, { width: buttonSize, height: buttonSize }]}
>
<Text style={styles.stepButtonText}>-</Text>
</TouchableOpacity>
<TextInput
style={[styles.valueInput, { width: inputWidth, height: buttonSize }]}
keyboardType="numeric"
value={inputValue}
onChangeText={handleInputChange}
onEndEditing={handleEndEditing}
maxLength={String(maxValue).length}
/>
<TouchableOpacity
onPress={handleIncrement}
style={[styles.stepButton, { width: buttonSize, height: buttonSize }]}
>
<Text style={styles.stepButtonText}>+</Text>
</TouchableOpacity>
</View>
);
};

const handleNodeRatioChange = (value) => {
setNodeRatio(value);
setModalVisible(true);
};

return (
<ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#ffffff' }}>
<View style={styles.block}>
<Text style={{ marginBottom: 10 }}>Назва чату (chatName):</Text>
<TextInput
value={chatName}
onChangeText={setChatName}
placeholder="chatName"
style={styles.input}
/>
</View>

<View style={styles.block}>
<Text style={{ marginBottom: 10 }}>Умова внеску (nodeComparison):</Text>
<Dropdown
style={styles.dropdown}
data={comparisonOptions}
labelField="label"
valueField="value"
placeholder="Оберіть умову внеску"
value={nodeComparison}
onChange={(item) => setNodeComparison(item.value)}
/>
</View>

<View style={styles.block}>
<Text style={{ marginBottom: 10 }}>Дозволені в гілці ВС (allowedGBs):</Text>
<MultiSelect
style={styles.dropdown}
data={greatBuildings}
labelField="label"
valueField="value"
placeholder="Оберіть ВС"
value={allowedGBs}
onChange={(items) => setAllowedGBs(items)}
renderItem={renderBuildingItem}
selectedStyle={styles.selectedStyle}
multiple={true}
/>
</View>

<View style={styles.block}>
<Text style={{ marginBottom: 10 }}>Коефіцієнт внеску (nodeRatio):</Text>
<Stepper
value={parseInt(nodeRatio, 10) || 0}
onValueChange={handleNodeRatioChange}
buttonSize={40}
minValue={0}
maxValue={200}
/>
</View>

<View style={styles.block}>
<Text style={{ marginBottom: 10 }}>Мінімальний рівень ВС (levelThreshold):</Text>
<Stepper
value={parseInt(levelThreshold, 10) || 0}
onValueChange={(value) => setLevelThreshold(value)}
buttonSize={40}
minValue={0}
maxValue={200}
/>
</View>

<View style={styles.block}>
<Text style={{ marginBottom: 10 }}>Обмеження місць (placeLimit):</Text>
<View style={styles.checkboxContainer}>
{[1, 2, 3, 4, 5].map((value, index) => (
<CustomCheckBox
key={index}
title={`${value}`}
checked={placeLimit[index]}
onPress={() => handleCheckBoxChange(index)}
/>
))}
</View>
</View>

<View style={styles.block}>
<Text style={{ marginBottom: 10 }}>Множник внеску (contributionMultiplier):</Text>
<TextInput
value={contributionMultiplier}
onChangeText={setContributionMultiplier}
placeholder="Множник внеску"
keyboardType="numeric"
style={styles.input}
/>
</View>

<Button title="Створити новий чат" onPress={handleCreateChat} />

<Modal
animationType="slide"
transparent={true}
visible={modalVisible}
onRequestClose={() => setModalVisible(false)}
>
<View style={styles.modalContainer}>
<View style={styles.modalContent}>
<Text style={styles.modalText}>Значення коефіцієнту внеску (nodeRatio) змінено на: {nodeRatio}</Text>
<TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
<Text style={styles.closeButtonText}>Закрити</Text>
</TouchableOpacity>
</View>
</View>
</Modal>
</ScrollView>
);
};

const styles = StyleSheet.create({
block: {
backgroundColor: '#f2f2f2',
padding: 10,
marginBottom: 20,
borderRadius: 8,
borderWidth: 1,
borderColor: '#cccccc'
},
input: {
borderWidth: 1,
backgroundColor: '#ffffff',
padding: 10,
borderRadius: 6,
fontSize: 16,
borderColor: '#007AFF',
color: '#333333'
},
dropdown: {
borderWidth: 1,
backgroundColor: '#ffffff',
padding: 10,
borderRadius: 6,
borderColor: '#007AFF'
},
selectedStyle: {
marginTop: 10,
borderRadius: 6,
backgroundColor: '#f0f0f0'
},
item: {
flexDirection: 'row',
alignItems: 'center',
padding: 10
},
image: {
width: 40,
height: 40,
marginRight: 10,
borderRadius: 4
},
checkboxContainer: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center'
},
stepperContainer: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'center',
borderWidth: 1,
borderColor: '#007AFF',
borderRadius: 6,
backgroundColor: '#ffffff'
},
stepButton: {
alignItems: 'center',
justifyContent: 'center',
borderWidth: 1,
borderColor: '#007AFF',
borderRadius: 6,
backgroundColor: '#f0f0f0'
},
stepButtonText: {
fontSize: 18,
color: '#007AFF',
fontWeight: '600'
},
valueInput: {
textAlign: 'center',
fontSize: 18,
color: '#333333',
borderRadius: 6,
borderWidth: 1,
borderColor: '#007AFF',
paddingVertical: 5
},
modalContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: 'rgba(0, 0, 0, 0.5)'
},
modalContent: {
width: '80%',
backgroundColor: '#ffffff',
padding: 20,
borderRadius: 8,
alignItems: 'center',
borderWidth: 1,
borderColor: '#007AFF'
},
modalText: {
fontSize: 16,
color: '#333333',
marginBottom: 20
},
closeButton: {
backgroundColor: '#007AFF',
paddingVertical: 10,
paddingHorizontal: 20,
borderRadius: 6
},
closeButtonText: {
fontSize: 16,
color: '#ffffff'
}
});

export default NewGBChat;