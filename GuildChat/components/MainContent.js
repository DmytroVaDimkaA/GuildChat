import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated, Image } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerToggleButton, DrawerItem } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, getDatabase, get } from "firebase/database";
import { MaterialIcons } from '@expo/vector-icons';
import GBScreen from "./GB/GBScreen";
import MyGB from './GB/MyGB';
import NewGBChat from './GB/NewGBChat';
import AddGBComponent from './GB/AddGBComponent';
import GBGuarant from './GB/GBGuarant';
import GuildMembersList from "./Chat/GuildMemberList";
import NewGroupChat from "./Chat/NewGroupChat";
import ChatScreen from "./Chat/ChatScreen";
import ChatWindow from './Chat/ChatWindow';
import MapComponent from './Quant/MapComponent';
import GB from "./ico/GB.svg";
import Chat from "./ico/Chat.svg";
import Quant from "./ico/quant.svg";
import GVG from "./ico/GVG.svg";
import Azbook from "./ico/azbook.svg";
import Servise from "./ico/servise.svg";
import Profile from "./ico/profile.svg";
import Admin from "./ico/admin.svg";
import { MenuProvider } from 'react-native-popup-menu'; // Додано імпорт MenuProvider
import Ionicons from 'react-native-vector-icons/Ionicons';


const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const defaultHeaderOptions = {
    headerStyle: {
        backgroundColor: '#517da2',
    },
    headerTintColor: '#fff',
};

function ChatStack() {
    return (
        <Stack.Navigator screenOptions={defaultHeaderOptions}>
            <Stack.Screen
                name="ChatScreen"
                component={ChatScreen}
                options={{
                    title: 'Альтанка',
                    headerLeft: () => <DrawerToggleButton tintColor="#fff" />,
                }}
            />
            <Stack.Screen
                name="GuildMembersList"
                component={GuildMembersList}
                options={{
                    title: 'Нове повідомлення',
                }}
            />
            <Stack.Screen
                name="NewGroupChat"
                component={NewGroupChat}
                options={{
                    title: 'Створити групу',
                }}
            />
            <Stack.Screen 
                name="ChatWindow" 
                component={ChatWindow} 
                options={({ navigation }) => ({
                    title: 'Чат',
                    // Використовуємо стандартну стрілку назад
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.navigate('ChatScreen')}>
                            <Ionicons
                            name="arrow-back"
                            size={24}
                            color="#fff"
                            style={{ marginLeft: 10 }}
                        />
                        </TouchableOpacity>
                    ),
                })}
            />
        </Stack.Navigator>
    );
}


function GBStack() {
    return (
        <Stack.Navigator screenOptions={defaultHeaderOptions}>
            <Stack.Screen
                name="GBScreen"
                component={GBScreen}
                options={{
                    title: 'Прокачка Величних Споруд',
                    headerLeft: () => <DrawerToggleButton tintColor="#fff" />,
                }}
            />
            <Stack.Screen
                name="MyGB"
                component={MyGB}
                options={{ title: 'Мої Величні Споруди' }}
            />
            <Stack.Screen
                name="GBGuarant"
                component={GBGuarant}
            />
            <Stack.Screen
                name="NewGBChat"
                component={NewGBChat}
                options={{ title: 'Нова гілка прокачки ВС' }}
            />
            <Stack.Screen
                name="AddGBComponent"
                component={AddGBComponent}
                options={{ title: 'Додайте ВС до свого списку' }}
            />
            
        </Stack.Navigator>
    );
}

function QuantStack() {
    return (
        <Stack.Navigator screenOptions={defaultHeaderOptions}>
            <Stack.Screen
                name="QuantScreen"
                component={MapComponent}
                options={{
                    title: 'Квантові вторгнення',
                    headerLeft: () => <DrawerToggleButton tintColor="#fff" />,
                }}
            />
        </Stack.Navigator>
    );
}

