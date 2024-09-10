import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { ref, get, update } from 'firebase/database';
import { database } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Stepper from '../CustomElements/Stepper';
import FloatingActionButton from '../CustomElements/FloatingActionButton';

// Компонент для відображення бонусу
const BonusView = ({ bonus, build }) => {
  const [parsedBonus, setParsedBonus] = useState('');
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');

  useEffect(() => {
    const replaceBookmarks = async () => {
      if (!bonus || !build) return;

      try {
        if (!build.levelBase || !build.level) {
          console.error('Invalid build data');
          return;
        }

        const jsonFileURLNow = `${build.levelBase}${build.level}`;
        const response = await fetch(jsonFileURLNow);
        if (!response.ok) {
          console.error('Failed to fetch JSON data');
          return;
        }
        const data = await response.json();

        const bookmarkPattern = /{([^{}]+)}/g;

        const updatedBonus = bonus.replace(bookmarkPattern, (match, p1) => {
          const keys = p1.split('/');
          let value = data.response;
          for (const key of keys) {
            value = value[key];
            if (value === undefined) return match;
          }
          return value !== undefined ? `<b><u>${value}:${p1}</u></b>` : match;
        });

        setParsedBonus(updatedBonus);
      } catch (error) {
        console.error('Error fetching or processing JSON:', error);
      }
    };

    replaceBookmarks();
  }, [bonus, build]);

  const normalizedBonus = parsedBonus
    ? parsedBonus
        .replace(/\\n/g, '\n')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim()
    : '';

  const paragraphs = normalizedBonus.split('\n\n').map(paragraph => paragraph.trim());

  const handlePress = async (tooltipText) => {
    const getDetailsViewData = () => {
      const detailsBuild = build;
      return detailsBuild;
    };
  
    const detailsBuild = getDetailsViewData();
    const { levelBase, level } = detailsBuild || {};
  
    if (typeof levelBase === 'string' && typeof level === 'number') {
      const link = `${levelBase}${level + 1}`;
  
      try {
        const response = await fetch(link);
        if (!response.ok) {
          throw new Error('Мережевий запит не вдалося виконати');
        }
        
        const data = await response.json();
  
        if (data.response && typeof data.response === 'object') {
          const keys = tooltipText.split('/');
          
          let value = data.response;
          for (const key of keys) {
            value = value[key];
            if (value === undefined) {
              console.error('Помилка: ключ не знайдено в response');
              setTooltipContent('Помилка: ключ не знайдено в response');
              return;
            }
          }
          
          const tooltipContent = `На наступному рівні:\n${value}`;
          
          setTooltipContent(tooltipContent);
        } else {
          console.error('Помилка: response не є об\'єктом');
          setTooltipContent('Помилка: response не є об\'єктом');
        }
      } catch (error) {
        console.error('Помилка при отриманні даних:', error);
        setTooltipContent('Помилка при отриманні даних');
      }
    } else {
      console.error('Помилка: некоректні дані. levelBase або level мають неправильний тип.');
      setTooltipContent('Помилка: некоректні дані.');
    }
  
    setTooltipVisible(true);
  };

  return (
    <View style={styles.bonusContainer}>
      {paragraphs.length === 0 ? (
        <Text>No bonus information available</Text>
      ) : (
        paragraphs.map((paragraph, index) => (
          <Text key={index} style={styles.buildBonus}>
            {paragraph.split(/(<b><u>.*?<\/u><\/b>)/g).map((part, i) =>
              /<b><u>.*<\/u><\/b>/.test(part) ? (
                <Tooltip
                  key={i}
                  isVisible={tooltipVisible && tooltipContent.includes(part)}
                  content={<Text>{tooltipContent}</Text>}
                  onClose={() => setTooltipVisible(false)}
                >
                  <TouchableOpacity onPress={() => handlePress(part.replace(/<\/?b>|<\/?u>/g, '').split(':')[1])}>
                    <Text style={styles.highlightedText}>{part.replace(/<\/?b>|<\/?u>/g, '').split(':')[0]}</Text>
                  </TouchableOpacity>
                </Tooltip>
              ) : (
                <Text key={i}>{part}</Text>
              )
            )}
          </Text>
        ))
      )}
    </View>
  );
};

// Інші компоненти та стилі залишаються без змін

export default MyGB;
