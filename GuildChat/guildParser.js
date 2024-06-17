const fetch = require('node-fetch');
const cheerio = require('cheerio');

const parseGuildData = async (url) => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const guildData = [];

    // Отримуємо кожен другий елемент <tr> з тіла таблиці з класом "table"
    $('table.table tbody tr:nth-child(2n)').each((index, element) => {
      const row = $(element);

      // 1. Зміст елементу <a> з другого <td>
      const name = row.find('td:nth-child(2) a').text().trim();

      // 2. Посилання з <img>, що знаходиться в цьому <a>
      const imageUrl = row.find('td:nth-child(2) a img').attr('src');

      // 3. Посилання з цього ж <a>
      const linkUrl = row.find('td:nth-child(2) a').attr('href');

      // 4. Зміст атрибуту "data-battles" з <i>, що знаходиться в третьому <td>
      const battles = row.find('td:nth-child(3) i').attr('data-battles');

      // 5. Зміст атрибуту "data-points" з <i>, що знаходиться в третьому <td>
      const points = row.find('td:nth-child(3) i').attr('data-points');

      // Додаємо отримані дані до масиву
      guildData.push({
        name,
        imageUrl,
        linkUrl,
        battles,
        points
      });
    });

    return guildData;
  } catch (error) {
    console.error("Error parsing guild data:", error);
    throw error;
  }
};

module.exports = { parseGuildData };
