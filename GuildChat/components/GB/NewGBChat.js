import React, { useState } from 'react';
import { View, TextInput, Button, Text, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getDatabase, ref, push } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import CustomCheckBox from '../CustomElements/CustomCheckBox3'; 

const NewGBChat = ({ navigation }) => {
  const [chatName, setChatName] = useState('');
  const [nodeComparison, setNodeComparison] = useState('more');
  const [nodeRatio, setNodeRatio] = useState('');
  const [levelThreshold, setLevelThreshold] = useState('');
  const [allowedGBs, setAllowedGBs] = useState([]);
  const [placeLimit, setPlaceLimit] = useState([false, false, false, false, false]);
  const [contributionMultiplier, setContributionMultiplier] = useState('');

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

            <View style={styles.block}>
      
      <Text style={{ marginBottom: 10 }}>Обмеження місць (placeLimit):</Text>
    

      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
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


      <Text style={{ marginBottom: 10 }}>Множник внеску (contributionMultiplier):</Text>
      <TextInput
        value={contributionMultiplier}
        onChangeText={setContributionMultiplier}
        placeholder="contributionMultiplier"
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
      />
qqq
      <Button title="Створити новий чат" onPress={handleCreateChat} />
    </ScrollView>
  );
};


export default NewGBChat;
