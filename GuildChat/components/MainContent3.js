import * as React from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import GBScreen from "./GB/GBScreen";
import AdminScreen from "./Admin";
import GVGScreen from "./GVG";
import QuantScreen from "./Quant";
import ServiseScreen from "./Servise";
import ChatScreen from "./Chat/ChatScreen";
import AzbookScreen from "./Azbook";
import GB from "./ico/GB.svg";
import Admin from "./ico/admin.svg";
import GVG from "./ico/GVG.svg";
import Quant from "./ico/quant.svg";
import Servise from "./ico/servise.svg";
import Chat from "./ico/Chat.svg";
import Azbook from "./ico/azbook.svg";
import Profile from "./ico/profile.svg";

const Drawer = createDrawerNavigator();


function CustomDrawerContent(props) {
    return (
        <DrawerContentScrollView {...props}>
            <View style={styles.blueStrip}>
                <Text style={styles.stripText}>Ваша інформація тут</Text>
            </View>
            <DrawerItemList {...props} />
        </DrawerContentScrollView>
    );
}

export default function App() {
    return (
        <NavigationContainer>                  
            <Drawer.Navigator drawerContent={props => 
                <CustomDrawerContent {...props} />} initialRouteName="Home">
                <Drawer.Screen
                    name="GB"
                    component={GBScreen}
                    options={{
                        drawerLabel: 'Величні споруди',
                        title: 'Величні споруди',
                        drawerIcon: ({ color, size }) => (
                            <GB width={size} height={size} fill={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="Chat"
                    component={ChatScreen}
                    options={{
                        drawerLabel: 'Gjkt',
                        title: 'рарлти',
                        drawerIcon: ({ color, size }) => (
                            <Chat width={size} height={size} fill={color} />
                        ),
                    }}
                />
            </Drawer.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    blueStrip: {
        height: 200,
        backgroundColor: 'blue',
        alignItems: 'center',
        justifyContent: 'center'
    },
    stripText: {
        color: 'white',
        fontSize: 20
    }
});