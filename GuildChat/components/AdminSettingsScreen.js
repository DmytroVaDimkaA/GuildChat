import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';

const AdminSettingsScreen = ({ servers, parseError }) => {
  // ... (остальной код компонента)

  // Проверка наличия данных серверов
  if (!servers) {
    return <Text>Loading servers...</Text>; // или другой индикатор загрузки
  }

  return (
    <View style={styles.container}>
      {/* ... (остальной код компонента) */}

      {/* Отображение данных серверов или ошибки */}
      {servers && (
        <View>
          {Object.keys(servers).map((country) => ( // Перебираем страны
            <View key={country}>
              <Text>{country}</Text>
              {servers[country].map((server) => ( // servers[country] теперь массив
                <Text key={server.server_name}>{server.name} - {server.server_name}</Text>
              ))}
            </View>
          ))}
        </View>
      )}
      {parseError && <Text style={styles.errorText}>{parseError}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0088cc',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#006699',
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#999999',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  buttonWidth: {
    width: '80%', 
  },
});

export default AdminSettingsScreen;

