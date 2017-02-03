'use strict';
const request = require('request');
const crypto = require('crypto');

class FBeamer {
	constructor(config) {
		try {
			if(!config || config.PAGE_ACCESS_TOKEN === undefined || config.VERIFY_TOKEN === undefined || config.APP_SECRET === undefined) {
				throw new Error("Unable to access tokens!");
			} else {
				this.PAGE_ACCESS_TOKEN = config.PAGE_ACCESS_TOKEN;
				this.VERIFY_TOKEN = config.VERIFY_TOKEN;
				this.APP_SECRET = config.APP_SECRET;
			}
		} catch(e) {
			console.log(e);
		}
	}

	registerHook(req, res) {
		// If req.query.hub.mode is 'subscribe'
		// and if req.query.hub.verify_token is the same as this.VERIFY_TOKEN
		// then send back an HTTP status 200 and req.query.hub.challenge
		console.log(req.query);
		// let {
		// 	mode,
		// 	verify_token,
		// 	challenge
		// } = req.query.hub;
		let mode = req.query["hub.mode"], verify_token = req.query["hub.verify_token"], challenge = req.query["hub.challenge"];
		if(mode === 'subscribe' && verify_token === this.VERIFY_TOKEN) {
			return res.end(challenge);
		} else {
			console.log("Could not register webhook!");
			return res.status(403).end();
		}
	}

	verifySignature(req, res, next) {
		if(req.method === 'POST') {
			let signature = req.headers['x-hub-signature'];
			try {
				if(!signature) {
					throw new Error("Signature missing!");
				} else {
					let hash = crypto.createHmac('sha1', this.APP_SECRET).update(JSON.stringify(req.body)).digest('hex');
					try {
						if(hash !== signature.split("=")[1]) {
							throw new Error("Invalid Signature");
						}
					} catch(e) {
							res.sendStatus(500, e);
						}
				}
			} catch(e) {
				res.sendStatus(500, e);
			}
		}

		return next();

	}

	subscribe() {
		request({
			uri: 'https://graph.facebook.com/v2.6/me/subscribed_apps',
			qs: {
				access_token: this.PAGE_ACCESS_TOKEN
			},
			method: 'POST'
		}, (error, response, body) => {
			if(!error && JSON.parse(body).success) {
				console.log("Subscribed to the page!");
			} else {
				console.log(error);
			}
		});
	}

	getProfile(id) {
		return new Promise((resolve, reject) => {
			request({
				uri: `https://graph.facebook.com/v2.7/${id}`,
				qs: {
					access_token: this.PAGE_ACCESS_TOKEN
				},
				method: 'GET'
			}, (error, response, body) => {
				if(!error & response.statusCode === 200) {
					resolve(JSON.parse(body));
				} else {
					reject(error);
				}
			});
		});
	}

	incoming(req, res, cb) {
		// Extract the body of the POST request
		let data = req.body;
		if(data.object === 'page') {
			// Iterate through the page entry Array
			data.entry.forEach(pageObj => {
				// Iterate through the messaging Array
				pageObj.messaging.forEach(msgEvent => {
					let messageObj = {
						sender: msgEvent.sender.id,
						timeOfMessage: msgEvent.timestamp,
						message: msgEvent.message || undefined,
						postback: msgEvent.postback || undefined,
						quick_reply: msgEvent.message === undefined ? undefined : msgEvent.message.quick_reply || undefined,
					}
					cb(messageObj);
				});
			});
		}
		res.sendStatus(200);
	}

	sendMessage(payload) {
		return new Promise((resolve, reject) => {
			// Create an HTTP POST request
			request({
				uri: 'https://graph.facebook.com/v2.6/me/messages',
				qs: {
					access_token: this.PAGE_ACCESS_TOKEN
				},
				method: 'POST',
				json: payload
			}, (error, response, body) => {
				if(!error && response.statusCode === 200) {
					resolve({
						messageId: body.message_id
					});
				} else {
					reject(error);
				}
			});
		});
	}

	// Show Persistent Menu
	showPersistent(payload) {
		let obj = {
			setting_type: "call_to_actions",
			thread_state: "existing_thread",
			call_to_actions: payload
		}

		request({
			uri: 'https://graph.facebook.com/v2.6/me/thread_settings',
			qs: {
				access_token: this.PAGE_ACCESS_TOKEN
			},
			method: 'POST',
			json: obj
		}, (error, response) => {
			if(error) {
				console.log(error);
			}
		});
	}

