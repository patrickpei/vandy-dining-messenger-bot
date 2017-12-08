const cheerio = require('cheerio');
const request = require('superagent');
const jQuery = require('jQuery');

// request.post('https://app.mymenumanager.net/vanderbilt/ajax.php?action=getMenus&calendar_date=2017-12-02')
//     .end((err, res) => {
//         console.log(res.text);
//         // const html = res.text;
//         // const $ = cheerio.load(html);

//         // console.log($('#menumanager_content_container').children());
//         // console.log($('.menu_block'));
//         // $('.menu_block').each((i, el) => {
//         //     console.log(`${i}: ${el}`);
//         // });
//     });

// menumanager_content_container
