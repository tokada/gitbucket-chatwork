GitBucket-ChatWork
==================

Post GitBucket events to ChatWork using AWS Lambda through Amazon API Gateway.

## Install

Install npm libraries.
```
npm install request ejs
```

Zip all the files.
```
zip -r gitbucket-chatwork.zip *
```

Then, upload zip file to AWS Lambda function.

Prepare environment variables within AWS Lambda function:
- CHATWORK_TOKEN
- CHATWORK_ROOM_ID

## Usage

Read https://qiita.com/tokada/items/b1f6fc63c82ba4783c41 (in Japanese language)

## Licence

[MIT](LICENSE)

## Author

[tokada](https://github.com/tokada)