	// Send a text message
	txt(id, text) {
		let obj = {
			recipient: {
				id
			},
			message: {
				text
			}
		}

		this.sendMessage(obj)
			.catch(error => console.log(error));

		return true;

	}

	// Send an image message
	img(id, url) {
		let obj = {
			recipient: {
				id
			},
			message: {
				attachment: {
					type: 'image',
					payload: {
						url
					}
				}
			}
		}

		this.sendMessage(obj)
			.catch(error => console.log(error));

		return true;
	}

	quick(id, message) {
		let obj = {
			recipient: {
				id
			},
			message
		}
		this.sendMessage(obj)
			.catch(error => console.log('I am '+error));
	}

	btn(id, data) {
		let obj = {
			recipient: {
				id
			},
			message: {
				attachment: {
					type: 'template',
					payload: {
						template_type: 'button',
						text: data.text,
						buttons: data.buttons
					}
				}
			}
		}

		this.sendMessage(obj)
			.catch(error => console.log(error));
	}

	generic(id, data) {
		let obj = {
			recipient: {
				id
			},
			message: {
				attachment: {
					type: 'template',
					payload: {
						template_type: 'generic',
						elements: data
					}
				}
			}
		}

		this.sendMessage(obj)
			.catch(error => console.log(error));
	}

	senderAction(id) {
		let obj = {
			recipient: { id
			},
			sender_action: "typing_on"
		}

		this.sendMessage(obj)
			.catch(error => console.log(error));
	}

	//SEND API list template
	list(id, data) {
		let obj = {
			recipient: {
				id
			},
			message: {
				attachment: {
					type: 'template',
					payload: {
						template_type: 'list',
						elements: data.elements,
						buttons: data.buttons
					}
				}
			}
		}

		this.sendMessage(obj)
			.catch(error => console.log(error));
	}



	servicesquick(text) {
		let buttons ={
	    "text":text,
	    "quick_replies":[
	      {
	        "content_type":"text",
	        "title":"Movies",
	        "payload":"MENU_MOVIES"
	      },
				{
	        "content_type":"text",
	        "title":"TV Shows",
	        "payload":"MENU_TV"
	      },
				{
	        "content_type":"text",
	        "title":"Events",
	        "payload":"MENU_EVENTS"
	      }
	    ]
	  };

		return buttons;
	}

	servicesbuttons(text) {
		let buttons ={
	    "text":text,
	    "buttons":[
	      {
	        "type":"postback",
	        "title":"Movies",
	        "payload":"MENU_MOVIES"
	      },
				{
	        "type":"postback",
	        "title":"TV Shows",
	        "payload":"MENU_TV"
	      },
				{
	        "type":"postback",
	        "title":"Events",
	        "payload":"MENU_EVENTS"
	      }
	    ]
	  };

		return buttons;
	}

	moviesdata(text) {
		let data ={
			"text":text,
			"buttons":[
			  {
			    "type":"postback",
			    "title":"Theaters",
			    "payload":"MENU_THEATERS"
			  },
			  {
			    "type":"postback",
			    "title":"Online",
			    "payload":"MENU_ONLINE"
			  },
			  {
			    "type":"postback",
			    "title":"TV/Cable",
			    "payload":"MENU_CABLE"
			  }
			]
		};

		return data;
	}

	theatersdata(text) {
		let data ={
			"text":text,
			"buttons":[
			  {
			    "type":"postback",
			    "title":"Now Showing",
			    "payload":"MENU_NOW_SHOWING"
			  },
			  {
			    "type":"postback",
			    "title":"Next Attraction",
			    "payload":"MENU_NEXT_ATTRACTION"
			  },
			  {
			    "type":"postback",
			    "title":"Coming Soon",
			    "payload":"MENU_COMING_SOON"
			  }
			]
		};

		return data;
	}

	nsbtn(text) {
		let data ={
			"text":text,
			"buttons":[
			  {
			    "type":"postback",
			    "title":"Next Attraction",
			    "payload":"MENU_NEXT_ATTRACTION"
			  },
			  {
			    "type":"postback",
			    "title":"Coming Soon",
			    "payload":"MENU_COMING_SOON"
			  }
			]
		};

		return data;
	}

