'use strict';
let session = require('../session');
const config = require('../config');
const FBeamer = require('../fbeamer');
const f = new FBeamer(config.FB);

let randMsg = require('../messages');
let {bye} = randMsg;
const byeBack = ({sessionId, context, entities}) => {
    let {fbid} = session.get(sessionId);
    console.log(entities);
    return new Promise((resolve, reject) => {
      f.getProfile(fbid)
        .then(profile => {
          const {first_name, timezone} = profile;
          f.txt(fbid, bye);
        })
        .catch(error => console.log(error));

      return resolve(context);
    });
}

module.exports = byeBack;
