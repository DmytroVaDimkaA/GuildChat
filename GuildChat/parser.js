import axios from 'axios';
import cheerio from 'cheerio';

export async function parseData() {
  try {
    const response = await axios.get('https://foe.scoredb.io/Worlds');
    const $ = cheerio.load(response.data);

    // Используем объект для группировки серверов по странам
    const serversByCountry = {}; 

    const serverList = $('ul.navbar-nav:has(a:contains("Servers"))');

    serverList.find('.dropdown').each((i, countryDropdown) => {
      const country = $(countryDropdown).find('.dropdown-item:first-child img').attr('alt');

      serversByCountry[country] = []; 

      $(countryDropdown).find('.dropdown-menu .dropdown-item').each((j, serverItem) => {
        if ($(serverItem).find('img').length === 0) {
          const serverName = $(serverItem).text().trim();
          const serverUrl = $(serverItem).attr('href');

          serversByCountry[country].push({ 
            name: serverName, 
            server_name: serverUrl.replace('https://foe.scoredb.io/', '') 
          });
        }
      });
    });

    return serversByCountry; // Возвращаем объект
  } catch (error) {
    console.error('Ошибка при парсинге:', error);
    throw error;
  }
}

