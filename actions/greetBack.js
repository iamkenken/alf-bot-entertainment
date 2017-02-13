'use strict';
let session = require('../session');
const config = require('../config');
const FBeamer = require('../fbeamer');
const f = new FBeamer(config.FB);

let randMsg = require('../messages');
const {greeting, alfmsg} = randMsg;
const greetBack = ({sessionId, context, entities}) => {
    let {fbid} = session.get(sessionId);
    console.log(entities);
    return new Promise((resolve, reject) => {
      f.getProfile(fbid)
        .then(profile => {
          const {first_name, timezone} = profile;
          let help_text = `${greeting} ${first_name}, ${alfmsg}`;
          let servicesbuttons = f.servicesbuttons(help_text);
          f.btn(fbid, servicesbuttons);
          //console.log(entities.intent[0].value);
        })
        .catch(error => console.log('Error'+error));

      return resolve(context);
    });


}

module.exports = greetBack;
