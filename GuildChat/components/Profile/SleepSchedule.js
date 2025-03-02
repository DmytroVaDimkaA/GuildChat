import React, { useState, useRef } from 'react';
import { View, Dimensions, StyleSheet, PanResponder } from 'react-native';
import Svg, { Circle, Path, G, Line, Text as SvgText } from 'react-native-svg';
import BedIcon from '../ico/bed.svg';           // Іконка ліжка (біла)
import AlarmClockIcon from '../ico/alarm-clock.svg'; // Іконка будильника (біла)

const TOTAL_MINUTES = 24 * 60;

const formatTimeFromAngle = (angle) => {
  // Припускаємо, що -90° (-Math.PI/2) відповідає 00:00
  let adjusted = angle + Math.PI / 2;
  if (adjusted < 0) adjusted += 2 * Math.PI;
  const fraction = adjusted / (2 * Math.PI);
  const totalMins = Math.round(fraction * TOTAL_MINUTES);
  const hours = Math.floor(totalMins / 60);
  const minutes = totalMins % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const SleepSchedule = () => {
  const { width } = Dimensions.get('window');
  
  // Основні розміри:
  const redDiameter = width;            // Зовнішнє червоне коло – діаметр = ширині екрану
  const innerDiameter = width - 40;     // Фон для шкали – зовнішній діаметр кільця
  const smallDiameter = width - 100;    // Фон для розмітки – внутрішній діаметр кільця

  // Центр усіх кіл:
  const cx = redDiameter / 2;
  const cy = redDiameter / 2;
  
  // Для побудови кільця (донату) шкали:
  // Зовнішній радіус дуги = innerDiameter/2, внутрішній = smallDiameter/2
  const R1 = innerDiameter / 2;
  const R2 = smallDiameter / 2;
  
  // Створюємо шлях для фонового кільця (донату) за допомогою fillRule="evenodd"
  const ringPath = `
    M ${cx} ${cy - R1}
    A ${R1} ${R1} 0 1 1 ${cx} ${cy + R1}
    A ${R1} ${R1} 0 1 1 ${cx} ${cy - R1}
    M ${cx} ${cy - R2}
    A ${R2} ${R2} 0 1 0 ${cx} ${cy + R2}
    A ${R2} ${R2} 0 1 0 ${cx} ${cy - R2}
    Z
  `;
  
  // Логіка зелених ручок (для зміни кута дуги)
  const [greenStartAngle, setGreenStartAngle] = useState(-Math.PI / 2); // -90°
  const [greenEndAngle, setGreenEndAngle] = useState(-Math.PI / 2 + (120 * Math.PI) / 180); // -90°+120° = 30°

  // Фіксована відстань для ручок: вони рухаються по колу з радіусом = R1 - 15
  const fixedDistance = R1 - 15;
  const greenX1 = cx + fixedDistance * Math.cos(greenStartAngle);
  const greenY1 = cy + fixedDistance * Math.sin(greenStartAngle);
  const greenX2 = cx + fixedDistance * Math.cos(greenEndAngle);
  const greenY2 = cy + fixedDistance * Math.sin(greenEndAngle);

  let angleDiff = greenEndAngle - greenStartAngle;
  if (angleDiff < 0) angleDiff += 2 * Math.PI;
  const largeArcFlag = angleDiff > Math.PI ? 1 : 0;
  
  // Побудова "кільцевої дуги" (синій сектор) між зовнішнім радіусом R1 та внутрішнім R2
  const outerStartX = cx + R1 * Math.cos(greenStartAngle);
  const outerStartY = cy + R1 * Math.sin(greenStartAngle);
  const outerEndX   = cx + R1 * Math.cos(greenEndAngle);
  const outerEndY   = cy + R1 * Math.sin(greenEndAngle);
  const innerEndX   = cx + R2 * Math.cos(greenEndAngle);
  const innerEndY   = cy + R2 * Math.sin(greenEndAngle);
  const innerStartX = cx + R2 * Math.cos(greenStartAngle);
  const innerStartY = cy + R2 * Math.sin(greenStartAngle);
  
  const d = `
    M ${outerStartX} ${outerStartY}
    A ${R1} ${R1} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}
    L ${innerEndX} ${innerEndY}
    A ${R2} ${R2} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}
    Z
  `;
  
  // Стан активності ручок (збільшується діаметр з 30 до 40)
  const [isGreenStartActive, setIsGreenStartActive] = useState(false);
  const [isGreenEndActive, setIsGreenEndActive] = useState(false);
  
  const greenStartPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { setIsGreenStartActive(true); },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newAngle = Math.atan2(locationY - cy, locationX - cx);
        setGreenStartAngle(newAngle);
      },
      onPanResponderRelease: () => { setIsGreenStartActive(false); },
      onPanResponderTerminate: () => { setIsGreenStartActive(false); },
    })
  ).current;
  
  const greenEndPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { setIsGreenEndActive(true); },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newAngle = Math.atan2(locationY - cy, locationX - cx);
        setGreenEndAngle(newAngle);
      },
      onPanResponderRelease: () => { setIsGreenEndActive(false); },
      onPanResponderTerminate: () => { setIsGreenEndActive(false); },
    })
  ).current;
  
  // Розмір ручок (базовий = 30, активний = 40)
  const startDiameter = isGreenStartActive ? 40 : 30;
  const endDiameter = isGreenEndActive ? 40 : 30;
  const startRadiusControl = startDiameter / 2;
  const endRadiusControl = endDiameter / 2;
  
  // Масштаб іконок (наприклад, 70% від діаметра ручки)
  const ICON_SCALE = 0.7;
  const startIconSize = startDiameter * ICON_SCALE;
  const endIconSize = endDiameter * ICON_SCALE;
  const startIconOffset = startIconSize / 2;
  const endIconOffset = endIconSize / 2;
  
  // Константи для додаткового зміщення іконок (вліво та вгору)
  const ICON_POSITION_SHIFT_X = 0;
  const ICON_POSITION_SHIFT_Y = 0;
  
  // Функції для розмітки всередині маленького кола (фон розмітки)
  const renderMinuteTicks = () => {
    const ticks = [];
    const markRadiusForTicks = (smallDiameter / 2) - 10;
    const totalTicks = 144;
    for (let i = 0; i < totalTicks; i++) {
      if (i % 6 === 0) continue;
      const angle = (i * 10 / TOTAL_MINUTES) * 2 * Math.PI - Math.PI / 2;
      const innerTick = markRadiusForTicks - 3;
      const outerTick = markRadiusForTicks + 3;
      const tx1 = cx + innerTick * Math.cos(angle);
      const ty1 = cy + innerTick * Math.sin(angle);
      const tx2 = cx + outerTick * Math.cos(angle);
      const ty2 = cy + outerTick * Math.sin(angle);
      ticks.push(
        <Line key={`min-tick-${i}`} x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#ccc" strokeWidth={1} />
      );
    }
    return ticks;
  };
  
  const renderHourlyTicks = () => {
    const ticks = [];
    const markRadiusForTicks = (smallDiameter / 2) - 10;
    for (let hour = 0; hour < 24; hour++) {
      if ([0, 6, 12, 18].includes(hour)) continue;
      const angle = (hour / 24) * 2 * Math.PI - Math.PI / 2;
      const tickLength = 8;
      const innerTick = markRadiusForTicks - tickLength / 2;
      const outerTick = markRadiusForTicks + tickLength / 2;
      const tx1 = cx + innerTick * Math.cos(angle);
      const ty1 = cy + innerTick * Math.sin(angle);
      const tx2 = cx + outerTick * Math.cos(angle);
      const ty2 = cy + outerTick * Math.sin(angle);
      ticks.push(
        <Line key={`hour-tick-${hour}`} x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#666" strokeWidth={2} />
      );
    }
    return ticks;
  };
  
  const renderMajorMarks = () => {
    const marks = [];
    const markRadiusForTicks = (smallDiameter / 2) - 10;
    const majorHours = [0, 6, 12, 18];
    majorHours.forEach((hour) => {
      const angle = (hour / 24) * 2 * Math.PI - Math.PI / 2;
      const tx = cx + markRadiusForTicks * Math.cos(angle);
      const ty = cy + markRadiusForTicks * Math.sin(angle);
      marks.push(
        <SvgText
          key={`major-${hour}`}
          x={tx}
          y={ty}
          fill="#444"
          fontSize={14}
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {hour}
        </SvgText>
      );
    });
    return marks;
  };

  return (
    <View style={styles.container}>
      <Svg width={redDiameter} height={redDiameter}>
        {/* Зовнішнє червоне коло (фон) */}
        <Circle cx={cx} cy={cy} r={redDiameter / 2} fill="#f0f0f0" />
        {/* Кільцева дуга (фон для шкали) */}
        <Path d={ringPath} fill="#e0e0e0" fillRule="evenodd" />
        {/* Синій сектор (шкали) */}
        <Path d={d} fill="#007AFF" />
        {/* Маленьке коло (фон розмітки) */}
        <Circle cx={cx} cy={cy} r={smallDiameter / 2} fill="#ffffff" />
        {renderMinuteTicks()}
        {renderHourlyTicks()}
        {renderMajorMarks()}

        {/* Текстові поля в центрі кільця */}
        <SvgText
          x={cx}
          y={cy - 10}
          fill="#444"
          fontSize="18"
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {formatTimeFromAngle(greenStartAngle)}
        </SvgText>
        <SvgText
          x={cx}
          y={cy + 20}
          fill="#444"
          fontSize="18"
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {formatTimeFromAngle(greenEndAngle)}
        </SvgText>

        {/* Група "start" (жовта ручка з BedIcon) */}
        <G transform={`translate(${greenX1}, ${greenY1})`} {...greenStartPanResponder.panHandlers}>
          <Circle cx={0} cy={0} r={startRadiusControl} fill="#007AFF" />
          <G transform={`translate(${ICON_POSITION_SHIFT_X - startIconOffset}, ${ICON_POSITION_SHIFT_Y - startIconOffset})`}>
            <BedIcon
              width={startIconSize}
              height={startIconSize}
              fill="#fff"
            />
          </G>
        </G>

        {/* Група "end" (зелена ручка з AlarmClockIcon) */}
        <G transform={`translate(${greenX2}, ${greenY2})`} {...greenEndPanResponder.panHandlers}>
          <Circle cx={0} cy={0} r={endRadiusControl} fill="#007AFF" />
          <G transform={`translate(${ICON_POSITION_SHIFT_X - endIconOffset}, ${ICON_POSITION_SHIFT_Y - endIconOffset})`}>
            <AlarmClockIcon
              width={endIconSize}
              height={endIconSize}
              fill="#fff"
            />
          </G>
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});

export default SleepSchedule;
