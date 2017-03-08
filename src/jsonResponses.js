const crypto = require('crypto');

const LEAKURL = "http://www.leaksapi.com/clinton-emails/";
const API_KEY = "6ba36c66-1f98-49b8-811b-6caf1283a4bb";
let currentHash = 'HELLO';
let responseVar = "test";
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var resArr = [];

var comments = new Map();

//Writes and ends response
const respond = (request, response, status, object, etag) => {
  if(typeof(object) != "undefined"){
	  const hash = crypto.createHash('md5').update(JSON.stringify(object)).digest('hex').slice(0, 6);
	  if (etag && hash === currentHash) {
		response.setHeader('ETag', hash);
		response.setHeader('if-none-match', hash);
		response.setHeader('Vary', 'Accept-Encoding');
		response.writeHead(304);
		response.end();
	  } else {
		currentHash = hash;
		response.setHeader('ETag', hash);
		response.setHeader('if-none-match', hash);
		response.setHeader('Vary', 'Accept-Encoding');
		response.writeHead(status, {
		  'Content-Type': 'application/json',
		});
		response.write(JSON.stringify(object));
		response.end();
	  }
  }
};

//Returns for not found 404 requests
const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };
  return respond(request, response, 404, responseJSON, false);
};

//Returns for forbidden requests
const forbidden = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was forbidden.',
    id: 'forbidden',
  };

  return respond(request, response, 403, responseJSON, false);
};

//Returns for internal server errors
const internal = (request, response) => {
  const responseJSON = {
    message: 'An internal error has occured',
    id: 'internal',
  };

  return respond(request, response, 500, responseJSON, false);
};

//Returns for not implemented features
const notImplemented = (request, response) => {
  const responseJSON = {
    message: 'This page has not been implemented',
    id: 'notImplemented',
  };

  return respond(request, response, 501, responseJSON, false);
};

//Tests if string is acceptable JSON
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
} //http://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string-in-javascript-without-using-try

//Handle response for arrays 
const handleResponseArr = (request, response, xhr, page) => {
	if(IsJsonString(xhr.responseText))
	{
		var parsedJSON = JSON.parse(xhr.responseText);
		var arr = [];
		if(parsedJSON.length > 10){
		for (var i=page*10;i<(parseInt(page)+1)*10;i++) {
		  console.log("I is :" + i + " out of " + ((parseInt(page)+1)*10));
		  arr.push(sendAjaxRes(LEAKURL.concat("id/").concat(API_KEY).concat("/").concat(parsedJSON[i].id)));
		}}else{
		for (var i=0;i<parsedJSON.length;i++) {
		  console.log(parsedJSON[i].id);
		  arr.push(sendAjaxRes(LEAKURL.concat("id/").concat(API_KEY).concat("/").concat(parsedJSON[i].id)));
		}
		}
		return respond(request, response, 200, arr, false);
	}
	else{
		const responseJSON = {
		  message: 'The API is under heavy load, please try again soon.',
		  id: 'serviceUnavailable',
		};
		return respond(request, response, 503, responseJSON, false);
	}
}
//Asynchronous handle response for arrays 
const asyncHandleResponseArr = (request, response, xhr, page) => {
	if(IsJsonString(xhr.responseText))
	{
		var parsedJSON = JSON.parse(xhr.responseText);
		var arr = [];
		if(parsedJSON.length > 10){
		for (var i=page*10;i<(parseInt(page)+1)*10;i++) {
		  console.log("I is :" + i + " out of " + ((parseInt(page)+1)*10));
		  if(i == ((parseInt(page)+1)*10)-1){
			sendAjaxResFinal(request, response, LEAKURL.concat("id/").concat(API_KEY).concat("/").concat(parsedJSON[i].id));  
		  }
		  else{
			sendAjaxRes(LEAKURL.concat("id/").concat(API_KEY).concat("/").concat(parsedJSON[i].id));  
		  }
		}}else{
		for (var i=0;i<parsedJSON.length;i++) {
		  console.log(parsedJSON[i].id);
		  if(i == (parsedJSON.length)-1){
			sendAjaxResFinal(request, response, LEAKURL.concat("id/").concat(API_KEY).concat("/").concat(parsedJSON[i].id));  
		  }
		  else{
			sendAjaxRes(LEAKURL.concat("id/").concat(API_KEY).concat("/").concat(parsedJSON[i].id));  
		  }
		}
		}
	}
	else{
		const responseJSON = {
		  message: 'The API is under heavy load, please try again soon.',
		  id: 'serviceUnavailable',
		};
		return respond(request, response, 503, responseJSON, false);
	}
}

//Asynchronous handler for arrays 
const asynchHandlerArr = (xhr) =>
{
	resArr.push(xhr.responseText);
	//console.log(resArr);
}

//Asynchronous handler for arrays final request
const asynchHandlerArrFinal = (request, response, xhr) =>
{
	resArr.push(xhr.responseText);
	//console.log(resArr.length);
	var clone = resArr;
	resArr = [];
	return respond(request, response, 200, clone, false);
}

