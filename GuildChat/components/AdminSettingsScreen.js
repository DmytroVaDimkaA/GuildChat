import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Button, FlatList } from 'react-native';

function ParserPage() {
  const [parsedData, setParsedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('../parser');
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Парсер не найден');
        } else {
          throw new Error('Ошибка сети');
        }
      }
      const data = await response.json();
      setParsedData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      {Object.keys(item).map((key) => (
        <Text key={key} style={styles.itemText}>
          {key}: {item[key]}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <View>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Повторить" onPress={fetchData} />
        </View>
      ) : (
        <FlatList
          data={parsedData}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default ParserPage;



