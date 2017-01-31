var unirest = require("unirest");

var req = unirest("GET", "http://dichvumobifone.com/khuyen-mai");
req.headers({});
req.end(function(res) {
    if (res.error) throw new Error(res.error);

    // console.log(res.body);
    let cheerio = require('cheerio')
    let $ = cheerio.load(res.body);
    // let header = $('#header');
    // console.log(header.text());
    let newsTitle = $('body > div.wrap-content > div > div > div.col-md-9.content')
    				.find('h3 > a')
    				// .each(function(){
    				// 	console.log($(this).text());
    				// })
    				// .map(function(){
    				// 	console.log($(this).text());
    				// 	return 1;
    				// });
    				// .map(() => $(this).text())
    				.map(function(){
    					return $(this).text();
    					// return 1;
    				})
    				// .map(() => $(this).text())
    				// .map(title => title.toLowerCase())
    				;
	// console.log(newsTitle);
	// console.log(newsTitle[0].toLowerCase());
	newsTitle = newsTitle.forEach(a => {console.log(a);});
});