	nabtn(text) {
		let data ={
			"text":text,
			"buttons":[
			  {
			    "type":"postback",
			    "title":"Now Showing",
			    "payload":"MENU_NOW_SHOWING"
			  },
			  {
			    "type":"postback",
			    "title":"Coming Soon",
			    "payload":"MENU_COMING_SOON"
			  }
			]
		};

		return data;
	}

	csbtn(text) {
		let data ={
			"text":text,
			"buttons":[
			  {
			    "type":"postback",
			    "title":"Now Showing",
			    "payload":"MENU_NOW_SHOWING"
			  },
			  {
			    "type":"postback",
			    "title":"Next Attraction",
			    "payload":"MENU_NEXT_ATTRACTION"
			  }
			]
		};

		return data;
	}

	listdata() {
		let data = {
			elements: [
				{
				    "title": "Classic T-Shirt Collection",
				    "image_url": "https://eastridgecenter.com/wp-content/uploads/2016/03/Movie-Releases.jpg",
				    "subtitle": "See all our colors",
				    "buttons": [
				        {
				            "title": "Trailer",
				            "type": "postback",
				            "payload": "payload",
				        },
				        {
				            "title": "More Info",
				            "type": "postback",
				            "payload": "payload"
				        }
				    ]
				},
				{
				    "title": "Classic T-Shirt Collection",
				    "image_url": "https://eastridgecenter.com/wp-content/uploads/2016/03/Movie-Releases.jpg",
				    "subtitle": "See all our colors",
				    "buttons": [
				        {
				            "title": "View",
				            "type": "postback",
				            "payload": "payload"
				        }
				    ]
				}
			],
			buttons: [
				{
				    "title": "View More",
				    "type": "postback",
				    "payload": "payload"
				}
			]
		}

		return data;
	}

	nowshowingdatageneric(movies) {
		let data = [];
		//console.log(movies.length);
		for(let i = 0, len = movies.length; i < len; i++) {
			data.push({
				"title": movies[i].title,
				"image_url":movies[i].poster,
				"subtitle": movies[i].plot.substring(0, 50)+'...\nRating: ★★★★☆',
				"buttons":[
					{
						"type": "web_url",
						"title": "See Trailer",
						"url": "https://google.com",
						"webview_height_ratio": "tall"
					},
					{
						"type": "web_url",
						"title": "Where to Watch",
						"url": "https://google.com",
						"webview_height_ratio": "tall"
					},
					{
						"type": "web_url",
						"title": "Movie Info",
						"url": "https://google.com",
						"webview_height_ratio": "tall"
					}
				]
			});
			if(len === data.length) {
				data.push({
				"title": 'Script/Instruction here..',
				"buttons":[
					{
						"type": "postback",
						"title": "Show More",
						"payload": "payload"
					}
				]
			});
			}
		}
		return data;
	}

	csMovies(movies) {
		let data = [];
		//console.log(movies.length);
		for(let i = 0, len = movies.length; i < len; i++) {
			data.push({
				"title": movies[i].title,
				"image_url":movies[i].poster,
				"subtitle": movies[i].plot.substring(0, 50)+'...\nRating: ★★★★☆',
				"buttons":[
					{
						"type": "web_url",
						"title": "Trailer",
						"url": "https://google.com",
						"webview_height_ratio": "tall"
					},
					{
						"type": "web_url",
						"title": "Movie Info",
						"url": "https://google.com",
						"webview_height_ratio": "tall"
					}
				]
			});
			if(len === data.length) {
				data.push({
				"title": 'Script/Instruction here..',
				"buttons":[
					{
						"type": "postback",
						"title": "Show More",
						"payload": "payload"
					}
				]
			});
			}
		}
		return data;
	}

	onlineFeaturedData(movies) {
		let data = [];
		//console.log(movies.length);
		for(let i = 0, len = movies.length; i < len; i++) {
			data.push({
				"title": movies[i].title,
				"image_url":movies[i].poster,
				"subtitle": movies[i].plot.substring(0, 50)+'...\nRating: ★★★★☆',
				"buttons":[
					{
						"type": "web_url",
						"title": "See Trailer",
						"url": "https://google.com",
						"webview_height_ratio": "tall"
					},
					{
						"type": "web_url",
						"title": "Where to Watch",
						"url": "https://google.com",
						"webview_height_ratio": "tall"
					},
					{
						"type": "web_url",
						"title": "Movie Info",
						"url": "https://google.com",
						"webview_height_ratio": "tall"
					}
				]
			});
		}
		return data;
	}

