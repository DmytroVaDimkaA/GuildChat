import React, { useState } from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import Header from "./Header";
import AnimatedMenu from "./Menu";
import GBScreen from "./GB/GBScreen";
import Admin from "./Admin";
import GVG from "./GVG";
import Quant from "./Quant";
import Servise from "./Servise";
import Chat from "./Chat/ChatScreen";
import Azbook from "./Azbook";

const MainContent = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState("Заголовок приложения");

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const renderContent = () => {
    switch (selectedComponent) {
      case "Прокачка Величних Споруд":
        return <GBScreen />;
      case "Адміністративна панель":
        return <Admin />;
      case "Поле битви гільдій":
        return <GVG />;
      case "Квантові вторгнення":
        return <Quant />;
      case "Сервіси":
        return <Servise />;
      case "Альтанка":
        return <Chat />;
      case "Абетка":
        return <Azbook />;
      default:
        return <View style={styles.defaultContent} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title={selectedTitle} toggleMenu={toggleMenu} />
        <View style={styles.content}>
          {renderContent()}
        </View>
      </View>
      {menuOpen && (
        <View style={styles.menuOverlay}>
          <AnimatedMenu
            menuOpen={menuOpen}
            toggleMenu={toggleMenu}
            setSelectedComponent={setSelectedComponent}
            setSelectedTitle={setSelectedTitle}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "green",
  },
  content: {
    flex: 1,
    width: "100%",
  },
  defaultContent: {
    flex: 1,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});

export default MainContent;
