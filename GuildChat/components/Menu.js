import React, { useState, useEffect, useRef } from "react";
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
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, onValue } from "firebase/database";
import { database } from "../firebaseConfig";
import { MaterialIcons } from '@expo/vector-icons';

// Import SVG icons
import GB from "./ico/GB.svg";
import Admin from "./ico/admin.svg";
import GVG from "./ico/GVG.svg";
import Quant from "./ico/quant.svg";
import Servise from "./ico/servise.svg";
import Chat from "./ico/Chat.svg";
import Azbook from "./ico/azbook.svg";
import Profile from "./ico/profile.svg";

// Component Separator
const Separator = () => <View style={styles.separator} />;

// Menu options
const menuOptions = [
  {
    text: "Прокачка Величних Споруд",
    icon: <GB width="18" height="18" fill="#8C9093" />,
  },
  {
    text: "Поле битви гільдій",
    icon: <GVG width="18" height="18" fill="#8C9093" />,
    keyDate: new Date(2024, 2, 14),
  },
  {
    text: "Квантові вторгнення",
    icon: <Quant width="18" height="18" fill="#8C9093" />,
    keyDate: new Date(2024, 2, 21),
  },
  { text: "Сервіси", icon: <Servise width="18" height="18" fill="#8C9093" /> },
  { text: "Альтанка", icon: <Chat width="18" height="18" fill="#8C9093" /> },
  { text: "Абетка", icon: <Azbook width="18" height="18" fill="#8C9093" /> },
  {
    text: "Налаштування",
    icon: <Profile width="18" height="18" fill="#8C9093" />,
  },
  {
    text: "Адміністративна панель",
    icon: <Admin width="18" height="18" fill="#8C9093" />,
  },
];

// Функція для видалення непотрібних записів
const cleanData = (data) => {
  if (typeof data !== "object" || data === null) return data;
  const result = Array.isArray(data) ? [] : {};

  for (const key in data) {
    if (key === "password" || key === "userName" || key === "role") continue;
    result[key] = cleanData(data[key]);
  }
  return result;
};

