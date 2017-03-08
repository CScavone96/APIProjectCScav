const fs = require('fs');
const jsres = require('./jsonResponses.js');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const style = fs.readFileSync(`${__dirname}/../client/style.css`);
const client = fs.readFileSync(`${__dirname}/../src/client.js`);

const LEAKURL = 'http://www.leaksapi.com/clinton-emails/';
const API_KEY = '6ba36c66-1f98-49b8-811b-6caf1283a4bb';

// Returns index page
const getIndex = (request, response, params) => {
  let resObj;
  if (params.id && params.id.length > 0) {
    resObj = jsres.getAjax(request, response, LEAKURL.concat('id/').concat(API_KEY).concat('/').concat(params.id));
    resObj = JSON.parse(resObj);
  }
  response.writeHead(200, { 'Content-type': 'text/html' });

  response.write(index);
  if (params.id && params.id.length > 0) {
    response.write(`<div id='emailID'>${params.id}</div>`);
    response.write("<div id='EmailContent'>");
    response.write(`<br><a id='pdfLink' href=${resObj.pdf}> Link to PDF of email on WikiLeaks</a>`);
    const rawFormatted = resObj.raw.replace(/(?:\r\n|\r|\n)/g, '<br />');
    response.write(rawFormatted);
    response.write('</div>');
    response.write("<div id='CommentContent'>");
    response.write('<h3>Comments</h3>');
    if (jsres.comments.size > 0) {
      jsres.comments.forEach((comments, key) => {
        if (key.toString() === params.id) {
          comments.forEach((comment) => {
            response.write(`<div class='comment'>Comment:</div><p>${comment.toString()}</p>`);
          });
        }
      });
    }
    response.write("<textarea rows='4' cols='50' id='commentText'> </textarea>");
    response.write("<br><button type='button' onclick='submitComment()' id='submitComment'>Submit Comment</button>");
    response.write('</div>');
  }

  response.end();
};

// Returns Style
const getStyle = (request, response) => {
  response.writeHead(200, { 'Content-type': 'text/css' });

  response.write(style);

  response.end();
};

// Returns client
const getClient = (request, response) => {
  response.writeHead(200, { 'Content-type': 'text/javascript' });

  response.write(client);

  response.end();
};


module.exports.getIndex = getIndex;
module.exports.getStyle = getStyle;
module.exports.getClient = getClient;
