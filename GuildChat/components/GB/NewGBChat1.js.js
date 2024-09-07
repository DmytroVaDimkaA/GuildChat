import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet, Image,  TouchableOpacity } from 'react-native';
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
const comparisonOptions = [
{ label: 'Менше', value: 'less' },
{ label: 'Рівно', value: 'equals' },
{ label: 'Не менше', value: 'more' },
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
image: data[key].buildingImage,
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
contributionMultiplier: parseFloat(contributionMultiplier),
},
createdBy: user ? user.uid : null,
createdAt: new Date().toISOString(),
};

await push(ref(db, 'chats'), newChat);
navigation.goBack();
} catch (error) {
console.error('Помилка при створенні чату:', error);
}
};

// Компонент Stepper
const Stepper = ({ value, onValueChange, buttonSize = 20, minValue = 0, maxValue = 200 }) => {
  const inputWidth = stepperWidth - buttonSize * 2;
  const [inputValue, setInputValue] = useState(String(value)); // Відстежуємо локально введене значення

  const handleIncrement = () => {
    const newValue = Math.min(value + 1, maxValue); // Обмежити максимальне значення
    onValueChange(newValue);
    setInputValue(String(newValue)); // Оновлюємо локальне значення
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - 1, minValue); // Обмежити мінімальне значення
    onValueChange(newValue);
    setInputValue(String(newValue)); // Оновлюємо локальне значення
  };

  const handleInputChange = (text) => {
    // Дозволяємо вводити тільки числа
    if (/^\d*$/.test(text)) { // Перевірка, щоб користувач не міг ввести нечислові значення
      setInputValue(text); // Оновлюємо локальне значення без негайної зміни основного
    }
  };

  const handleEndEditing = () => {
    // Коригуємо значення після завершення введення
    let newValue = parseInt(inputValue, 10);

    if (isNaN(newValue)) {
      newValue = minValue; // Якщо користувач не ввів нічого, встановлюємо мінімальне значення
    } else if (newValue > maxValue) {
      newValue = maxValue; // Корекція якщо значення більше за maxValue
    } else if (newValue < minValue) {
      newValue = minValue; // Корекція якщо значення менше за minValue
    }

    onValueChange(newValue); // Встановлюємо нове значення
    setInputValue(String(newValue)); // Оновлюємо локальне значення
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
        value={inputValue} // Використовуємо локальне значення
        onChangeText={handleInputChange} // Відстежуємо введення
        onEndEditing={handleEndEditing} // Перевіряємо значення після завершення введення
        maxLength={String(maxValue).length} // Обмеження за кількістю символів
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
<TextInput
value={nodeRatio}
onChangeText={setNodeRatio}
placeholder="Коефіцієнт внеску"
keyboardType="numeric"
style={styles.input}
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
parentBackgroundColor={styles.block.backgroundColor}
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
borderColor: '#cccccc',
},
input: {
borderWidth: 1,
backgroundColor: '#ffffff',
padding: 10,
borderRadius: 6,
fontSize: 16,
borderColor: '#007AFF',
color: '#333333',
},
dropdown: {
borderWidth: 1,
backgroundColor: '#ffffff',
padding: 10,
borderRadius: 6,
borderColor: '#007AFF',
},
checkboxContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
stepperContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#007AFF',
  borderRadius: 4,
  overflow: 'hidden',
},
stepButton: {
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#007AFF',
},
stepButtonText: {
  color: '#fff',
  fontSize: 12,
},
valueInput: {
  textAlign: 'center',
  backgroundColor: '#fff',
  borderColor: '#007AFF',
  borderLeftWidth: 1,
  borderRightWidth: 1,
  fontSize: 16,
  color: '#000',
},

selectedStyle: {
marginTop: 10,
borderRadius: 6,
backgroundColor: '#f0f0f0',
},
item: {
flexDirection: 'row',
alignItems: 'center',
padding: 10,
},
image: {
width: 40,
height: 40,
marginRight: 10,
borderRadius: 4,
},

  
  
  
  

});

export default NewGBChat;
