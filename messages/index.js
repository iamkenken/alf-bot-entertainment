'use strict';

let greeting = { 'message': { '0': 'Hi', '1': 'Hey', '2': 'Hello', '3': 'Howdy', '4': 'Kumusta' }};

let alfmsg = {
	'message': {
		'0': 'Alf is always at your service! :) What entertainment 🎉 do you like me to find?',
		'1': 'Welcome! Nice to see you here. :) My name is Alf and I will help you find events, movies and tv shows. 🎉🎉🎉'
	}
}

let thanks = {
	'message': {
		'0': 'Cool 👍. Alf is always at your service 🎉:)',
		'1': 'Alf is always at your service. Hope I could help a bit. See ya! 🎉:)',
		'2': 'Alf is always at your service. Hope I could help a bit. 👍 See ya! 🎉:)'
	}
}

let bye = {
	'message': {
		'0': 'Cool. Alf is always at your service. ✋ Bye',
		'1': 'Alf is always at your service. Hope I could help a bit. See ya! ✋',
		'2': 'Alf is always at your service. Hope I could help a bit. ✋ See ya!',
		'3': 'Alf is always at your service. Hope I could help a bit. ✋ See ya!',
		'4': 'Alf is always at your service. Hope I could help a bit. ✋ See ya!',
		'5': 'Alf is always at your service. Hope I could help a bit. ✋ See ya!'
	}
}

let moviemsgx = 'Great, I see that you like movies 🎥 as I do. Please select option below.';
let moviemsg = 'script/instruction here';
let theatersmsgx = 'You can type the name of the movie or select one of the option below "Now Showing" or "Coming Soon"?';
let theatersmsg = 'script/instruction here';
let tvmsgx = 'Great, I see that you like tv shows 🎥 as I do . Please type the name of the tv show or select one of the option below.';
let tvmsg = 'script/instruction here';
let eventmsg = 'script here';
let cablemsg = 'script here';

module.exports = {
	greeting,
	alfmsg,
	thanks,
	bye,
	moviemsg,
	eventmsg,
	tvmsg,
	theatersmsg,
	cablemsg
}