// Menu component
const Menu = ({ menuOpen, toggleMenu, setSelectedTitle, setSelectedComponent }) => {
  const [menuTranslateX] = useState(new Animated.Value(-300));
  const [contentOpacity] = useState(new Animated.Value(1));
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [panResponderInstance, setPanResponderInstance] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [userImageUrl, setUserImageUrl] = useState("");
  const [userRole, setUserRole] = useState("");
  const [wordName, setWordName] = useState("");
  const [additionalMenuOptions, setAdditionalMenuOptions] = useState([]);
  const [tempData, setTempData] = useState({});
  const [isAdditionalMenuVisible, setIsAdditionalMenuVisible] = useState(false); // Додано стан для видимості додаткового меню
  const [additionalMenuHeight] = useState(new Animated.Value(0)); // Додано для анімації висоти
  //const [selectedComponent, setSelectedComponent] = useState(null);

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

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const handleChevronPress = () => {
    setIsAdditionalMenuVisible(!isAdditionalMenuVisible); // Перемикаємо стан видимості
    if (additionalMenuOptions.length === 1) {
      targetHeight = isAdditionalMenuVisible ? 0 : 100;
    } if(additionalMenuOptions.length === 2) {
      targetHeight = isAdditionalMenuVisible ? 0 : 80;
    } else {
      targetHeight = isAdditionalMenuVisible ? 0 : additionalMenuOptions.length * 55;
    }
    Animated.timing(additionalMenuHeight, {
      toValue: targetHeight, // Встановлюємо нову висоту
      duration: 300,
      useNativeDriver: false,
    }).start();
    Animated.timing(rotateAnim, {
      toValue: rotateAnim._value === 0 ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-180deg'],
  });

  const animatedStyle = {
    transform: [{ rotate: rotateInterpolate }],
  };

  const handleOptionPress = async (index) => {
    if (index < additionalMenuOptions.length) {
      const selectedWorldName = additionalMenuOptions[index].text;
      const foundKey = Object.keys(tempData).find(key => tempData[key]?.worldName === selectedWorldName);
      if (foundKey) {
        try {
          await AsyncStorage.setItem("guildId", foundKey);
          await reloadData();
        } catch (error) {
          console.error("Error saving guildId to AsyncStorage:", error);
        }
      }
      return;
    }

    const menuIndex = index - additionalMenuOptions.length - 1;
    const selectedMenuOption = menuOptions[menuIndex];
    setSelectedOption(menuIndex);
    setSelectedTitle(selectedMenuOption.text);

    if (selectedMenuOption.text) {
      setSelectedComponent(selectedMenuOption.text); // Переконайтеся, що використовуєте правильне ім'я змінної
      console.log(selectedMenuOption.text); // Виводимо значення тексту обраного компоненту
    } else {
      console.error(`Component for menu option ${selectedMenuOption.text} is null or undefined`);
    }

    toggleMenu();
  };



  const reloadData = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      const guildId = await AsyncStorage.getItem("guildId");
      setUserId(storedUserId);

      if (storedUserId) {
        const userRef = ref(database, `users/${storedUserId}`);
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if (userData) {
            setUserName(userData.userName || "ВаДімкаА");
            setUserImageUrl(
              userData[guildId]?.imageUrl ||
              "https://foe.scoredb.io/img/games/foe/avatars/addon_portrait_id_cop_egyptians_maatkare.jpg"
            );
            setUserRole(userData[guildId]?.role);

            const guildRef = ref(database, "guilds");
            onValue(guildRef, (guildSnapshot) => {
              const guildData = guildSnapshot.val();
              const worldNames = {};
              const newAdditionalMenuOptions = [];

              Object.keys(userData).forEach((key) => {
                if (guildData[key] && guildData[key].worldName) {
                  worldNames[key] = guildData[key].worldName;
                }
              });

              const cleanedUserData = cleanData(userData);
              const updatedUserData = addWorldName(cleanedUserData, worldNames);

              // Зберігаємо тимчасові дані у стан
              setTempData(updatedUserData);

              Object.keys(updatedUserData).forEach((key) => {
                if (updatedUserData[key]?.worldName && updatedUserData[key]?.imageUrl) {
                  newAdditionalMenuOptions.push({
                    text: updatedUserData[key].worldName,
                    icon: (
                      <Image
                        source={{ uri: updatedUserData[key].imageUrl }}
                        style={styles.roundIcon}
                      />
                    ),
                  });
                }
              });

              setAdditionalMenuOptions(newAdditionalMenuOptions);
            });
          }
        });

        const guildRef = ref(database, `guilds/${guildId}`);
        onValue(guildRef, (snapshot) => {
          const guildData = snapshot.val();
          setWordName(guildData?.worldName || "");
        });
      }
    } catch (error) {
      console.error("Error fetching data from AsyncStorage or Firebase:", error);
    }
  };


  const addWorldName = (data, worldNames) => {
    if (typeof data !== "object" || data === null) return data;
    const result = Array.isArray(data) ? [] : {};

    for (const key in data) {
      result[key] = addWorldName(data[key], worldNames);
      if (worldNames[key]) {
        result[key].worldName = worldNames[key];
      }
    }
    return result;
  };

  useEffect(() => {
    if (menuOpen) {
      setSelectedOption(null);
    }
  }, [menuOpen]);

  const isGuildLeader = (role) => {
    return role === "guildLeader";
  };

  function isOptionVisible(option, currentDate) {
    if (!option.keyDate) return true;

    const keyDateWeek = getWeekNumber(option.keyDate, option.keyDate);
    const currentWeek = getWeekNumber(currentDate, option.keyDate);

    const weekDifference = currentWeek - keyDateWeek;

    if (0 <= weekDifference <= 1) {
      const currentDay = currentDate.getDay();
      const currentHour = currentDate.getHours();

      if (keyDateWeek % 2 === 1) {
        return true;
      } else {
        return (
          (currentDay === 1 && currentHour < 8) ||
          (currentDay === 4 && currentHour >= 8) ||
          currentDay === 5 ||
          currentDay === 6 ||
          currentDay === 0
        );
      }
    }

    return false;
  }

  function getWeekNumber(date, keyDate = null) {
    const firstDayOfYear = keyDate
      ? new Date(keyDate.getFullYear(), 0, 1)
      : new Date(date.getFullYear(), 0, 1);
    const daysSinceFirstDay = Math.floor((date - firstDayOfYear) / 86400000);

    const firstMonday = new Date(firstDayOfYear);
    while (firstMonday.getDay() != 0) {
      firstMonday.setDate(firstMonday.getDate() + 1);
    }

    const daysSinceFirstMonday = Math.floor((date - firstMonday) / 86400000);
    const weekNumber = Math.ceil((daysSinceFirstMonday + 1) / 7);

    if (firstDayOfYear.getDay() != 1) {
      return weekNumber;
    } else {
      return weekNumber + 1;
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        const guildId = await AsyncStorage.getItem("guildId");
        setUserId(storedUserId);

        if (storedUserId) {
          const userRef = ref(database, `users/${storedUserId}`);
          onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
              setUserName(userData.userName || "ВаДімкаА");
              setUserImageUrl(
                userData[guildId]?.imageUrl ||
                "https://foe.scoredb.io/img/games/foe/avatars/addon_portrait_id_cop_egyptians_maatkare.jpg"
              );
              setUserRole(userData[guildId]?.role);

              const guildRef = ref(database, "guilds");
              onValue(guildRef, (guildSnapshot) => {
                const guildData = guildSnapshot.val();
                const worldNames = {};
                const newAdditionalMenuOptions = [];

                Object.keys(userData).forEach((key) => {
                  if (guildData[key] && guildData[key].worldName) {
                    worldNames[key] = guildData[key].worldName;
                  }
                });

                const cleanedUserData = cleanData(userData);
                const updatedUserData = addWorldName(cleanedUserData, worldNames);

                // Зберігаємо тимчасові дані у стан
                setTempData(updatedUserData);

                Object.keys(updatedUserData).forEach((key) => {
                  if (updatedUserData[key]?.worldName && updatedUserData[key]?.imageUrl) {
                    newAdditionalMenuOptions.push({
                      text: updatedUserData[key].worldName,
                      icon: (
                        <Image
                          source={{ uri: updatedUserData[key].imageUrl }}
                          style={styles.roundIcon}
                        />
                      ),
                    });
                  }
                });

                setAdditionalMenuOptions(newAdditionalMenuOptions);
              });
            }
          });

          const guildRef = ref(database, `guilds/${guildId}`);
          onValue(guildRef, (snapshot) => {
            const guildData = snapshot.val();
            setWordName(guildData?.worldName || "");
          });
        }
      } catch (error) {
        console.error("Error fetching data from AsyncStorage or Firebase:", error);
      }
    };

    fetchData();
  }, []);



  const handleOverlayPress = () => {
    if (menuOpen) {
      toggleMenu();
    }
  };

  return (
    <>
      {menuOpen && (
        <TouchableWithoutFeedback onPress={handleOverlayPress}>
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
        </TouchableWithoutFeedback>
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
                source={{ uri: userImageUrl }}
                style={styles.profileIcon}
              />
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{userName}</Text>
              <View style={styles.profileContainer}>

                <Text style={styles.profilePhone}>{wordName}</Text>
                <TouchableOpacity style={styles.chevronIcon} onPress={handleChevronPress}>
                  <Animated.View style={animatedStyle}>
                    <MaterialIcons name="keyboard-arrow-up" size={30} color="#9ecbea" />
                  </Animated.View>
                </TouchableOpacity>

              </View>
            </View>
          </View>

          <ScrollView style={styles.optionsContainer}>
            <Animated.View style={{ height: additionalMenuHeight, overflow: 'hidden' }}>
              {additionalMenuOptions.map((option, index) => (
                <React.Fragment key={`additional-${index}`}>
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
                </React.Fragment>
              ))}
              <TouchableOpacity
                onPress={() => handleOptionPress(additionalMenuOptions.length)}
                style={[
                  styles.option,
                  selectedOption === additionalMenuOptions.length && styles.selectedOption,
                ]}
              >
                <View style={styles.optionContentRow}>
                  <View style={styles.addWorldIcon}>
                    <Text style={styles.addWorldIconText}>+</Text>
                  </View>
                  <Text style={styles.optionText}>Додати світ</Text>
                </View>
              </TouchableOpacity>
              <Separator />
            </Animated.View>
            {menuOptions.map(
              (option, index) =>
                isOptionVisible(option, new Date()) && (
                  <React.Fragment key={index}>
                    {!(option.text === "Адміністративна панель" && !isGuildLeader(userRole)) && (
                      <TouchableOpacity
                        onPress={() => handleOptionPress(additionalMenuOptions.length + index + 1)}
                        style={[
                          styles.option,
                          selectedOption === additionalMenuOptions.length + index + 1 && styles.selectedOption,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#517da2",
    paddingTop: 20,
    width: 300,
    zIndex: 100,
  },
  roundIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  addWorldIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  oundIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  addWorldIconText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingLeft: 20,
    marginVertical: 20,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
    overflow: "hidden",
  },
  profileDetails: {},
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  profilePhone: {
    marginTop: 10,
    color: "#9ecbea",
    fontSize: 20,
    marginRight: 40, // додатковий відступ для шеврона
  },
  optionsContainer: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    maxHeight: Dimensions.get("window").height * 0.9,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
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
    width: "100%",
    height: "100%",
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
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%', // щоб контейнер займав всю ширину меню
    paddingRight: 20, // відступ для правого краю
  },

  profilePhoneContainer: {
    flexDirection: 'row',
    alignItems: 'center', // це вирівняє шеврон по центру з текстом
  },

  chevronIcon: {
    marginTop: 5,
    //marginRight: 20,
  },
});

export default Menu;