import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  ScrollView,
  BackHandler,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { database } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";

// Імпортуємо SVG іконки
import GB from "./ico/GB.svg";
import Admin from "./ico/admin.svg";
import GVG from "./ico/GVG.svg";
import Quant from "./ico/quant.svg";
import Servise from "./ico/servise.svg";
import Chat from "./ico/Chat.svg";
import Azbook from "./ico/azbook.svg";
import Profile from "./ico/profile.svg";

// Компонент Separator
const Separator = () => <View style={styles.separator} />;

// Опції для меню
const menuOptions = [
  {
    text: "Прокачка Величних Споруд",
    icon: <GB width="24" height="24" fill="#8C9093" />,
  },
  {
    text: "Поле битви гільдій",
    icon: <GVG width="24" height="24" fill="#8C9093" />,
    keyDate: new Date(2024, 2, 14),
  },
  {
    text: "Квантові вторгнення",
    icon: <Quant width="24" height="24" fill="#8C9093" />,
    keyDate: new Date(2024, 2, 21),
  },
  { text: "Сервіси", icon: <Servise width="24" height="24" fill="#8C9093" /> },
  { text: "Альтанка", icon: <Chat width="24" height="24" fill="#8C9093" /> },
  { text: "Абетка", icon: <Azbook width="24" height="24" fill="#8C9093" /> },
  {
    text: "Налаштування",
    icon: <Profile width="24" height="24" fill="#8C9093" />,
  },
  {
    text: "Адміністративна панель",
    icon: <Admin width="24" height="24" fill="#8C9093" />,
  },
];

