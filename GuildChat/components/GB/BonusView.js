import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';

const BonusView = ({ bonus, build }) => {
  const [parsedBonus, setParsedBonus] = useState('');
  const [tooltipVisibleArray, setTooltipVisibleArray] = useState({}); // Стан видимості для кожної закладки
  const [tooltipContentArray, setTooltipContentArray] = useState({}); // Стан змісту підказки для кожної закладки

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

  const handlePress = async (index, tooltipText) => {
    console.log(`handlePress викликано для індексу ${index} з текстом: ${tooltipText}`);

    const getDetailsViewData = () => {
      const detailsBuild = build;
      console.log('Деталі build:', detailsBuild);
      return detailsBuild;
    };

    const detailsBuild = getDetailsViewData();
    const { levelBase, level } = detailsBuild || {};

    console.log('levelBase:', levelBase);
    console.log('level:', level);
    console.log('tooltipText:', tooltipText);

    if (typeof levelBase === 'string' && typeof level === 'number') {
      const link = `${levelBase}${level + 1}`;
      console.log('Сформоване посилання:', link);

      try {
        const response = await fetch(link);
        if (!response.ok) {
          throw new Error('Мережевий запит не вдалося виконати');
        }
        const data = await response.json();
        console.log('Отримані дані:', data);

        if (data.response && typeof data.response === 'object') {
          const keys = tooltipText.split('/');
          let value = data.response;
          for (const key of keys) {
            value = value[key];
            if (value === undefined) {
              console.error('Помилка: ключ не знайдено в response');
              setTooltipContentArray(prevState => ({
                ...prevState,
                [index]: 'Помилка: ключ не знайдено в response'
              }));
              return;
            }
          }
          console.log('Отримане значення:', value);
          const tooltipContent = `На наступному рівні:\n${value}`;
          console.log(`Підказка для індексу ${index}:`, tooltipContent);

          setTooltipContentArray(prevState => ({
            ...prevState,
            [index]: tooltipContent
          }));
        } else {
          console.error('Помилка: response не є об\'єктом');
          setTooltipContentArray(prevState => ({
            ...prevState,
            [index]: 'Помилка: response не є об\'єктом'
          }));
        }
      } catch (error) {
        console.error('Помилка при отриманні даних:', error);
        setTooltipContentArray(prevState => ({
          ...prevState,
          [index]: 'Помилка при отриманні даних'
        }));
      }
    } else {
      console.error('Помилка: некоректні дані. levelBase або level мають неправильний тип.');
      setTooltipContentArray(prevState => ({
        ...prevState,
        [index]: 'Помилка: некоректні дані.'
      }));
    }

    // Оновлюємо стан видимості для підказки з конкретним індексом
    setTooltipVisibleArray(prevState => ({
      ...prevState,
      [index]: true // Відкриваємо конкретну підказку
    }));
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
                  isVisible={tooltipVisibleArray[index]} // Використовуємо об'єкт для видимості підказок
                  content={
                    <View style={styles.tooltipContainer}>
                      <Text style={styles.tooltipText}>{tooltipContentArray[index]}</Text>
                      <TouchableOpacity onPress={() => {
                        setTooltipVisibleArray(prevState => ({
                          ...prevState,
                          [index]: false // Закриваємо конкретну підказку
                        }));
                      }}>
                        <Text style={styles.closeButton}>Закрити</Text>
                      </TouchableOpacity>
                    </View>
                  }
                  placement="top"
                  onClose={() => {
                    setTooltipVisibleArray(prevState => ({
                      ...prevState,
                      [index]: false
                    }));
                  }}
                >
                  <TouchableOpacity
                    key={i}
                    onPress={() => handlePress(index, part.replace(/<\/?b>|<\/?u>/g, '').split(':')[1])}
                  >
                    <Text style={styles.highlightedText}>
                      {part.replace(/<\/?b>|<\/?u>/g, '').split(':')[0]}
                    </Text>
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

const styles = StyleSheet.create({
  bonusContainer: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
    backgroundColor: '#ffffff',
  },
  buildBonus: {
    fontSize: 16,
    color: '#333',
  },
  highlightedText: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  tooltipContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    alignItems: 'center',
  },
  tooltipText: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    fontSize: 14,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});

export default BonusView;
