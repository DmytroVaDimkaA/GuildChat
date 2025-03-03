import React, { useState, useRef } from 'react';
import { View, Dimensions, StyleSheet, PanResponder } from 'react-native';
import Svg, { Circle, Path, G, Line, Text as SvgText } from 'react-native-svg';
import BedIcon from '../ico/bed.svg';           // Іконка ліжка
import AlarmClockIcon from '../ico/alarm-clock.svg'; // Іконка будильника

const TOTAL_MINUTES = 24 * 60;

/** Перетворює кут у формат HH:MM. 
 * -90° (-Math.PI/2) => 00:00, 360° => 24:00
 */
const formatTimeFromAngle = (angle) => {
  let adjusted = angle + Math.PI / 2;
  if (adjusted < 0) adjusted += 2 * Math.PI;
  const fraction = adjusted / (2 * Math.PI);
  const totalMins = Math.round(fraction * TOTAL_MINUTES);
  const hh = Math.floor(totalMins / 60);
  const mm = totalMins % 60;
  return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
};

const SleepSchedule = () => {
  const { width } = Dimensions.get('window');

  // Основні розміри
  const redDiameter = width;
  const innerDiameter = width - 40;
  const smallDiameter = width - 100;

  // Центр
  const cx = redDiameter / 2;
  const cy = redDiameter / 2;

  // Зовнішній і внутрішній радіус кільця (фон шкали)
  const R1 = innerDiameter / 2;
  const R2 = smallDiameter / 2;

  // Шлях для кільця (донату) з fillRule="evenodd"
  const ringPath = `
    M ${cx} ${cy - R1}
    A ${R1} ${R1} 0 1 1 ${cx} ${cy + R1}
    A ${R1} ${R1} 0 1 1 ${cx} ${cy - R1}
    M ${cx} ${cy - R2}
    A ${R2} ${R2} 0 1 0 ${cx} ${cy + R2}
    A ${R2} ${R2} 0 1 0 ${cx} ${cy - R2}
    Z
  `;

  // Кути ручок
  const [greenStartAngle, setGreenStartAngle] = useState(-Math.PI / 2);
  const [greenEndAngle, setGreenEndAngle] = useState(-Math.PI / 2 + (120 * Math.PI) / 180);

  // Координати ручок
  const fixedDistance = R1 - 15;
  const greenX1 = cx + fixedDistance * Math.cos(greenStartAngle);
  const greenY1 = cy + fixedDistance * Math.sin(greenStartAngle);
  const greenX2 = cx + fixedDistance * Math.cos(greenEndAngle);
  const greenY2 = cy + fixedDistance * Math.sin(greenEndAngle);

  // Синя дуга
  let angleDiff = greenEndAngle - greenStartAngle;
  if (angleDiff < 0) angleDiff += 2 * Math.PI;
  const largeArcFlag = angleDiff > Math.PI ? 1 : 0;

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

  // Активність ручок
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

  // Розмір ручок
  const startDiameter = isGreenStartActive ? 40 : 30;
  const endDiameter = isGreenEndActive ? 40 : 30;
  const startRadiusControl = startDiameter / 2;
  const endRadiusControl = endDiameter / 2;

  // Масштаб іконок
  const ICON_SCALE = 0.7;
  const startIconSize = startDiameter * ICON_SCALE;
  const endIconSize = endDiameter * ICON_SCALE;
  const startIconOffset = startIconSize / 2;
  const endIconOffset = endIconSize / 2;

  // Зміщення іконок
  const ICON_POSITION_SHIFT_X = 0;
  const ICON_POSITION_SHIFT_Y = 0;

  // Відмальовування розмітки (за бажанням можна відключити, якщо не треба)
  const renderMinuteTicks = () => {
    const ticks = [];
    const markRadius = (smallDiameter / 2) - 10;
    const totalTicks = 144;
    for (let i = 0; i < totalTicks; i++) {
      if (i % 6 === 0) continue;
      const angle = (i * 10) * (2 * Math.PI / 1440) - Math.PI / 2;
      const innerTick = markRadius - 3;
      const outerTick = markRadius + 3;
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
    const markRadius = (smallDiameter / 2) - 10;
    for (let hour = 0; hour < 24; hour++) {
      if ([0, 6, 12, 18].includes(hour)) continue;
      const angle = (hour / 24) * 2 * Math.PI - Math.PI / 2;
      const tickLength = 8;
      const innerTick = markRadius - tickLength / 2;
      const outerTick = markRadius + tickLength / 2;
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
    const markRadius = (smallDiameter / 2) - 10;
    const majorHours = [0, 6, 12, 18];
    majorHours.forEach((hour) => {
      const angle = (hour / 24) * 2 * Math.PI - Math.PI / 2;
      const tx = cx + markRadius * Math.cos(angle);
      const ty = cy + markRadius * Math.sin(angle);
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
        {/* Зовнішнє коло (фон) */}
        <Circle cx={cx} cy={cy} r={redDiameter / 2} fill="#f0f0f0" />

        {/* Кільцева дуга (фон шкали) */}
        <Path d={ringPath} fill="#e0e0e0" fillRule="evenodd" />

        {/* Синя дуга (шкали) */}
        <Path d={d} fill="#007AFF" />

        {/* Маленьке коло (фон розмітки) */}
        <Circle cx={cx} cy={cy} r={smallDiameter / 2} fill="#ffffff" />
        {renderMinuteTicks()}
        {renderHourlyTicks()}
        {renderMajorMarks()}

        {/* 
          1) Іконка ліжка + час (greenStartAngle)
        */}
        <G transform={`translate(${cx-50}, ${cy - 30})`}>
          
          
          <G>
            <BedIcon width={24} height={24} fill="#BDBDBD" />
          </G>
          
            <SvgText
            x={30}
            y={23}
            fill="#000"
            fontSize="32"
            fontWeight="bold"
            textAnchor="start"
            
          >
            {formatTimeFromAngle(greenStartAngle)}
          </SvgText>
          
          
        </G>

        {/* 
          2) Іконка будильника + час (greenEndAngle)
        */}
        <G transform={`translate(${cx - 50}, ${cy+5})`}>
          <G>
            <AlarmClockIcon width={24} height={24} fill="#BDBDBD" />
          </G>
          
          <SvgText
            x={30}
            y={23}
            fill="#000"
            fontSize="32"
            fontWeight="bold"
            textAnchor="start"
          >
            {formatTimeFromAngle(greenEndAngle)}
          </SvgText>
        </G>

        {/* Група "start" (ручка з BedIcon) */}
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

        {/* Група "end" (ручка з AlarmClockIcon) */}
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
