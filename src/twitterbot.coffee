####################################################
# node-twitterbot
# A NodeJS module for creating Twitter Bots
# Nathaniel Kirby <nate@projectspong.com
# https://github.com/nkirby/node-twitterbot
####################################################

fs = require 'fs'
Twit = require 'twit'
eventEmitter = require('events').EventEmitter

class TwitterBot extends eventEmitter
	constructor: (configOrFile) ->
		if typeof configOrFile is "string"
			try
				@config = JSON.parse fs.readFileSync(configOrFile)
			catch e
				throw e
		else
			@config = configOrFile

		@actions = []
		@streamAction = new TwitterBotStreamAction(
			() ->
				@start()
			this
		)
		@setupTwit()

	setupTwit: () ->
		@twitter = new Twit({
			consumer_secret: @config.consumer_secret
			consumer_key: @config.consumer_key
			access_token: @config.access_token
			access_token_secret: @config.access_token_secret	
		})

		this

####################################################
# Tweeting

	tweet: (text, callback) ->
		if typeof text isnt "string"
			return callback {message:"Cannot post a non-string"}, null;

		@twitter.post "statuses/update", {status:text}, (err, response) ->
			if callback and typeof callback is "function"
				callback err, response
		
####################################################
# Actions
	
	addAction: (actionName, callback) ->
		if typeof callback is "function"
			action = new TwitterBotAction callback, this
		else
			action = callback
		action.name = actionName

		@actions.push action
		@on actionName, (params) =>
			action.emit "action", params
		action

	removeAction: (actionName) ->
		@removeAllListeners actionName
		index = @actions.indexOf actionName
		if index > -1
			@actions.splice index, 1

	allActions: (groupName) ->
		actions = []
		for action in @actions
			if groupName
				if action.isPartOfGroup(groupName)
					actions.push action.name
			else
				actions.push action
		actions

	randomAction: (groupName) ->
		actions = @allActions groupName

		actionItem = actions[Math.floor(Math.random()*actions.length)]
		actionItem

	actionWithName: (actionName) ->
		for action in @actions
			if action.name is actionName
				return action
		null


####################################################
# Streaming

	startStreaming: () ->
		@streamAction.start()

	stopStreaming: () ->
		@streamAction.stop()

	listen: (name, match, action) ->
		@streamAction.listen name, match, action

####################################################
# Scheduling

	schedule: (action, timeout) ->
		if not timeout
			return @now action

	now: (action) ->
		if typeof action is "string"
			action = @actionWithName action
		else if typeof action is "function"
			action = new TwitterBotAction callback, this

		action.emit "action", @twitter

module.exports.TwitterBot = TwitterBot