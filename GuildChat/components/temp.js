import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ParserOutput from './ParserOutput';
import { parseData } from '../parser';

const TempScreen = () => {
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await parseData();
        setParsedData(data);
      } catch (error) {
        console.error('Ошибка при парсинге:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Список серверов Forge of Empires</Text>
      {parsedData ? (
        <ParserOutput data={parsedData} />
      ) : (
        <Text>Загрузка данных...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
  });

export default TempScreen;