import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const ProfileData = () => {
  const [name, setName] = useState('Dmytro');
  const [about, setAbout] = useState('');
  
  return (
    <ScrollView style={styles.container}>
     
      
      <View style={styles.section}>
        <Text style={styles.label}>Ваше ім’я</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Місто</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
      </View>
      
      
      
      <View style={styles.section}>
        <Text style={styles.label}>День народження</Text>
        <TouchableOpacity style={styles.row}>
        <Text style={styles.dr}>Дата народження</Text>   
          <Text style={styles.link}>Вказати</Text>
        </TouchableOpacity>
        
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 15,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#007aff',
    marginBottom: 5,
    fontWeight: 'bold', // Робить текст жирним
  },
  input: {
    fontSize: 16,
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5,
  },
  dr: {
    fontSize: 14,
    color: '#000',
    
    borderBottomColor: '#ddd',
    paddingVertical: 5,
  },
  multiline: {
    minHeight: 60,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
  link: {
    fontSize: 16,
    color: '#007aff',
  },
  info: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});

export default ProfileData;
