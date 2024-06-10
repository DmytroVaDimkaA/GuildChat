// newParser.js

import axios from 'axios';
import cheerio from 'cheerio';

export async function parseDataNew() { // Изменено имя функции на parseDataNew
  try {
    const response = await axios.get('https://foe.scoredb.io/Worlds');
    const $ = cheerio.load(response.data);

    const countries = [];

    // Находим элемент li с классом "nav-item dropdown", содержащий ссылку "Servers"
    const serverList = $('li.nav-item.dropdown:has(a:contains("Servers"))');

    // Находим все элементы .dropdown внутри .dropdown-menu
    serverList.find('.dropdown-menu > .dropdown').each((_, dropdown) => {
      const countryItem = $(dropdown).find('> .dropdown-item:first-child');
      const countryName = countryItem.text().trim();
      const flagUrl = countryItem.find('img').attr('src');

      // Получаем список серверов для данной страны
      const worlds = [];
      $(dropdown).find('.dropdown-menu .dropdown-item:not(:has(img))').each((_, serverItem) => {
        const serverName = $(serverItem).text().trim();
        const serverUrl = $(serverItem).attr('href');

        // Форматируем текст для вывода
        const formattedText = `${serverName} (${serverUrl.substring(0, serverUrl.lastIndexOf('/') + 1)})`;

        worlds.push({
          name: formattedText, // Используем отформатированный текст
          server_name: serverUrl.replace('https://foe.scoredb.io/', ''),
        });
      });

      countries.push({
        name: countryName,
        flag: flagUrl ? `https://foe.scoredb.io${flagUrl}` : null,
        worlds: worlds,
      });
    });

    return countries;
  } catch (error) {
    console.error('Ошибка при парсинге:', error);
    throw error;
  }
}
