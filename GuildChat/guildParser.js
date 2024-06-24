const fetch = require('node-fetch');
const cheerio = require('cheerio');

const parseGuildData = async (url) => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const guildData = [];

    // Extract guild member data from table rows
    $('table.table tbody tr:nth-child(2n)').each((index, element) => {
      const row = $(element);

      const name = row.find('td:nth-child(2) a').text().trim();
      const imageUrl = row.find('td:nth-child(2) a img').attr('src');
      const linkUrl = row.find('td:nth-child(2) a').attr('href');
      const battles = row.find('td:nth-child(3) i').attr('data-battles');
      const points = row.find('td:nth-child(3) i').attr('data-points');

      guildData.push({
        name,
        imageUrl,
        linkUrl,
        battles,
        points,
      });
    });

    // Extract content of <b> within <h6> with class "small avatar-clan-caption"
    const clanCaption = $('h6.small.avatar-clan-caption b').text().trim();

    // Return success and the parsed data
    return { success: true, data: guildData, clanCaption };
  } catch (error) {
    // Return failure and the error message
    return { success: false, error: error.message }; 
  }
};

module.exports = { parseGuildData };
