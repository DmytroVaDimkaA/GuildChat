import React, { useState } from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
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
  const [stepperWidth, setStepperWidth] = useState(200); // Встановлюємо ширину за замовчуванням

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

  // Внутрішній компонент Stepper
  const Stepper = ({ value, onValueChange, buttonSize = 20 }) => {
    const inputWidth = stepperWidth - buttonSize * 2;

    const handleIncrement = () => {
      onValueChange(value + 1);
    };

    const handleDecrement = () => {
      onValueChange(value - 1);
    };

    return (
      <View style={styles.stepperContainer} onLayout={(event) => {
        // Отримання ширини після рендерингу
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
          value={String(value)}
          onChangeText={(text) => onValueChange(parseInt(text, 10) || 0)}
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
        <Picker
            selectedValue={nodeComparison}
            onValueChange={(itemValue) => setNodeComparison(itemValue)}
            style={[styles.input, styles.picker]}
        >
          {/* Додайте Picker.Item тут */}
        </Picker>
      </View>

      <View style={styles.block}>
        <Text style={{ marginBottom: 10 }}>Коефіцієнт внеску (nodeRatio):</Text>
        <TextInput
            value={nodeRatio}
            onChangeText={setNodeRatio}
            placeholder="nodeRatio"
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
        <Text style={{ marginBottom: 10 }}>Дозволені ВС (allowedGBs):</Text>
        <TextInput
          value={allowedGBs.join(', ')}
          onChangeText={(text) => setAllowedGBs(text.split(', '))}
          placeholder="allowedGBs"
          style={styles.input}
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
          placeholder="contributionMultiplier"
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
borderColor: `#cccccc`,
  },
  input: {
    borderWidth: 1,
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 6,
    fontSize: 16,
    borderColor: `#007AFF`,
    color: '#333333',
  },
  picker: {
    height: 50,
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
});

export default NewGBChat;
