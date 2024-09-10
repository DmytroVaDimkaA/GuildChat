import React, { useState, useEffect } from 'react';
import { ScrollView, Dimensions, TouchableWithoutFeedback } from 'react-native';
import Svg, { Line, Image as SvgImage } from 'react-native-svg';

const nodeImageUri = 'https://tools-files.innogamescdn.com/support-knowledgebase/article/2849/fb7df71eeaa2d0aaddb9e2b968a53e18';
const LINE_LENGTH = 200; // Довжина лінії в пікселях
const NODE_SIZE = 50; // Розмір вузла
const PADDING = 50; // Відступ для збільшення розміру

const MapComponent = () => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const [nodes, setNodes] = useState([]); // Масив вузлів
  const [roads, setRoads] = useState([]); // Лінії, які з'єднують вузли
  const [startNode, setStartNode] = useState(null); // Початковий вузол

  // Встановлюємо стартовий вузол в центрі екрану при першому завантаженні компонента
  useEffect(() => {
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    setNodes([{ x: centerX, y: centerY }]); // Встановлюємо стартовий вузол у центр
  }, [screenWidth, screenHeight]);

  // Функція для перевірки, чи тап відбувся всередині будь-якого вузла
  const isTapOnNode = (x, y) => {
    return nodes.some(node =>
      x >= node.x - NODE_SIZE / 2 &&
      x <= node.x + NODE_SIZE / 2 &&
      y >= node.y - NODE_SIZE / 2 &&
      y <= node.y + NODE_SIZE / 2
    );
  };

  const handlePress = (event) => {
    const { locationX, locationY } = event.nativeEvent;

    if (startNode === null) {
      // Перевіряємо, чи тап відбувся на вузлі
      if (isTapOnNode(locationX, locationY)) {
        // Встановлюємо стартову точку
        setStartNode({ x: locationX, y: locationY });
        console.log('Стартовий вузол обраний:', { x: locationX, y: locationY });
      }
    } else {
      // Визначаємо кінцеву точку на відстані 200px у напрямку тапу
      const endNode = calculateEndPoint(startNode, { x: locationX, y: locationY });
      
      // Додаємо новий вузол
      setNodes([...nodes, endNode]);
      // Додаємо лінію, що з'єднує вузли
      setRoads([...roads, { start: startNode, end: endNode }]);
      
      // Скидаємо стартовий вузол
      console.log('Кінцевий вузол обчислений:', endNode);
      setStartNode(null);
    }
  };

  // Обчислення кінцевої точки на відстані 200px
  const calculateEndPoint = (start, target) => {
    const deltaX = target.x - start.x;
    const deltaY = target.y - start.y;
    const angleInDegrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    console.log('Координати цілі:', target);
    console.log('Зміщення по X:', deltaX, 'Зміщення по Y:', deltaY);
    console.log('Обчислений кут (градуси):', angleInDegrees);

    const directions = {
      45: { x: LINE_LENGTH, y: -LINE_LENGTH },   // Вгору-вправо (45°)
      135: { x: -LINE_LENGTH, y: -LINE_LENGTH }, // Вгору-вліво (135°)
      225: { x: -LINE_LENGTH, y: LINE_LENGTH },  // Вниз-вліво (225°)
      315: { x: LINE_LENGTH, y: LINE_LENGTH },   // Вниз-вправо (315°)
    };
    

    let closestDirection = null;
    let smallestDifference = Infinity;

    Object.keys(directions).forEach((key) => {
      const angleDifference = Math.abs(angleInDegrees - key);
      console.log(`Різниця кутів для напрямку ${key}:`, angleDifference);
      if (angleDifference < smallestDifference) {
        smallestDifference = angleDifference;
        closestDirection = key;
      }
    });

    const chosenDirection = directions[closestDirection];
    console.log('Обраний напрямок:', closestDirection);

    const endX = start.x + chosenDirection.x;
    const endY = start.y + chosenDirection.y;
    console.log('Нові координати:', { x: endX, y: endY });

    return { x: endX, y: endY };
  };

  // Визначення розміру контейнера для скролінгу
  const maxX = Math.max(...nodes.map(node => node.x)) + PADDING;
  const maxY = Math.max(...nodes.map(node => node.y)) + PADDING;

  return (
    <ScrollView
      horizontal={true} // Додаємо горизонтальний скролінг
    >
      <ScrollView
        contentContainerStyle={{
          width: Math.max(screenWidth, maxX),
          height: Math.max(screenHeight, maxY),
        }}
      >
        <TouchableWithoutFeedback onPress={handlePress}>
          <Svg height={Math.max(screenHeight, maxY)} width={Math.max(screenWidth, maxX)} style={{ backgroundColor: 'white' }}>
            {roads.map((road, index) => (
              <Line
                key={index}
                x1={road.start.x}
                y1={road.start.y}
                x2={road.end.x}
                y2={road.end.y}
                stroke="black"
                strokeWidth="2"
              />
            ))}
            {nodes.map((node, index) => (
              <SvgImage
                key={index}
                x={node.x - NODE_SIZE / 2}
                y={node.y - NODE_SIZE / 2}
                width={NODE_SIZE}
                height={NODE_SIZE}
                href={{ uri: nodeImageUri }}
              />
            ))}
          </Svg>
        </TouchableWithoutFeedback>
      </ScrollView>
    </ScrollView>
  );
};

export default MapComponent;