	cableProvidersData() {
		let data = [
			{
			    "title": "Sky Cable",
			    "image_url": "http://2.bp.blogspot.com/-_-uObddnfXs/T7BejeyqA4I/AAAAAAAAEZQ/QDjYgu9tsBI/s1600/skycable_logo.gif",
			    "subtitle": "description here",
			    "buttons": [
			        {
			            "type": "web_url",
						"title": "Select",
						"url": "https://google.com"
			        }
			    ]
			},
			{
			    "title": "Destiny Cable",
			    "image_url": "http://static01.global-free-classified-ads.com/user_images/6890289.jpg",
			    "subtitle": "description here",
			    "buttons": [
			        {
			            "type": "web_url",
						"title": "Select",
						"url": "https://google.com"
			        }
			    ]
			},
			{
			    "title": "Cignal",
			    "image_url": "http://vmobilecavitephilippines.weebly.com/uploads/1/3/1/0/13101774/8059610_orig.jpg",
			    "subtitle": "description here",
			    "buttons": [
			        {
			            "type": "web_url",
						"title": "Select",
						"url": "https://google.com"
			        }
			    ]
			}
		]

		return data;
	}


	cableFeaturedData(movies) {
		let data = [];
		//console.log(movies.length);
		for(let i = 0, len = movies.length; i < len; i++) {
			data.push({
				"title": movies[i].title,
				"image_url":movies[i].poster,
				"subtitle": movies[i].plot.substring(0, 50)+'...\nRating: ★★★★☆',
				"buttons":[
					{
						"type": "web_url",
						"title": "See Trailer",
						"url": "https://google.com",
						"webview_height_ratio": "tall"
					},
					{
						"type": "web_url",
						"title": "Where to Watch",
						"url": "https://google.com",
						"webview_height_ratio": "tall"
					},
					{
						"type": "web_url",
						"title": "Movie Info",
						"url": "https://google.com",
						"webview_height_ratio": "tall"
					}
				]
			});
		}
		return data;
	}

	cableBtn(text) {
		let data ={
			"text":text,
			"buttons":[
			  {
			    "type":"web_url",
			    "title":"See Full List",
			    "url":"https://google.com"
			  },
			  {
			    "type":"postback",
			    "title":"Select Provider",
			    "payload":"MENU_CABLE_PROVIDERS"
			  }
			]
		};

		return data;
	}

	tvShowsFeaturedData(movies) {
		let data = [];
		//console.log(movies.length);
		for(let i = 0, len = movies.length; i < len; i++) {
		data.push({
				"title": movies[i].title,
				"image_url":movies[i].poster,
				"subtitle": movies[i].plot,
				"buttons":[
					{
						"type": "web_url",
						"title": "Where to Watch",
						"url": "https://google.com",
						"webview_height_ratio": "tall"
					},
					{
						"type": "web_url",
						"title": "Movie Info",
						"url": "https://google.com",
						"webview_height_ratio": "tall"
					}
				]
			});
		}
		return data;
	}

	onlinebtn(text) {
		let data ={
			"text":text,
			"buttons":[
			  {
			    "type":"web_url",
			    "title":"See Full List",
			    "url":"https://google.com"
			  },
			  {
			    "type":"postback",
			    "title":"Select Provider",
			    "payload":"MENU_ONLINE_PROVIDERS"
			  }
			]
		};

		return data;
	}

	onlineProvidersBtn(text) {
		let data = [
			{
			    "title": "NETFLIX",
			    "image_url": "https://lh4.googleusercontent.com/BbqN8GpAephpCNwTBuB8SiFTPT1zFccYyuPd4qRRQRTQPXU5d4F1wuVWfEJh3L4RL3wIKc6BeQ=s640-h400-e365",
			    "subtitle": "description here",
			    "buttons": [
			        {
			            "title": "Select",
			            "type": "web_url",
			            "url": "https://netflix.com",
						"webview_height_ratio": "tall"
			        }
			    ]
			},
			{
			    "title": "HOOQ",
			    "image_url": "https://technoladyinmanila.files.wordpress.com/2015/10/hooq-logo-yellow.png",
			    "subtitle": "description here",
			    "buttons": [
			        {
			            "title": "Select",
			            "type": "web_url",
			            "url": "https://hooq.tv",
						"webview_height_ratio": "tall"
			        }
			    ]
			},
			{
			    "title": "IMOVIE",
			    "image_url": "http://www.techmagnetism.com/wp-content/uploads/2016/02/maxresdefault-2.jpg",
			    "subtitle": "description here",
			    "buttons": [
			        {
			            "title": "Select",
			            "type": "web_url",
			            "url": "https://www.apple.com/imovie/",
						"webview_height_ratio": "tall"
			        }
			    ]
			},
			{
			    "title": "YOUTUBE",
			    "image_url": "https://i.ytimg.com/vi/s5y-4EpmfRQ/maxresdefault.jpg",
			    "subtitle": "description here",
			    "buttons": [
			        {
			            "title": "Select",
			            "type": "web_url",
			            "url": "https://youtube.com",
						"webview_height_ratio": "tall"
			        }
			    ]
			}
		]

		return data;
	}

