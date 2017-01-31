'use strict';
let session = require('../session');
const config = require('../config');
const FBeamer = require('../fbeamer');
const f = new FBeamer(config.FB);

let randMsg = require('../messages');
let greetrandNum = Math.floor((Math.random() * Object.keys(randMsg.greeting.message).length) + 0);
let alfrandNum = Math.floor((Math.random() * Object.keys(randMsg.alfmsg.message).length) + 0);
const greeting = randMsg.greeting.message[greetrandNum];
const alfmsg = randMsg.alfmsg.message[alfrandNum];
const greetBack = ({sessionId, context, entities}) => {
    let {fbid} = session.get(sessionId);
    console.log(entities);
    return new Promise((resolve, reject) => {
      f.getProfile(fbid)
        .then(profile => {
          const {first_name, timezone} = profile;
          let help_text = `${greeting} ${first_name}, ${alfmsg}`;
          let servicesbuttons = f.servicesbuttons(help_text);
          f.quick(fbid, servicesbuttons);
          //console.log(entities.intent[0].value);
        })
        .catch(error => console.log(error));

      return resolve(context);
    });


}

module.exports = greetBack;
