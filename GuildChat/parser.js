import axios from 'axios';
import cheerio from 'cheerio';

export async function parseData() {
  try {
    const response = await axios.get('https://foe.scoredb.io/Worlds');
    const $ = cheerio.load(response.data);

    const servers = [];

    const serverList = $('ul.navbar-nav:has(a:contains("Servers"))');

    serverList.find('.dropdown').each((i, countryDropdown) => {
      const countryServers = [];
      $(countryDropdown).find('.dropdown-menu .dropdown-item').each((j, serverItem) => {
        if ($(serverItem).find('img').length === 0) {
          const serverName = $(serverItem).text().trim();
          const serverUrl = $(serverItem).attr('href');
          countryServers.push({ name: serverName, url: serverUrl });
        }
      });

      servers.push(...countryServers); // Добавляем серверы в общий массив
    });

    return servers;
  } catch (error) {
    console.error('Ошибка при парсинге:', error);
    throw error;
  }
}

