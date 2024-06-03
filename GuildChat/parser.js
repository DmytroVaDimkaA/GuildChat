import axios from 'axios';
import cheerio from 'cheerio';

export async function parseData() {
  try {
    const response = await axios.get('https://foe.scoredb.io/Worlds');
    const $ = cheerio.load(response.data);

    const serversByCountry = {};

    const serverList = $('ul.navbar-nav:has(a:contains("Servers"))');

    serverList.find('.dropdown').each((i, countryDropdown) => {
      const country = $(countryDropdown).find('.dropdown-item:first-child img').attr('alt');
      const flagUrl = 'https://foe.scoredb.io' + $(countryDropdown).find('.dropdown-item:first-child img').attr('src');

      serversByCountry[country] = [];

      $(countryDropdown).find('.dropdown-menu .dropdown-item').each((j, serverItem) => {
        if ($(serverItem).find('img').length === 0) {
          const serverName = $(serverItem).text().trim();
          const serverUrl = $(serverItem).attr('href');

          // Обрезаем начало адреса и переименовываем ключ
          serversByCountry[country].push({ 
            name: serverName, 
            server_name: serverUrl.replace('https://foe.scoredb.io/', '') 
          });
        }
      });
    });

    return serversByCountry;
  } catch (error) {
    console.error('Ошибка при парсинге:', error);
    throw error;
  }
}
