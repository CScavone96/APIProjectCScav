const http = require('http');
const url = require('url');
const query = require('querystring');
const { getIndex, getStyle, getClient } = require('./htmlResponses.js');
const { notFound, badRequest, forbidden, internal, notImplemented, sender, subject, recipient, id, comment } = require('./jsonResponses.js');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': getIndex,
  '/style.css': getStyle,
  '/client.js': getClient,
  '/subject': subject,
  '/recipient': recipient,
  '/sender': sender,
  '/id': id,
  '/comment': comment,
  notFound,
};

const onRequest = (request, response) => {
  console.log(request.url);
  const parsedUrl = url.parse(request.url);
  const params = query.parse(parsedUrl.query);
  const acceptedTypes = request.headers.accept.split(',');
  if (urlStruct[parsedUrl.pathname]) {
    urlStruct[parsedUrl.pathname](request, response, params, acceptedTypes);
  } else {
    urlStruct.notFound(request, response, params, acceptedTypes);
  }
};
http.createServer(onRequest).listen(PORT);

console.log(`listening on ${PORT}`);
