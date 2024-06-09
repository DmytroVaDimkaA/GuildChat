import axios from 'axios';
import cheerio from 'cheerio';

export async function parseData() {
  try {
    const response = await axios.get('https://foe.scoredb.io/Worlds');
    const $ = cheerio.load(response.data);

    const countries = [];

    const serverList = $('li.nav-item.dropdown:has(a:contains("Servers"))');

    serverList.find('.dropdown-menu > .dropdown').each((_, dropdown) => {
      const countryItem = $(dropdown).find('> .dropdown-item:first-child'); // Выбираем элемент с флагом
      const countryName = countryItem.text().trim();
      const flagUrl = countryItem.find('img').attr('src'); // Получаем URL флага

      countries.push({
        name: countryName,
        flag: flagUrl ? `https://foe.scoredb.io${flagUrl}` : null, // Добавляем полный URL флага
      });
    });

    return countries;
  } catch (error) {
    console.error('Ошибка при парсинге:', error);
    throw error;
  }
}

