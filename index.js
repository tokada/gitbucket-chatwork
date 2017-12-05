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

exports.handler = function(event, context) {
  var requestBody = JSON.parse(event.body);

  // choose template
  var template = null;
  if (requestBody.issue != null && requestBody.action == 'opened') {
    template = fs.readFileSync('templates/open_issue.ejs', 'utf-8');
  }
  else if (requestBody.issue != null && requestBody.action == 'closed') {
    template = fs.readFileSync('templates/close_issue.ejs', 'utf-8');
  }
  else if (requestBody.pull_request != null && requestBody.action == 'opened') {
    template = fs.readFileSync('templates/open_pull_request.ejs', 'utf-8');
  }
  else if (requestBody.pull_request != null && requestBody.action == 'closed') {
    template = fs.readFileSync('templates/close_pull_request.ejs', 'utf-8');
  }
  else if (requestBody.issue != null && requestBody.comment != null && requestBody.issue.pull_request != null) {
    template = fs.readFileSync('templates/comment_pull_request.ejs', 'utf-8');
  }
  else if (requestBody.issue != null && requestBody.comment != null) {
    template = fs.readFileSync('templates/comment_issue.ejs', 'utf-8');
  }
  else if (requestBody.pusher != null && requestBody.before.match(/^0000000/)) {
    template = fs.readFileSync('templates/create_branch.ejs', 'utf-8');
  }
  else if (requestBody.pusher != null) {
    template = fs.readFileSync('templates/push.ejs', 'utf-8');
  }

  if (template == null) {
    var response = {
      statusCode: 200,
      headers: {},
      body: JSON.stringify({ error: { message: "no template matched for request body", request_body: event.body } })
    };
    context.done('error', response);
  }
  else {
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
  }
};
