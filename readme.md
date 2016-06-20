##WeatherBot

An adaptation of [norrisbot](https://github.com/lmammino/norrisbot) to provide office weather information - temp and humidity.

Uses slackbots(https://www.npmjs.com/package/slackbots) module.

This repo is linked to a Heroku app from which it's deployed to our company's internal Slack site.

The app grabs a temp/humidity reading from a db that's populated every minute by a 
Photon(https://docs.particle.io/datasheets/photon-datasheet/) inside the office, using a
DH22(https://www.adafruit.com/product/385) temp/humidity sensor.

##Commands

The app responds to either the text "weatherbot" or "@weatherbot" in a Slack message, or via a direct Slack message to @weatherbot.

It replies to messages containing "help" or "status", the latter providing a text summary of the most recent 
temp/humidity readings to the user.
