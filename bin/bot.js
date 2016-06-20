// bin/bot.js


var WeatherBot = require('../lib/weatherbot');

var token = process.env.BOT_API_KEY;
var name = process.env.BOT_NAME;

var weatherbot = new WeatherBot({
    token: token,
    name: name
});

weatherbot.run();