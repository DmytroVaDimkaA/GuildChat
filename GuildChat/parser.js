import axios from 'axios';
import cheerio from 'cheerio';

export async function parseData() {
  try {
    const response = await axios.get('https://foe.scoredb.io/Worlds');
    const $ = cheerio.load(response.data);

    const countries = [];

    // Находим элемент li с классом "nav-item dropdown", содержащий ссылку "Servers"
    const serverList = $('li.nav-item.dropdown:has(a:contains("Servers"))'); 

    // Находим все элементы .dropdown внутри .dropdown-menu
    serverList.find('.dropdown-menu .dropdown').each((_, dropdown) => {
      // Извлекаем название страны из первого элемента .dropdown-item внутри .dropdown
      const countryName = $(dropdown).find('.dropdown-item:first-child').text().trim();
      countries.push(countryName);
    });

    return countries;
  } catch (error) {
    console.error('Ошибка при парсинге:', error);
    throw error; 
  }
}
