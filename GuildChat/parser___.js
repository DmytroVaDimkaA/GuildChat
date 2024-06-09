import axios from 'axios';
import cheerio from 'cheerio';

export async function parseData() {
  try {
    const response = await axios.get('https://foe.scoredb.io/Worlds');
    const $ = cheerio.load(response.data);

    const servers = [];

    // Находим все элементы dropdown, содержащие серверы
    $('.dropdown:has(.dropdown-menu .dropdown-item)').each((i, dropdown) => {
      // Находим название страны (оно находится в элементе .dropdown-item с изображением флага)
      const countryItem = $(dropdown).find('.dropdown-item:has(img.menu-flag)');
      const countryName = countryItem.text().trim();

      // Находим все элементы списка серверов внутри этого dropdown
      $(dropdown).find('.dropdown-menu .dropdown-item:not(:has(img))').each((j, serverItem) => {
        const serverName = $(serverItem).text().trim();
        const serverUrl = $(serverItem).attr('href');

        servers.push({
          name: serverName,
          server_name: serverUrl.replace('https://foe.scoredb.io/', ''),
          country: countryName,
        });
      });
    });

    return servers;
  } catch (error) {
    console.error('Ошибка при парсинге:', error);
    throw error;
  }
}