//For submitting comments
const comment = (request, response, commentText) => {
  let jsonString = '';
  request.on('data', (data) => {
    jsonString += data;
  });

  request.on('end', () => {
    const paramsNew = jsonString.split('&');
    const commentText = paramsNew[0].slice(((paramsNew[0].indexOf('=')) + 1));
	const id = paramsNew[1].slice(((paramsNew[1].indexOf('=')) + 1));
	console.log("COMMENT LENGTH:  " + commentText.replace(/\s/g,'').length);
    if (commentText.replace(/\s/g,'').length > 0){
        response.writeHead(201);
		if(typeof(comments.get(id)) != "undefined"){
			var newComments = comments.get(id);
			newComments.push(commentText);
			comments.set(id, newComments);
		}
		else{
			comments.set(id, [commentText]);
		}
        const responseJSON = {
          message: 'Created Successfully',
          id: 'create',
        };
        response.write(JSON.stringify(responseJSON));
        response.end();
    } else {
      response.writeHead(400);
      const responseJSON = {
        message: 'Comment text required.',
        id: 'badRequest',
      };
      response.write(JSON.stringify(responseJSON));
      response.end();
    }
  });
};

//Loading asynch
const sendAjaxRes = (url) => {
  const xhr = new XMLHttpRequest();
  console.log(url);
  xhr.onload = () => asynchHandlerArr(xhr);
  xhr.open('GET', url, false);
  xhr.responseType = "document";
  xhr.send();
}

//Last loaded asynch 
const sendAjaxResFinal = (request, response, url) => {
  const xhr = new XMLHttpRequest();
  console.log(url);
  xhr.onload = () => asynchHandlerArrFinal(request, response, xhr);
  xhr.open('GET', url, false);
  xhr.responseType = "document";
  xhr.send();
}

//Sends ajax for array
const sendAjaxArr = (request, response, url, page) => {
  const xhr = new XMLHttpRequest();
  console.log(url);
  xhr.onload = () => asyncHandleResponseArr(request, response, xhr, page);
  xhr.open('GET', url);
  xhr.responseType = "document";
  xhr.send();
}

//Handles respones
const handleResponse = (request, response, xhr) => {
	var parsedJSON = xhr.responseText;
	return respond(request, response, 200, parsedJSON, false);
}

//Preforms Get AJAX request
const sendAjax = (request, response, url) => {
  const xhr = new XMLHttpRequest();
  console.log(url);
  //xhr.onload = () => handleResponse(request, response, xhr);
  xhr.open('GET', url, false);
  xhr.responseType = "document";
  xhr.send();
  return xhr.responseText;
}

//Performs GET ajax request
const getAjax = (request, response, url) => {
  const xhr = new XMLHttpRequest();
  console.log(url);
  //xhr.onload = () => handleResponse(request, response, xhr);
  xhr.open('GET', url, false);
  xhr.responseType = "document";
  xhr.send();
  return xhr.responseText;
}

//To search by sender
const sender = (request, response, params) => {
	var page = 0;
	if (params.page && params.page > -1) {
		page = params.page;
	}
	if (!params.search || params.search.length < 1) {
		const responseJSON = {
		  message: 'Missing search information',
		  id: 'badRequest',
		};
		return respond(request, response, 400, responseJSON, false);
	}
	sendAjaxArr(request, response, LEAKURL.concat("from/").concat(API_KEY).concat("/").concat(params.search), page);
}

//To load email by ID
const id = (request, response, params) => {
	if (!params.id || params.id.length < 1) {
		const responseJSON = {
		  message: 'Missing ID information',
		  id: 'badRequest',
		};
		return respond(request, response, 400, responseJSON, false);
	}
	sendAjax(request, response, LEAKURL.concat("id/").concat(API_KEY).concat("/").concat(params.id));
}

//For searching subjects
const subject = (request, response, params) => {
	var page = 0;
	if (params.page && params.page > -1) {
		page = params.page;
	}
	if (!params.search || params.search.length < 1) {
		const responseJSON = {
		  message: 'Missing search information',
		  id: 'badRequest',
		};
		return respond(request, response, 400, responseJSON, false);
	}
	sendAjaxArr(request, response, LEAKURL.concat("subject/").concat(API_KEY).concat("/").concat(params.search), page);
}

//For searching recipients
const recipient = (request, response, params) => {
	var page = 0;
	if (params.page && params.page > -1) {
		page = params.page;
	}
	if (!params.search || params.search.length < 1) {
		const responseJSON = {
		  message: 'Missing search information',
		  id: 'badRequest',
		};
		return respond(request, response, 400, responseJSON, false);
	}
	sendAjaxArr(request, response, LEAKURL.concat("to/").concat(API_KEY).concat("/").concat(params.search), page);
}

//For bad requests
const badRequest = (request, response, params) => {
  const responseJSON = {
    message: 'This request has the required parameters',
    id: 'badRequest',
  };

  if (!params.valid || params.valid !== 'true') {
    responseJSON.message = 'Missing valid query parameter set to true';
    responseJSON.id = 'badRequest';
    return respond(request, response, 400, responseJSON, false);
  }

  return respond(request, response, 200, responseJSON, false);
};

module.exports = {
  badRequest,
  notFound,
  forbidden,
  internal,
  notImplemented,
  sender,
  recipient,
  subject,
  id,
  getAjax,
  comment,
  comments,
};
