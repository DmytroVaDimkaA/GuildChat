import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, ScrollView, BackHandler, Dimensions, TouchableOpacity, Image } from 'react-native';
import SvgUri from 'react-native-svg-uri';

const Separator = () => <View style={styles.separator} />;

const menuOptions = [
    { text: 'Прокачка Величних Споруд', icon: require('./ico/GB.svg') },
    { text: 'Поле битви гільдій', icon: require('./ico/GVG.svg'), keyDate: new Date(2024, 2, 14) }, // 14 марта 2024
    { text: 'Квантові вторгнення', icon: require('./ico/quant.svg'), keyDate: new Date(2024, 2, 21) }, // 21 марта 2024
    { text: 'Сервіси', icon: require('./ico/servise.svg') },
    { text: 'Альтанка', icon: require('./ico/Chat.svg') },
    { text: 'Абетка', icon: require('./ico/azbook.svg') },
    { text: 'Налаштування', icon: require('./ico/profile.svg') },
    { text: 'Адміністративна панель', icon: require('./ico/admin.svg') },
];

const Menu = ({ menuOpen, toggleMenu, setSelectedTitle }) => {
    const [menuTranslateX] = useState(new Animated.Value(-300));
    const [contentOpacity] = useState(new Animated.Value(1));
    const [overlayOpacity] = useState(new Animated.Value(0));
    const [panResponderInstance, setPanResponderInstance] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        const newPanResponderInstance = PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 5,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dx < 0 && !menuOpen) {
                    menuTranslateX.setValue(Math.min(gestureState.dx, 0));
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx < -150) {
                    toggleMenu();
                } else {
                    Animated.spring(menuTranslateX, {
                        toValue: menuOpen ? 0 : -300,
                        useNativeDriver: true,
                    }).start();
                }
            },
        });
        setPanResponderInstance(newPanResponderInstance);

        const handleBackPress = () => {
            if (menuOpen) {
                toggleMenu();
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        Animated.parallel([
            Animated.spring(menuTranslateX, { toValue: menuOpen ? 0 : -300, useNativeDriver: true }),
            Animated.timing(contentOpacity, { toValue: menuOpen ? 0.95 : 1, useNativeDriver: true, duration: 200 }),
            Animated.timing(overlayOpacity, { toValue: menuOpen ? 0.5 : 0, useNativeDriver: true, duration: 200 }),
        ]).start();

        return () => {
            backHandler.remove();
        };
    }, [menuOpen, toggleMenu, menuTranslateX, contentOpacity, overlayOpacity]);

    const handleOptionPress = (index) => {
        setSelectedOption(index);
        setSelectedTitle(menuOptions[index].text);
        toggleMenu();
    };

    useEffect(() => {
        if (menuOpen) {
            setSelectedOption(null);
        }
    }, [menuOpen]);

    function getWeekNumber(date, keyDate = null) {
        const firstDayOfYear = keyDate ? new Date(keyDate.getFullYear(), 0, 1) : new Date(date.getFullYear(), 0, 1);
        const daysSinceFirstDay = Math.floor((date - firstDayOfYear) / 86400000);

        const firstMonday = new Date(firstDayOfYear);
        while (firstMonday.getDay() !== 1) {
            firstMonday.setDate(firstMonday.getDate() + 1);
        }

        const daysSinceFirstMonday = Math.floor((date - firstMonday) / 86400000);
        const weekNumber = Math.ceil((daysSinceFirstMonday + 1) / 7);

        if (firstDayOfYear.getDay() === 1) {
            return weekNumber;
        } else {
            return weekNumber + 1;
        }
    }

    function isOptionVisible(option, currentDate) {
        if (!option.keyDate) return true; // Если keyDate не указана, пункт всегда видим

        const keyDateWeek = getWeekNumber(option.keyDate, option.keyDate);
        const currentWeek = getWeekNumber(currentDate, option.keyDate);

        const weekDifference = currentWeek - keyDateWeek;

        if (0 <= weekDifference <= 1) { // Нулевая или первая неделя
            const currentDay = currentDate.getDay();
            const currentHour = currentDate.getHours();

            if (keyDateWeek % 2 === 1) { // Четная неделя
                return true;
            } else { // Нечетная неделя
                return (currentDay === 1 && currentHour < 8) || // Понедельник до 8:00
                       (currentDay === 4 && currentHour >= 8) || // Четверг после 8:00
                       (currentDay === 5 || currentDay === 6 || currentDay === 0 );     // Пятница - воскресенье
            }
        }

        return false; // В остальных случаях не видно
    }

    return (
        <>
            <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} pointerEvents={menuOpen ? 'auto' : 'none'} onStartShouldSetResponder={() => toggleMenu()} />
            <Animated.View
                style={[styles.container, { transform: [{ translateX: menuTranslateX }], opacity: contentOpacity }]}
                {...(panResponderInstance && panResponderInstance.panHandlers)}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View style={styles.profileIcon}>
                            <Image
                                source={{ uri: 'https://foe.scoredb.io/img/games/foe/avatars/addon_portrait_id_cop_egyptians_maatkare.jpg' }}
                                style={styles.profileIcon}
                            />
                        </View>
                        <View style={styles.profileDetails}>
                            <Text style={styles.profileName}>ВаДімкаА</Text>
                            <Text style={styles.profilePhone}>Лагендорн</Text>
                        </View>
                    </View>

                    <ScrollView style={styles.optionsContainer}>
                        {menuOptions.map((option, index) => (
                            isOptionVisible(option, new Date()) && ( // Проверка видимости
                                <React.Fragment key={index}>
                                    <TouchableOpacity
                                        onPress={() => handleOptionPress(index)}
                                        style={[styles.option, selectedOption === index && styles.selectedOption]}
                                    >
                                        <View style={styles.optionContentRow}>
                                            {option.icon && (
                                                <SvgUri width="24" height="24" source={option.icon} fill="#8C9093" />
                                            )}
                                            <Text style={styles.optionText}>{option.text}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    {index === 5 && <Separator />}
                                </React.Fragment>
                            )
                        ))}
                    </ScrollView>
                </View>
            </Animated.View>
        </>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#517da2',
        paddingTop: 20,
        width: 300,
        zIndex: 10,
    },
    header: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingLeft: 20,
        marginVertical: 20,
    },
    profileIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        //marginTop: 20,
        marginRight: 20,
        overflow: 'hidden',
    },
    profileDetails: {
        
    },
    profileName: {
        //marginTop: 20,
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    profilePhone: {
        marginTop: 10,
        color: '#9ecbea',
        fontSize: 18,
    },
    optionsContainer: {

        marginTop: 20,
        backgroundColor: '#FFFFFF',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        marginLeft: 0,
        width: '100%',
    },
    optionText: {
        fontSize: 16,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        backgroundColor: 'black',
        opacity: 0.5,
        zIndex: 9,
    },
    separator: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 10,
    },
    selectedOption: {
        backgroundColor: 'lightgray',
    },
    optionContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
        gap: 10, 
    },

});

export default Menu;



