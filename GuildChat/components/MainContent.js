import React, { useState, useEffect } from "react";
import { SafeAreaView, View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { ref, onValue } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { database } from "../firebaseConfig";
import Menu from "./Menu";
import GBScreen from "./GB/GBScreen";
import Admin from "./Admin";
import GVG from "./GVG";
import Quant from "./Quant";
import Servise from "./Servise";
import Chat from "./Chat/ChatScreen";
import Azbook from "./Azbook";
import Settings from "./UserSettingsScreen"

const Drawer = createDrawerNavigator();

const MainContent = () => {
  const [selectedTitle, setSelectedTitle] = useState("Заголовок приложения");
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [userImageUrl, setUserImageUrl] = useState("");
  const [userRole, setUserRole] = useState("");
  const [wordName, setWordName] = useState("");
  const [additionalMenuOptions, setAdditionalMenuOptions] = useState([]);

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

  const cleanData = (data) => {
    if (typeof data !== "object" || data === null) return data;
    const result = Array.isArray(data) ? [] : {};

    for (const key in data) {
      if (key === "password" || key === "userName" || key === "role") continue;
      result[key] = cleanData(data[key]);
    }
    return result;
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
    reloadData();
  }, []);

  const CustomDrawerContent = ({ navigation }) => (
    <Menu
       menuOpen={true}
       toggleMenu={() => {
          navigation.closeDrawer();
       }}
       setSelectedTitle={setSelectedTitle}
       setSelectedComponent={(component) => {
          navigation.navigate(component);
          navigation.closeDrawer();
       }}
       additionalMenuOptions={additionalMenuOptions}
    />
 );
 

  return (
    <NavigationContainer>
      <SafeAreaView style={styles.safeArea}>
        <Drawer.Navigator
          screenOptions={({ navigation }) => ({
            headerStyle: {
              height: 100,
              backgroundColor: '#517da2',
            },
            headerTitleAlign: 'left',
            headerTitleStyle: {
              fontSize: 20,
              fontFamily: 'Arial Black',
              
              color: 'white',
            },
            headerLeft: () => (
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  marginLeft: 16,
                  paddingTop: 8,
                }}
                onPress={() => navigation.toggleDrawer()}
              >
                <Image
                  source={require('./assets/menu-icon.png')}
                  style={{ width: 24, height: 24 }}
                />
              </TouchableOpacity>
            ),
          })}
          drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
          <Drawer.Screen 
            name="Прока Величних Споруд" 
            component={GBScreen}
            options={{
              //headerShown: false,
              drawerLabel: 'Величні споруди',
              title: 'Величні споруди',
              drawerIcon: ({ color, size }) => (
                  <GB width={size} height={size} fill={color} />
              ),
          }}
          />
          <Drawer.Screen name="Адміністративна панель" component={Admin} />
          <Drawer.Screen name="Поле битви гільдій" component={GVG} />
          <Drawer.Screen name="Квантові вторгнення" component={Quant} />
          <Drawer.Screen name="Сервіси" component={Servise} />
          <Drawer.Screen name="Альтанка" component={Chat} />
          <Drawer.Screen name="Абетка" component={Azbook} />
          <Drawer.Screen name="Налаштування" component={Settings} />
        </Drawer.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

export default MainContent;
