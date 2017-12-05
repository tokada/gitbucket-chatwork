/*
 * debug.js
 * http://github.com/tokada/gitbucket-chatwork/
 *
 * Post request body to Amazon API Gateway directly as message to ChatWork.
 * This is a script for AWS Lambda.
 * 
 * Install: Prepare environment variables CHATWORK_TOKEN and CHATWORK_ROOM_ID
 */

var request = require('request');

exports.handler = function(event, context) {
  var options = {
    url: 'https://api.chatwork.com/v2/rooms/' + process.env.CHATWORK_ROOM_ID +'/messages',
    headers: {
      'X-ChatWorkToken': process.env.CHATWORK_TOKEN
    },
    form : { body : event.body },
    useQuerystring: true
  };

  request.post(options, function(err, res, body) {
    var response = {
      statusCode: 200,
      headers: {},
      body: body
    };
    if (!err && res.statusCode == 200) {
      context.succeed(response);
    }else{
      context.done('error', response);
    }
  });
};
