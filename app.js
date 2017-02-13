'use strict';
// create an API server
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');
const PORT = process.env.PORT || 5000;

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// Process application/json
app.use(bodyParser.json())
app.use((req, res, next) => f.verifySignature(req, res, next));

const config = require('./config');
// FB Messenger Webhooks, Send API
const FBeamer = require('./fbeamer');
const f = new FBeamer(config.FB);

//URLs
const API_URL = config.API_URL;
const WEB_URL = config.WEB_URL;
const DIR_IMAGE_URL = config.DIR_IMAGE_URL;

// Custom payload
const postbacks = require('./postbacks');
const p = new postbacks();

// Session
const session = require('./session');
// WIT Actions
const actions = require('./actions')(session, f);

// WIT.AI
const Wit = require('node-wit').Wit;
const wit = new Wit({
	accessToken: config.WIT_ACCESS_TOKEN,
	actions
});

// Register the webhooks
app.get('/', (req, res, next) => {
	f.registerHook(req, res);
	return next();
});

// Handle incoming
app.post('/', (req, res, next) => {
	f.incoming(req, res, msg => {
		const {
			sender,
			postback,
			message,
		} = msg;
		//console.log(res);
		//turn typing indicators on
		f.senderAction(sender);

		//Custom Payload
		if(postback || message.quick_reply) {
			let user_defined_payload = postback ? postback.payload : message.quick_reply.payload;
			let sessionId = session.init(sender);
			let {context} = session.get(sessionId);
			switch(user_defined_payload) {
				case 'GET_STARTED':
					p.getstarted(sender, f, API_URL, WEB_URL);
					context.action = 'get_started';
					session.update(sessionId, context);
				break;
				case 'MENU_MOVIES':
					p.movies(sender, f);
					context.action = 'movies';
					session.update(sessionId, context);
				break;
				case 'MENU_THEATERS_MOVIES':
					p.theaters(sender, f);
					context.action = 'movies';
					session.update(sessionId, context);
				break;
				case 'MENU_NOW_SHOWING':
					p.nowshowinggeneric(sender, f);
					context.action = 'now_showing';
					session.update(sessionId, context);
				break;
				case 'MENU_NEXT_ATTRACTION':
					p.nextattraction(sender, f);
					context.action = 'now_showing';
					session.update(sessionId, context);
				break;
				case 'MENU_COMING_SOON':
					p.comingsoon(sender, f);
					context.action = 'coming_soon';
					session.update(sessionId, context);
				break;
				case 'MENU_ONLINE_MOVIES':
					p.featuredOnline(sender, f);
					context.action = 'online';
					session.update(sessionId, context);
				break;
				case 'MENU_ONLINE_PROVIDERS':
					p.onlineProviders(sender, f);
					context.action = 'online';
					session.update(sessionId, context);
				break;
				case 'MENU_CABLE_MOVIES':
					p.cableFeatured(sender, f);
					context.action = 'cable';
					session.update(sessionId, context);
				break;
				case 'MENU_CABLE_PROVIDERS':
					p.cableProviders(sender, f);
					context.action = 'cable';
					session.update(sessionId, context);
				break;
				case 'MENU_EVENTS':
					p.events(sender, f);
				break;
				case 'MENU_MUSIC':
					p.eventsCategories(sender, f, 'music');
				break;
				case 'MENU_SHOWS':
					p.showEvents(sender, f);
				break;
				case 'MENU_CONVENTIONS':
					p.eventsCategories(sender, f, 'conventions');
				break;
				case 'MENU_SPORTS':
					p.showEvents(sender, f);
				break;
				case 'MENU_CAMPUS':
					p.showEvents(sender, f);
				break;
				case 'MENU_EVENT_OTHER':
					p.showEvents(sender, f);
				break;
				case 'MENU_GIG':
					p.showEvents(sender, f);
				break;
				case 'MENU_CONCERT':
					p.showEvents(sender, f);
				break;
				case 'MENU_FAIRS':
					p.showEvents(sender, f);
				break;
				case 'MENU_TALKS':
					p.showEvents(sender, f);
				break;
				case 'MENU_CONFERENCES':
					p.showEvents(sender, f);
				break;
				case 'MENU_TV':
					p.tv(sender, f);
					context.action = 'tv';
					session.update(sessionId, context);
				break;
				case 'MENU_TV_LOCAL':
					p.tvLocal(sender, f);
					context.action = 'tv';
					session.update(sessionId, context);
				break;
				case 'MENU_TV_LOCAL_PROVIDERS':
					p.tvLocalProviders(sender, f);
				break;
				case 'MENU_TV_CABLE':
					p.tvCable(sender, f);
					context.action = 'tv';
					session.update(sessionId, context);
				break;
				case 'MENU_TV_CABLE_PROVIDERS':
					p.tvCableProviders(sender, f);
				break;
				default:
					f.txt(sender, 'Sorry, please check back later.');
				break;
			}
		} else if(message && message.text !== '') {
			let sessionId = session.init(sender);
			let {context} = session.get(sessionId);
			let msgtxt = message.text.toLowerCase();

			wit.runActions(sessionId, message.text, context)
			.then(ctx => {
				// Delete session if the conversation is over
				ctx.jobDone ? session.delete(sessionId) : session.update(sessionId, ctx);
				//console.log(ctx);
			})
			.catch(error => console.log(`Error: ${error}`));
		} else {
			f.txt(sender, 'Sorry, please check back laterx.')
		}


	});
	return next();
});


// Persistent Menu
f.showPersistent([
	{
		type: "postback",
		title: "Movies",
		payload: "MENU_MOVIES"
	},
	{
		type: "postback",
		title: "TV Shows",
		payload: "MENU_TV"
	},
	{
		type: "postback",
		title: "Events",
		payload: "MENU_EVENTS"
	}
]);

// Subscribe
f.subscribe();

app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}!`)
});