function CustomDrawerContent(props) {
    const [guildName, setGuildName] = useState('');
    const [userName, setUserName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [guildImageUrl, setGuildImageUrl] = useState('');
    const [tempData, setTempData] = useState({});
    const [isWorldSelectVisible, setIsWorldSelectVisible] = useState(false);
    const [selectedGuildId, setSelectedGuildId] = useState('');

    // Animated values for the height and rotation of worldselect
    const animatedHeight = useRef(new Animated.Value(0)).current;
    const rotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fetchGuildAndUserData = async () => {
            try {
                const guildId = await AsyncStorage.getItem('guildId');
                const userId = await AsyncStorage.getItem('userId');

                if (!guildId || !userId) {
                    throw new Error('guildId або userId не знайдено');
                }

                const db = getDatabase();
                const userBranchRef = ref(db, `users/${userId}`);
                const userBranchSnapshot = await get(userBranchRef);

                if (userBranchSnapshot.exists()) {
                    const usersData = userBranchSnapshot.val();

                    setUserName(usersData.userName || '');
                    setImageUrl(usersData.imageUrl || '');

                    const guildRef = ref(db, `guilds/${guildId}`);
                    const guildSnapshot = await get(guildRef);

                    if (guildSnapshot.exists()) {
                        const guildData = guildSnapshot.val();
                        setGuildName(guildData.guildName || 'Без назви');
                        
                        const guildUserRef = ref(db, `guilds/${guildId}/guildUsers/${userId}`);
                        const guildUserSnapshot = await get(guildUserRef);

                        if (guildUserSnapshot.exists()) {
                            const guildUserData = guildUserSnapshot.val();
                            setGuildImageUrl(guildUserData.imageUrl || '');
                        }
                    }

                    const guildData = {};
                    for (let N in usersData) {
                        if (N !== guildId) {
                            const otherGuildRef = ref(db, `guilds/${N}`);
                            const otherGuildSnapshot = await get(otherGuildRef);

                            const guildUserRef = ref(db, `guilds/${N}/guildUsers/${userId}`);
                            const guildUserSnapshot = await get(guildUserRef);

                            if (otherGuildSnapshot.exists() && guildUserSnapshot.exists()) {
                                guildData[N] = {
                                    guildName: otherGuildSnapshot.val().guildName || 'Без назви',
                                    imageUrl: guildUserSnapshot.val().imageUrl || ''
                                };
                            }
                        }
                    }

                    setTempData(guildData);
                }

            } catch (error) {
                console.error('Помилка при отриманні даних: ', error);
            }
        };

        fetchGuildAndUserData();
    }, [selectedGuildId]); // Додати залежність від selectedGuildId

    useEffect(() => {
        Animated.timing(animatedHeight, {
            toValue: isWorldSelectVisible ? (Object.keys(tempData).length * 42 + 42) : 0, // Adjust the height calculation
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [isWorldSelectVisible, tempData]);

    useEffect(() => {
        Animated.timing(rotation, {
            toValue: isWorldSelectVisible ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isWorldSelectVisible]);

    const handleChevronPress = () => {
        setIsWorldSelectVisible(!isWorldSelectVisible);
    };

    const handleGuildPress = async (guildId) => {
        try {
            await AsyncStorage.setItem('guildId', guildId);
            setSelectedGuildId(guildId);
        } catch (error) {
            console.error('Помилка при збереженні guildId в AsyncStorage: ', error);
        }
    };

    const rotationInterpolate = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    return (
        <DrawerContentScrollView {...props} style={styles.drawerContent}>
        {/* Ваш заголовок та аватар */}
        <View style={styles.header}>
            {guildImageUrl ? (
                <Image
                    source={{ uri: guildImageUrl }}
                    style={styles.profileImage}
                />
            ) : null}
            <Text style={styles.userName}>{userName}</Text>
            <View style={styles.profileContainer}>
                <Text style={styles.guildName}>{guildName}</Text>
                <TouchableOpacity style={styles.chevronIcon} onPress={handleChevronPress}>
                    <Animated.View style={{ transform: [{ rotate: rotationInterpolate }] }}>
                        <MaterialIcons
                            name="keyboard-arrow-down"
                            size={30}
                            color="#9ecbea"
                        />
                    </Animated.View>
                </TouchableOpacity>
            </View>
        </View>

        {/* Анімований вибір світу */}
        <Animated.View style={[styles.worldselect, { height: animatedHeight, overflow: 'hidden' }]}>
            <View style={styles.guildContainer}>
                <MaterialIcons name="add" size={24} color="white" style={styles.guildImage} />
                <Text style={styles.guildText}>Додати світ</Text>
            </View>
            {Object.keys(tempData).map(key => (
                <TouchableOpacity key={key} style={styles.guildContainer} onPress={() => handleGuildPress(key)}>
                    <Image
                        source={{ uri: tempData[key].imageUrl }}
                        style={styles.guildImage}
                    />
                    <Text style={styles.guildText}>{tempData[key].guildName}</Text>
                </TouchableOpacity>
            ))}
        <View style={styles.separator} />
        </Animated.View>
        {isWorldSelectVisible && <View style={styles.separator} />}
        {/* Сепаратор */}
        

        {/* Пункти меню з Drawer */}
        {props.state.routes.map((route, index) => {
                const isServiceItem = route.name === 'servise'; // Перевіряємо, чи це пункт Сервіси
                const { drawerIcon } = props.descriptors[route.key].options; // Отримуємо іконку з дескриптора

                return (
                    <View key={route.key}>
                        <DrawerItem
                            label={props.descriptors[route.key].options.drawerLabel || route.name}
                            onPress={() => props.navigation.navigate(route.name)}
                            icon={({ color, size }) =>
                                drawerIcon ? drawerIcon({ color, size }) : null
                            } // Рендеримо іконку
                            activeBackgroundColor="#000" // Наприклад, '#FFEB3B'
                        />
                        
                        {/* Вставляємо сепаратор після пункту Сервіси */}
                        {isServiceItem && <View style={styles.separator} />}
                    </View>
                );
            })}
    </DrawerContentScrollView>
    );
}

export default function App() {
    return (
        <MenuProvider>
        <NavigationContainer>
            <Drawer.Navigator 
                drawerContent={props => <CustomDrawerContent {...props} />} 
                initialRouteName="Home"
            >
                <Drawer.Screen
                    name="GB"
                    component={GBStack}
                    options={{
                        headerShown: false,
                        drawerLabel: 'Величні споруди',
                        title: 'Величні споруди',
                        drawerIcon: ({ color, size }) => (
                            <GB width={size} height={size} fill={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="ChatList"
                    component={ChatStack}
                    options={{
                        headerShown: false,
                        drawerLabel: 'Альтанка',
                        drawerIcon: ({ color, size }) => (
                            <Chat width={size} height={size} fill={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="Quanty"
                    component={QuantStack}
                    options={{
                        headerShown: false,
                        drawerLabel: 'Квантові вторгнення',
                        drawerIcon: ({ color, size }) => (
                            <Quant width={size} height={size} fill={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="PBG"
                    component={QuantStack}
                    options={{
                        headerShown: false,
                        drawerLabel: 'Поле битви гільдій',
                        drawerIcon: ({ color, size }) => (
                            <GVG width={size} height={size} fill={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="azbook"
                    component={QuantStack}
                    options={{
                        headerShown: false,
                        drawerLabel: 'Абетка',
                        drawerIcon: ({ color, size }) => (
                            <Azbook width={size} height={size} fill={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="servise"
                    component={QuantStack}
                    options={{
                        headerShown: false,
                        drawerLabel: 'Сервіси',
                        drawerIcon: ({ color, size }) => (
                            <Servise width={size} height={size} fill={color} />
                        ),
                    }}
                />
                
                <Drawer.Screen
                    name="profile"
                    component={QuantStack}
                    options={{
                        headerShown: false,
                        drawerLabel: 'Профіль',
                        drawerIcon: ({ color, size }) => (
                            <Profile width={size} height={size} fill={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="admin"
                    component={QuantStack}
                    options={{
                        headerShown: false,
                        drawerLabel: 'Адміністративна панель',
                        drawerIcon: ({ color, size }) => (
                            <Admin width={size} height={size} fill={color} />
                        ),
                    }}
                />
            </Drawer.Navigator>
        </NavigationContainer>
</MenuProvider>
    );
}

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
    },
    header: {
        height: 200,
        justifyContent: 'center',
        flexDirection: "column",
        alignItems: "flex-start",
        paddingLeft: 20,
        backgroundColor: '#517da2',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    userName: {
        fontSize: 22,
        fontWeight: "bold",
        color: "white",
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingRight: 20, // відступ для правого краю
    },
    guildName: {
        marginTop: 10,
        color: "#9ecbea",
        fontSize: 20,
        marginRight: 40, // додатковий відступ для шеврона
    },
    chevronIcon: {
        marginTop: 7,
    },
    worldselect: {
        marginVertical: 10,
        paddingHorizontal: 15,
    },
    guildContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    guildImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
    },
    guildText: {
        fontSize: 16,
        marginLeft: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#BDBDBD',
        marginVertical: 10,
    },
});
