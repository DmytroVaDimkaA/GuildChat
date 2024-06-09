import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, FlatList, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import cheerio from 'cheerio';

// Компонент App
export default function App() {
  const [servers, setServers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedServers = await parseData();
      setServers(fetchedServers);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image source={{ uri: item.flagUrl }} style={styles.flag} />
      <Text style={styles.serverName}>{item.name} ({item.server_name})</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <View>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Повторить" onPress={fetchData} />
        </View>
      ) : (
        <FlatList
          data={servers}
          renderItem={renderItem}
          keyExtractor={(item) => item.server_name}
        />
      )}
    </View>
  );
}

// Функция парсинга
async function parseData() {
  try {
    const response = await axios.get('https://foe.scoredb.io/Worlds');

    if (!response.ok) {
      throw new Error(`Ошибка сети: ${response.status}`);
    }

    const $ = cheerio.load(response.data);
    const servers = [];

    $('.nav-item.dropdown:has(a:contains("Servers")) .dropdown-menu .dropdown').each((i, countryDropdown) => {
      const countryItem = $(countryDropdown).find('.dropdown-item:first-child');
      const countryName = countryItem.text().trim().replace(/[^a-zA-Z ]/g, '');
      const flagUrl = 'https://foe.scoredb.io' + countryItem.find('img').attr('src');

      $(countryDropdown).find('.dropdown-menu .dropdown-item').each((j, serverItem) => {
        if ($(serverItem).find('img').length === 0) {
          const serverName = $(serverItem).text().trim();
          const serverUrl = $(serverItem).attr('href');

          servers.push({
            country: countryName,
            name: serverName,
            server_name: serverUrl.replace('https://foe.scoredb.io/', ''),
            flagUrl: flagUrl,
          });
        }
      });
    });

    return servers;
  } catch (error) {
    console.error('Ошибка при парсинге:', error);
    throw error; 
  }
}

// Стили
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  item: {
    flexDirection: 'row', // Располагаем флаг и название в ряд
    alignItems: 'center', // Выравниваем по вертикали
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  flag: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  serverName: {
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
