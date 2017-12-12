/*
 * index.js
 * http://github.com/tokada/gitbucket-chatwork/
 *
 * Edit request body to Amazon API Gateway with corresponding template and post as a message to ChatWork.
 * This is a script for AWS Lambda.
 * 
 * Install: Prepare environment variables CHATWORK_TOKEN and CHATWORK_ROOM_ID
 */

var request = require('request');
var ejs = require('ejs');
var fs = require('fs');

var makeResponse = function(statusCode, body) {
  if (typeof(body) != 'string') {
    body = JSON.stringify(body);
  }
  return {
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: body
  };
}

var chooseTemplate = function(templateName) {
  return fs.readFileSync('templates/'+templateName+'.ejs', 'utf-8');
}

exports.handler = function(event, context) {
  var requestBody = JSON.parse(event.body);

  if (!process.env.CHATWORK_TOKEN || !process.env.CHATWORK_ROOM_ID) {
    context.done('error', makeResponse(200, { error: { message: "Environment variable CHATWORK_TOKEN or CHATWORK_ROOM_ID required" } }));
    return;
  }

  // choose template
  var template = null;
  if (requestBody.issue && requestBody.action == 'opened') {
    template = chooseTemplate('open_issue');
  }
  else if (requestBody.issue && requestBody.action == 'closed') {
    template = chooseTemplate('close_issue');
  }
  else if (requestBody.pull_request && requestBody.action == 'opened') {
    template = chooseTemplate('open_pull_request');
  }
  else if (requestBody.pull_request && requestBody.action == 'closed') {
    template = chooseTemplate('close_pull_request');
  }
  else if (requestBody.pull_request && requestBody.action == 'synchronize') {
    template = chooseTemplate('synchronize_pull_request');
  }
  else if (requestBody.issue && requestBody.comment && requestBody.issue.pull_request) {
    template = chooseTemplate('comment_pull_request');
  }
  else if (requestBody.issue && requestBody.comment) {
    template = chooseTemplate('comment_issue');
  }
  else if (requestBody.pusher && requestBody.before.match(/^0000000/)) {
    template = chooseTemplate('create_branch');
  }
  else if (requestBody.pusher) {
    template = chooseTemplate('push');
  }

  if (!template) {
    context.done('error', makeResponse(200, { error: { message: "No template matched for request body", body: event.body } }));
    return;
  }

  var msg = ejs.render(template, { event: requestBody });
  var options = {
    url: 'https://api.chatwork.com/v2/rooms/' + process.env.CHATWORK_ROOM_ID +'/messages',
    headers: {
      'X-ChatWorkToken': process.env.CHATWORK_TOKEN
    },
    form : { body : msg },
    useQuerystring: true
  };

  request.post(options, function(err, res, body) {
    var response = makeResponse(200, body);
    if (!err && res.statusCode == 200) {
      context.succeed(response);
    }else{
      context.done('error', response);
    }
  });
};
