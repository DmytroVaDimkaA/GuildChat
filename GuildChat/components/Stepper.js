import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ref, set } from 'firebase/database';
import { database } from '../firebaseConfig';

const Stepper = ({ initialValue = 0, step = 1, maxValue = Infinity, buildId, onValueChange }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleIncrement = () => {
    if (value + step <= maxValue) {
      const newValue = value + step;
      setValue(newValue);
      onValueChange(buildId, newValue);
    }
  };

  const handleDecrement = () => {
    if (value - step >= 0) {
      const newValue = value - step;
      setValue(newValue);
      onValueChange(buildId, newValue);
    }
  };

  const handleChangeText = (text) => {
    const newValue = parseInt(text, 10);
    if (!isNaN(newValue) && newValue <= maxValue && newValue >= 0) {
      setValue(newValue);
      onValueChange(buildId, newValue);
    }
  };

  return (
    <View style={styles.stepperContainer}>
      <TouchableOpacity onPress={handleDecrement} style={styles.stepButton}>
        <Text style={styles.stepButtonText}>-</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.valueInput}
        keyboardType="numeric"
        value={String(value)}
        onChangeText={handleChangeText}
      />
      <TouchableOpacity onPress={handleIncrement} style={styles.stepButton}>
        <Text style={styles.stepButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  stepButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  stepButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  valueInput: {
    width: 50,
    height: 20,
    textAlign: 'center',
    backgroundColor: '#fff',
    borderColor: '#007AFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    fontSize: 10,
    color: '#000',
  },
});

export default Stepper;
