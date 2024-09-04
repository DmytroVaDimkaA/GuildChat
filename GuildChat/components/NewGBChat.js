import React, { useState } from 'react';
import { View, TextInput, Button, Text, Picker, ScrollView } from 'react-native';
import { getDatabase, ref, push, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const NewGBChat = ({ navigation }) => {
const [chatName, setChatName] = useState('');
const [nodeComparison, setNodeComparison] = useState('more');
const [nodeRatio, setNodeRatio] = useState('');
const [levelThreshold, setLevelThreshold] = useState('');
const [allowedGBs, setAllowedGBs] = useState([]);
const [placeLimit, setPlaceLimit] = useState([1, 2, 3]);
const [contributionMultiplier, setContributionMultiplier] = useState('');

const handleCreateChat = async () => {
const db = getDatabase();
const auth = getAuth();
const user = auth.currentUser;

if (user) {
const chatRef = ref(db, 'chats');
const newChatRef = push(chatRef);

const newChat = {
chatName,
rules: {
nodeComparison,
nodeRatio: parseFloat(nodeRatio),
levelThreshold: parseInt(levelThreshold),
allowedGBs,
placeLimit,
contributionMultiplier: parseFloat(contributionMultiplier)
},
createdBy: user.uid
};

try {
await set(newChatRef, newChat);
console.log('Новий чат створено:', newChat);
navigation.goBack(); // Повертаємося на попередній екран після створення чату
} catch (error) {
console.error('Помилка створення чату:', error);
}
} else {
console.log('Користувач не авторизований');
}
};

return (
<ScrollView contentContainerStyle={{ padding: 20, marginTop: 30 }}>
<Text style={{ marginBottom: 10 }}>Назва чату (chatName):</Text>
<TextInput
value={chatName}
onChangeText={setChatName}
placeholder="chatName"
style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
/>

<Text style={{ marginBottom: 10 }}>Умова внеску (nodeComparison):</Text>
<Picker
selectedValue={nodeComparison}
onValueChange={(itemValue) => setNodeComparison(itemValue)}
style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
>
<Picker.Item label="Більше або дорівнює" value="more" />
<Picker.Item label="Менше або дорівнює" value="less" />
</Picker>

<Text style={{ marginBottom: 10 }}>Коефіцієнт внеску (nodeRatio):</Text>
<TextInput
value={nodeRatio}
onChangeText={setNodeRatio}
placeholder="nodeRatio"
keyboardType="numeric"
style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
/>

<Text style={{ marginBottom: 10 }}>Мінімальний рівень ВС (levelThreshold):</Text>
<TextInput
value={levelThreshold}
onChangeText={setLevelThreshold}
placeholder="levelThreshold"
keyboardType="numeric"
style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
/>

<Text style={{ marginBottom: 10 }}>Дозволені ВС (allowedGBs):</Text>
<TextInput
value={allowedGBs.join(', ')}
onChangeText={(text) => setAllowedGBs(text.split(', '))}
placeholder="allowedGBs"
style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
/>

<Text style={{ marginBottom: 10 }}>Обмеження місць (placeLimit):</Text>
<TextInput
value={placeLimit.join(', ')}
onChangeText={(text) => setPlaceLimit(text.split(', ').map(Number))}
placeholder="placeLimit"
style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
/>

<Text style={{ marginBottom: 10 }}>Множник внеску (contributionMultiplier):</Text>
<TextInput
value={contributionMultiplier}
onChangeText={setContributionMultiplier}
placeholder="contributionMultiplier"
keyboardType="numeric"
style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
/>

<Button title="Створити новий чат" onPress={handleCreateChat} />
</ScrollView>
);
};

export default NewGBChat;