	tvBtn(text) {
		let data ={
			"text":text,
			"buttons":[
			  {
			    "type":"postback",
			    "title":"Local TV",
			    "payload":"MENU_TV_LOCAL"
			  },
			  {
			    "type":"postback",
			    "title":"Cable Channels",
			    "payload":"MENU_TV_CABLE"
			  }
			]
		};

		return data;
	}

	eventsCategoryBtn(text) {

		let data ={
			"text":text,
			"quick_replies":[
			  {
			    "content_type":"text",
			    "title":"Music",
			    "payload":"MENU_MUSIC"
			  },
			  {
			    "content_type":"text",
			    "title":"Shows",
			    "payload":"MENU_SHOWS"
			  },
			  {
			    "content_type":"text",
			    "title":"Conventions",
			    "payload":"MENU_CONVENTIONS"
			  },
			  {
			    "content_type":"text",
			    "title":"Sports & Lifestyle",
			    "payload":"MENU_SPORTS"
			  },
			  {
			    "content_type":"text",
			    "title":"Campus",
			    "payload":"MENU_CAMPUS"
			  },
			  {
			    "content_type":"text",
			    "title":"Others",
			    "payload":"MENU_EVENTS_OTHER"
			  }
			]
		};

		return data;
	}

	eventsSubCat(text, parentCat) {
		let data;
		switch (parentCat) {
		case 'music':
			data ={
				"text":text,
				"quick_replies":[
				  {
				    "content_type":"text",
				    "title":"Concert",
				    "payload":"MENU_CONCERT"
				  },
				  {
				    "content_type":"text",
				    "title":"Gig",
				    "payload":"MENU_GIG"
				  }
				]
			};
		break;
		case 'conventions':
			data ={
				"text":text,
				"quick_replies":[
				  {
				    "content_type":"text",
				    "title":"Fairs & Exhibit",
				    "payload":"MENU_FAIRS"
				  },
				  {
				    "content_type":"text",
				    "title":"Talks & Workshop",
				    "payload":"MENU_TALKS"
				  },
				  {
				    "content_type":"text",
				    "title":"Conferences",
				    "payload":"MENU_CONFERENCES"
				  }
				]
			};
		break;
		default:
		}

		return data;
	}

