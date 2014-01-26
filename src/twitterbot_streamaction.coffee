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
			@start()

		@on "stop", () =>
			@stream.stop()

		@stream_path = "statuses/sample"

	start: () ->
		@stream = @owner.twitter.stream @stream_path
		@stream.on "tweet", (tweet) =>
			for key, value of @streams
				if value(tweet)
					@emit "stream-#{key}", @owner.twitter, tweet
			tweet
		this

	stop: () ->
		@emit "stop"

	listen: (name, match, callback) ->
		action = new TwitterBotAction callback, @owner
		@streams[name] = match
		@on "stream-#{name}", (twitter, tweet) =>
			action.emit "action", twitter, tweet

	setStreamPath: (@stream_path) ->
		this

	getStreamPath: () ->
		@stream_path
		
module.exports.TwitterBotStreamAction = TwitterBotStreamAction