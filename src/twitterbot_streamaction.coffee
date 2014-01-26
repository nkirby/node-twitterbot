####################################################
# node-twitterbot
# A NodeJS module for creating Twitter Bots
# Nathaniel Kirby <nate@projectspong.com
# https://github.com/nkirby/node-twitterbot
####################################################

eventEmitter = require('events').EventEmitter

class TwitterBotStreamAction extends TwitterBotAction
	init: () ->
		@streams = {}

		@on "start", () =>
			@stream = @owner.twitter.stream "statuses/sample"
			@stream.on "tweet", (tweet) =>
				for key, value of @streams
					if value(tweet)
						@emit "stream-#{key}", @owner.twitter, tweet
				tweet
			this

		@on "stop", () =>
			@stream.stop()

	start: () ->
		@emit "start"

	stop: () ->
		@emit "stop"

	listen: (name, match, callback) ->
		action = new TwitterBotAction callback, @owner
		@streams[name] = match
		@on "stream-#{name}", (twitter, tweet) =>
			action.emit "action", twitter, tweet

module.exports.TwitterBotStreamAction = TwitterBotStreamAction