	eventsResult() {
		let data = [
			{
				"title": "#HugotPlaylist",
				"image_url": "https://scontent.fmnl3-2.fna.fbcdn.net/v/t1.0-9/15826168_1234402739928825_2155050871105397501_n.jpg?oh=d576f28e337ffdf579ff06376e4f9c4b&oe=590E8486",
				"subtitle": "#HugotPlaylist with Ogie Alcasid, Ai Ai Delas Alas and Erik Santos with Special Guest Solenn Heusaff",
				"buttons":[
					{
						"title": "Ticket Price",
			            "type": "web_url",
			            "url": "https://google.com",
						"webview_height_ratio": "tall"
					},
					{
						"title": "Full Details",
			            "type": "web_url",
			            "url": "https://google.com",
						"webview_height_ratio": "tall"
					},
					{
						"type": "postback",
						"title": "Remind Me",
						"payload": "MENU_EVENT_REMIND"
					}
				]
			},
			{
				"title": "The Vice Ganda Concert",
				"image_url": "https://scontent.fmnl3-2.fna.fbcdn.net/v/t1.0-9/16003209_10155673822828032_6404413788619756976_n.jpg?oh=2b875773e7a6336fdf00d58a502356a7&oe=59050650",
				"subtitle": "It'll surely a fun Valentines show as Vice Ganda takes over the Araneta Coliseum for the fifth time this February!",
				"buttons":[
					{
						"title": "Ticket Price",
			            "type": "web_url",
			            "url": "https://google.com",
						"webview_height_ratio": "tall"
					},
					{
						"title": "Full Details",
			            "type": "web_url",
			            "url": "https://google.com",
						"webview_height_ratio": "tall"
					},
					{
						"type": "postback",
						"title": "Remind Me",
						"payload": "MENU_EVENT_REMIND"
					}
				]
			},
			{
				"title": "Goo Goo Dolls Live in Manila",
				"image_url": "https://scontent.fmnl3-2.fna.fbcdn.net/v/t1.0-9/14716105_10155318615713032_1331906193961180016_n.jpg?oh=b901a02c60c36203c395d685ed420bef&oe=59059B7B",
				"subtitle": "First time ever! Goo Goo Dolls are coming to Manila! Come see their first Manila gig to be held on February 11, 2017 - Smart Araneta Coliseum",
				"buttons":[
					{
						"title": "Ticket Price",
			            "type": "web_url",
			            "url": "https://google.com",
						"webview_height_ratio": "tall"
					},
					{
						"title": "Full Details",
			            "type": "web_url",
			            "url": "https://google.com",
						"webview_height_ratio": "tall"
					},
					{
						"type": "postback",
						"title": "Remind Me",
						"payload": "MENU_EVENT_REMIND"
					}
				]
			}
		];

		return data;
	}

	eventResultBtn(text) {
		let data ={
			"text":text,
			"buttons":[
			  	{
					"title": "See Full List",
		            "type": "web_url",
		            "url": "https://google.com",
					"webview_height_ratio": "tall"
				}
			]
		};

		return data;
	}

	tvLocalResult(movies) {
		let data = [];
		//console.log(movies.length);
		for(let i = 0, len = movies.length; i < len; i++) {
			data.push({
				"title": movies[i].title,
				"image_url":movies[i].poster,
				"subtitle": movies[i].plot.substring(0, 50)+'...\nRating: ★★★★☆',
				"buttons":[
					{
						"type": "web_url",
						"title": "Where to Watch",
						"url": "https://google.com",
						"webview_height_ratio": "tall"
					},
					{
						"type": "web_url",
						"title": "See Details",
						"url": "https://google.com",
						"webview_height_ratio": "tall"
					}
				]
			});
		}
		return data;
	}

	tvLocalBtn(text) {
		let data ={
			"text":text,
			"buttons":[
			  {
			    "type":"web_url",
			    "title":"See Full List",
			    "url":"https://google.com"
			  },
			  {
			    "type":"postback",
			    "title":"Select Provider",
			    "payload":"MENU_TV_LOCAL_PROVIDERS"
			  }
			]
		};

		return data;
	}

	tvCableBtn(text) {
		let data ={
			"text":text,
			"buttons":[
			  {
			    "type":"web_url",
			    "title":"See Full List",
			    "url":"https://google.com"
			  },
			  {
			    "type":"postback",
			    "title":"Select Provider",
			    "payload":"MENU_TV_CABLE_PROVIDERS"
			  }
			]
		};

		return data;
	}

	tvLocalProvidersData() {
		let data = [
			{
			    "title": "ABS CBN",
			    "image_url": "http://www.megacities-go-services.com/var/ezdemo_site/storage/images/media/manila/images-manila/rss-import-logos/abs-cbn-news/84757-3-eng-GB/ABS-CBN-News_facebook_icon_large.jpg",
			    "subtitle": "description here",
			    "buttons": [
			        {
			            "type": "web_url",
						"title": "Select",
						"url": "https://google.com"
			        }
			    ]
			},
			{
			    "title": "GMA",
			    "image_url": "https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/GMA_Network_Logo_Vector.svg/1280px-GMA_Network_Logo_Vector.svg.png",
			    "subtitle": "description here",
			    "buttons": [
			        {
			            "type": "web_url",
						"title": "Select",
						"url": "https://google.com"
			        }
			    ]
			},
			{
			    "title": "TV 5",
			    "image_url": "http://www.tv5.com.ph/images/tv5.jpg",
			    "subtitle": "description here",
			    "buttons": [
			        {
			            "type": "web_url",
						"title": "Select",
						"url": "https://google.com"
			        }
			    ]
			}
		]

		return data;
	}

}

module.exports = FBeamer;
