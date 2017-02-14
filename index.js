const unirest  = require("unirest");
const cheerio  = require('cheerio');
const moment   = require('moment');
const timezone = 7 * 60; //vietnam
const renewSentMsg = 7 * 86400000; //7 days in ms

let sentMsg = [];
let lastTimeSentMsg;

console.log('Running interval loop\n');

let notifyKhuyenmaiNew = function(){
	//log when
	let at = moment().utcOffset(timezone).format('DD-MM-YYY HH:mm:ss');
	console.log(`[${at}] check 'khyen mai' news\n`);
	//do craw to mobiphone page
	let  req = unirest("GET", "http://dichvumobifone.com/khuyen-mai");
	req.headers({});
	req.end(function(res) {
	    if (res.error) throw new Error(res.error);

	    let $ = cheerio.load(res.body);
	    let contentSelector = 'body > div.wrap-content > div > div > div.col-md-9.content';
	    let newsTitle = $(contentSelector)
		    				.find('h3 > a')
		    				.map(function(){
		    					return $(this).text().toLowerCase();
		    				})
		    				.toArray();
		    				;

		let khuyenmaiNews = newsTitle
								.filter(title => {
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
		let now = Number(moment().format('x')); //get timestamp
		let gap =  now - (lastTimeSentMsg | 0);
		if(gap > renewSentMsg){
			console.log('Re new message');
			sentMsg = [];
		}

		khuyenmaiNews = khuyenmaiNews
							.filter(news => {
								if(sentMsg.includes(news))
									return false;

								return true;
							});


		if(khuyenmaiNews.length <= 0){
			console.log('no news\n');
			return false;
		}

		//update lastTimeSentMsg
		lastTimeSentMsg = now;

		// build msg to sent
		let slackMsgFields = khuyenmaiNews
								.map(title => {
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
						color: '#4A148C',
						footer: '“Talk is cheap. Show me the code.” - Linus Torvalds',
						footer_icon: 'https://tinker.press/favicon-32x32.png',
						ts: Math.floor(new Date().getTime() / 1000)
					}
				]
			};

		let slackHookUrl = require('./config').slackHookUrl;
		var req = unirest("POST", slackHookUrl);
		req.headers({});

	  	req.send(JSON.stringify(slackMsg));

		req.end(function (res) {
		  if (res.error) throw new Error(res.error);
		  console.log(`Post to slack hook status: ${res.body}\n`);
		});
	});
}

setInterval(function(){
	notifyKhuyenmaiNew();
}, 86400000); //run one time each day

if(process.env.DEBUG)
	notifyKhuyenmaiNew();