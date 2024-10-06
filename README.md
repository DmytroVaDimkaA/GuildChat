e0f7fa
container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "space-between",
  },
  dateGroup: {
    marginBottom: 10,
  },
  dateBlock: {
    alignItems: 'center',
    marginVertical: 10,
  },
  date: {
    fontSize: 14,
    color: "#fff",
    backgroundColor: "#999",
    padding: 5,
    borderRadius: 10,
  },

  messagesList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
    minWidth: screenWidth / 2, // Мінімальна ширина повідомлення
    position: 'relative', // Необхідно для позиціонування "хвостиків"
  },
  messageInnerContainer: {
    padding: 2,
  },

  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ECECEC",
  },
  messageText: {
    fontSize: 16,
  },
  messageDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  inputContainer: {
    padding: 10,
    backgroundColor: "#fff",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  iconButton: {
    marginHorizontal: 5,
  },
  blueIcon: {
    color: "#007bff",
  },
  defaultIcon: {
    color: "#ccc",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  triangle: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    position: 'absolute',
  },
  triangleMy: {
    borderTopWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 25,
    borderLeftWidth: 25,
    borderTopColor: "transparent",
    borderRightColor: "#DCF8C6",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    bottom: -25,
    right: -15,
  },
  triangleTheir: {
    borderTopWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 25,
    borderLeftWidth: 25,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#ECECEC",
    bottom: -25,
    left: -15,
  },
  messageDateMy: {
    alignSelf: 'flex-end', // Вирівнювання по правому краю
    marginTop: 4, // Можна додати додатковий відступ для відокремлення часу від тексту
    color: '#aaa', // Можна налаштувати колір часу
  },
  menu: {
    position: 'relative',
    
    //bottom: 50, // Можна змінити для відповідності з вашим дизайном
    
  },
  popupMenuInterlocutor: {
    
    position: 'absolute',
    left: 10,  // Відступ зліва для співрозмовника
    top: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#cccccc',
    // Інші стилі
  },
  // Стиль для попап меню особистих повідомлень
  popupMenuPersonal: {
    backgroundColor:  'red',
    position: 'absolute',
    right: -155,  // Відступ справа для особистих повідомлень
    top: 0,
    fontSize: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#cccccc',
    // Інші стилі, такі ж як для співрозмовника
  },

export default ChatWindow;



  users/${userId}/setting/language
  guilds/${guildId}/guildUsers/${userId}/greatBuild/${buildingId}/investment/



  container: {
    padding: 20,
  },
  imageLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildingImage: {
    //width: 90,
    height: 90,
    borderRadius: 15,
    resizeMode: 'contain',
  },
  levelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelLabel: {
    marginBottom: 5,
  },
  levelValue: {
    //backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 5,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  additionalTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  contributionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  contributionText: {
    fontSize: 16,
    color: '#333',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  stepButton: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  valueInput: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 5,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonContainer: {
    //marginTop: 20,
    width: '100%', // Встановлюємо ширину на весь екран
    justifyContent: 'center', // Центрування по горизонталі
    alignItems: 'center', // Центрування по горизонталі
  },
  addButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: '#007AFF', // колір кнопки
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  --------------------------------------------------
  const styles = StyleSheet.create({
  container: {
    padding: 20,

  },
  headerText: {//-------
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  imageLevelContainer: {//-------
    flexDirection: 'row',
    alignItems: 'center',
    //marginBottom: 16,
  },
  imageContainer: {//-------
    width: 110,
    height: 110,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildingImage: {//-------
    width: 100,
    height: 100,
    borderRadius: 15,
    resizeMode: 'contain',
  },
  levelContainer: {//-------
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelLabel: {//-------
    marginBottom: 5,
  },
  levelValue: {//-------
    //backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 5,
  },
  levelText: {//-------
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  additionalTextContainer: {//-------
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  contributionContainer: {//-------
    flex: 1,
    justifyContent: 'center',
  },
  contributionText: {//-------
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {//-------
    width: '100%', // Встановлюємо ширину на весь екран
    justifyContent: 'center', // Центрування по горизонталі
    alignItems: 'center', // Центрування по горизонталі
  },
  addButton: {//-------
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: '#007AFF', // колір кнопки
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {//-------
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderColor: '#007AFF',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dropdown: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderColor: '#007AFF',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#007AFF', // Колір рамки для самого списку вибору
    borderRadius: 8,
  },
  stepperContainer: {//-------
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  stepButton: {//-------
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtonText: {//-------
    fontSize: 16,
    color: '#fff',
  },
  valueInput: {//-------
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 5,
  },
});