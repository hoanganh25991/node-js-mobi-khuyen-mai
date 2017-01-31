let  unirest = require("unirest");
let cheerio = require('cheerio');
let moment = require('moment');
const timezone = 7 * 60; //vietnam

let sentMsg = [];

let  req = unirest("GET", "http://dichvumobifone.com/khuyen-mai");
req.headers({});
req.end(function(res) {
    if (res.error) throw new Error(res.error);

    let $ = cheerio.load(res.body);
    let newsTitle = $('body > div.wrap-content > div > div > div.col-md-9.content')
    				.find('h3 > a')
    				.map(function(){
    					return $(this).text().toLowerCase();
    				})
    				.toArray();
    				;
	let khuyenmaiNews = newsTitle.filter(title => {
		let matches = title.match(/(khuyến mãi|thẻ|\d+\/\d+\/\d+)/g);

		if(matches && matches[0] == 'khuyến mãi' && matches[1] == 'thẻ'){
			let date = matches[2];
			date = moment(date, 'D/M/YYYY').utcOffset(timezone);

			if(!date.isValid())
				return false;

			let today = moment().utcOffset(timezone);
			if(date.isAfter(today))
				return true;

			return false;
		}

		return false;
	});

	khuyenmaiNews = khuyenmaiNews.filter(news => {
		if(sentMsg.includes(news))
			return false;

		return true;
	});

	if(khuyenmaiNews.length <= 0){
		console.log('no news');
		return false;
	}


	let slackMsgFields = khuyenmaiNews.map(title => {
		let value = title;
		let short = false;

		return {value, short};
	});

	let slackMsg = {
			text: `--- >>> ---`,
			attachments: [
				{
					// title: '--- >< ---',
					// title_link: 'https://tinker.press',
					fields: slackMsgFields,
					color: '#3381C5',
					footer: '“The best way to predict the future is to create it.” – Peter Drucker  ᕕ( ᐛ )ᕗ',
					footer_icon: 'https://tinker.press/favicon-64x64.png',
					ts: Math.floor(new Date().getTime() / 1000)
				}
			]
		};

	var req = unirest("POST", "https://hooks.slack.com/services/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");
	req.headers({});

  	req.send(JSON.stringify(slackMsg));

	req.end(function (res) {
	  if (res.error) throw new Error(res.error);

	  console.log(res.body);
	});
});