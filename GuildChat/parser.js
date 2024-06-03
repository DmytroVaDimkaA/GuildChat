// parser.js
import axios from 'axios';
import cheerio from 'cheerio';

async function parseData() {
  try {
    const response = await axios.get('https://example.com'); // Замените на нужный URL
    const $ = cheerio.load(response.data);

    // Парсинг данных с помощью cheerio
    const title = $('title').text();
    const links = $('a').map((i, el) => $(el).attr('href')).get();

    console.log('Title:', title);
    console.log('Links:', links);
  } catch (error) {
    console.error('Ошибка при парсинге:', error);
  }
}