// Компонент Menu
const Menu = ({ menuOpen, toggleMenu, setSelectedTitle }) => {
  const [menuTranslateX] = useState(new Animated.Value(-300));
  const [contentOpacity] = useState(new Animated.Value(1));
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [panResponderInstance, setPanResponderInstance] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userId, setUserId] = useState(null); // State для userId
  const [userName, setUserName] = useState(""); // State для userName
  const [userImageUrl, setUserImageUrl] = useState(""); // State для imageUrl
  const [userRole, setUserRole] = useState(""); // State для ролі користувача
  const [wordName, setWordName] = useState(""); // Початкове значення пусте


  // Ефект для установки PanResponder та обробки BackButton
  useEffect(() => {
    const newPanResponderInstance = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 5,
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

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    Animated.parallel([
      Animated.spring(menuTranslateX, {
        toValue: menuOpen ? 0 : -300,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: menuOpen ? 0.95 : 1,
        useNativeDriver: true,
        duration: 200,
      }),
      Animated.timing(overlayOpacity, {
        toValue: menuOpen ? 0.5 : 0,
        useNativeDriver: true,
        duration: 200,
      }),
    ]).start();

    return () => {
      backHandler.remove();
    };
  }, [menuOpen, toggleMenu, menuTranslateX, contentOpacity, overlayOpacity]);

  // Обробник натискання на опцію меню
  const handleOptionPress = (index) => {
    setSelectedOption(index);
    setSelectedTitle(menuOptions[index].text);
    toggleMenu();
  };

  // Ефект для скидання вибраної опції при закритті меню
  useEffect(() => {
    if (menuOpen) {
      setSelectedOption(null);
    }
  }, [menuOpen]);

  const isGuildLeader = (role) => {
    return role === "guildLeader";
  };

  // Функція для перевірки видимості опції
  function isOptionVisible(option, currentDate) {
    if (!option.keyDate) return true; // Якщо keyDate не вказано, опція завжди видима

    const keyDateWeek = getWeekNumber(option.keyDate, option.keyDate);
    const currentWeek = getWeekNumber(currentDate, option.keyDate);

    const weekDifference = currentWeek - keyDateWeek;

    if (0 <= weekDifference <= 1) {
      // Нульовий або перший тиждень
      const currentDay = currentDate.getDay();
      const currentHour = currentDate.getHours();

      if (keyDateWeek % 2 === 1) {
        // Парна неділя
        return true;
      } else {
        // Непарна неділя
        return (
          (currentDay === 1 && currentHour < 8) || // Понеділок до 8:00
          (currentDay === 4 && currentHour >= 8) || // Четвер після 8:00
          currentDay === 5 ||
          currentDay === 6 ||
          currentDay === 0
        ); // П'ятниця - неділя
      }
    }

    return false; // У всіх інших випадках не видно
  }

  // Функція для отримання номера тижня
  function getWeekNumber(date, keyDate = null) {
    const firstDayOfYear = keyDate
      ? new Date(keyDate.getFullYear(), 0, 1)
      : new Date(date.getFullYear(), 0, 1);
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

  // Ефект для отримання даних з AsyncStorage і Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        const guildId = await AsyncStorage.getItem("guildId");
        console.log("userId -", storedUserId);
        console.log("guildId -", guildId);
        setUserId(storedUserId); // Зберігаємо userId у стейт
  
        if (storedUserId) {
          const userRef = ref(database, `users/${storedUserId}`);
          onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            console.log("Дані користувача з Firebase:", userData);
            if (userData) {
              if (userData.userName) {
                setUserName(userData.userName); // Зберігаємо userName у стейт
              }
              if (guildId && userData[guildId] && userData[guildId].imageUrl) {
                setUserImageUrl(userData[guildId].imageUrl); // Зберігаємо imageUrl у стейт
              }
  
              // Визначення ролі користувача
              const userRoleFromData = userData[guildId].role; // Припустимо, що поле role є у даному користувача
              setUserRole(userRoleFromData); // Встановлюємо роль користувача у стейт
  
              // Виведення ролі користувача в консоль
              console.log("Роль користувача:", userRoleFromData);
            }
          });
  
          // Отримання даних гільдії з гілки guilds
          const guildRef = ref(database, `guilds/${guildId}`);
          onValue(guildRef, (snapshot) => {
            const guildData = snapshot.val();
            console.log("Дані гільдії з Firebase:", guildData); // Виведення даних гільдії в консоль
  
            // Отримання wordName з guildData і оновлення стану
            const wordNameFromGuildData = guildData["worldName"]; // Припустимо, що wordName доступний у guildData
            setWordName(wordNameFromGuildData); // Встановлення значення wordName
          });
        }
      } catch (error) {
        console.error("Error fetching data from AsyncStorage or Firebase:", error);
      }
    };
  
    fetchData();
  }, []);
  
  

  return (
    <>
      {menuOpen && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
      )}
      <Animated.View
        {...panResponderInstance?.panHandlers}
        style={[
          styles.container,
          { transform: [{ translateX: menuTranslateX }] },
        ]}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.profileIcon}>
              <Image
                source={{
                  uri:
                    userImageUrl ||
                    "https://foe.scoredb.io/img/games/foe/avatars/addon_portrait_id_cop_egyptians_maatkare.jpg",
                }}
                style={styles.profileIcon}
              />
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{userName || "ВаДімкаА"}</Text>
              <Text style={styles.profilePhone}>{wordName}</Text>

            </View>
          </View>

          <ScrollView style={styles.optionsContainer}>
            {menuOptions.map(
              (option, index) =>
                isOptionVisible(option, new Date()) && (
                  <React.Fragment key={index}>
                    {!(option.text === "Адміністративна панель" && !isGuildLeader(userRole)) && (
                      <TouchableOpacity
                        onPress={() => handleOptionPress(index)}
                        style={[
                          styles.option,
                          selectedOption === index && styles.selectedOption,
                        ]}
                      >
                        <View style={styles.optionContentRow}>
                          {option.icon && option.icon}
                          <Text style={styles.optionText}>{option.text}</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    {index === 5 && <Separator />}
                  </React.Fragment>
                )
            )}
          </ScrollView>
        </View>
      </Animated.View>
    </>
  );
};

// Стилі компонента
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#517da2",
    paddingTop: 20,
    width: 300,
    zIndex: 10,
  },
  header: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingLeft: 20,
    marginVertical: 20,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
    overflow: "hidden",
  },
  profileDetails: {},
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  profilePhone: {
    marginTop: 10,
    color: "#9ecbea",
    fontSize: 18,
  },
  optionsContainer: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    marginLeft: 0,
    width: "100%",
  },
  optionText: {
    fontSize: 16,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    backgroundColor: "black",
    opacity: 0.5,
    zIndex: 9,
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
  selectedOption: {
    backgroundColor: "lightgray",
  },
  optionContentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
    gap: 10,
  },
});

export default Menu;
