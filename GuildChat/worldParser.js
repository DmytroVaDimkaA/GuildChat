import axios from 'axios';
import cheerio from 'cheerio';

async function parseDataNew(selectedCountryName) {
  try {
    const response = await axios.get('https://foe.scoredb.io/Worlds');
    const $ = cheerio.load(response.data);

    const worlds = [];

    // Находим элемент .dropdown-item, содержащий название выбранной страны
    const countryItem = $(`a.dropdown-item:contains("${selectedCountryName}")`);

    // Находим родительский элемент .dropdown
    const parentDropdown = countryItem.closest('.dropdown');

    // Находим вложенный .dropdown-menu внутри родительского .dropdown
    const dropdownMenu = parentDropdown.find('.dropdown-menu');

    // Извлекаем миры только из этого вложенного меню
    dropdownMenu.find('a.dropdown-item').each((_, link) => {
      const worldName = $(link).text().trim();
      let worldUrl = $(link).attr('href');

      // Обрезаем начало ссылки до последнего слеша
      worldUrl = worldUrl.substring(worldUrl.lastIndexOf('/') + 1);

      worlds.push({ name: worldName, url: worldUrl });
    });

    return worlds;
  } catch (error) {
    console.error('Ошибка при парсинге:', error);
    throw error;
  }
}

export { parseDataNew };
