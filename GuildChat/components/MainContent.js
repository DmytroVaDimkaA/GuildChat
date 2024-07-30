import React, { useState } from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import Header from "./Header";
import AnimatedMenu from "./Menu";
import GB from "./GB";
import Admin from "./Admin";
import GVG from "./GVG";
import Quant from "./Quant";
import Servise from "./Servise";
import Chat from "./Chat";
import Azbook from "./Azbook";

const MainContent = ({ selectedComponent }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("Заголовок приложения");

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  console.log(selectedComponent);
  const renderContent = () => {
    switch (selectedComponent) {
      case "Прокачка Величних Споруд":
        return <GB />;
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
      <Header title={selectedTitle} toggleMenu={toggleMenu} />
      <View style={styles.container}>
        
        <AnimatedMenu
          menuOpen={menuOpen}
          toggleMenu={toggleMenu}
          setSelectedTitle={setSelectedTitle}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  defaultContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MainContent;
