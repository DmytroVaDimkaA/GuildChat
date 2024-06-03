import axios from 'axios';
import cheerio from 'cheerio';

export async function parseData() {
  try {
    const response = await axios.get('https://foe.scoredb.io/Worlds');
    const $ = cheerio.load(response.data);

    const serversByCountry = {};

    const serverList = $('ul.navbar-nav:has(a:contains("Servers"))');

    serverList.find('.dropdown').each((i, countryDropdown) => {
      const $countryDropdown = $(countryDropdown);
      const $img = $countryDropdown.find('.dropdown-item:first-child img');

      // Проверяем наличие изображения флага
      if ($img.length > 0) {
        const country = $img.attr('alt');
        const flagUrl = 'https://foe.scoredb.io' + $img.attr('src');

        serversByCountry[country] = [];

        $countryDropdown.find('.dropdown-menu .dropdown-item').each((j, serverItem) => {
          if ($(serverItem).find('img').length === 0) {
            const serverName = $(serverItem).text().trim();
            const serverUrl = $(serverItem).attr('href');
            serversByCountry[country].push({ name: serverName, server_name: serverUrl.replace('https://foe.scoredb.io/', '') });
          }
        });
      }
    });

    return serversByCountry;
  } catch (error) {
    console.error('Ошибка при парсинге:', error);
    throw error;
  }
}

