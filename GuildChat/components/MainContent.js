import React, { useState } from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import Header from "./Header";
import AnimatedMenu from "./Menu";

const MainContent = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("Заголовок приложения"); // Состояние для выбранного заголовка

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <Header title={selectedTitle} toggleMenu={toggleMenu} />
        <AnimatedMenu
          menuOpen={menuOpen}
          toggleMenu={toggleMenu}
          setSelectedTitle={setSelectedTitle} // Передаем функцию для обновления заголовка
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: "column",
    
    marginBottom:10,
    
  },
});

export default MainContent;
