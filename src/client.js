var currentPage = 0;	
//Handles XHR response data  
const handleResponse = (xhr) => {
      const content = document.querySelector("#content");	
	  const LEAKURL = "http://www.leaksapi.com/clinton-emails/";
	  const API_KEY = "6ba36c66-1f98-49b8-811b-6caf1283a4bb";
		  switch(xhr.status) {
			case 200: //success
			  var parsedJSON = JSON.parse(xhr.responseText);
			  content.innerHTML ="";
			  for (var i=0;i<parsedJSON.length;i++) 
			  {
				console.log(JSON.parse(parsedJSON[i]));
				var parsedLine = JSON.parse(parsedJSON[i]);
				content.innerHTML += "<br><b><a href=?id=" +parsedLine.id + ">" + parsedLine.subject + "</b> (" + parsedLine.id + ")</a><br>";
				if(parsedLine.to.length > 0)
				{
				  content.innerHTML += "<section id='toFrom'> To: <b>" + parsedLine.to + "</b> - From: <b>" + parsedLine.from + "</b></section> <br>";
				}
				if(i == parsedJSON.length-1)
				{
				  if(currentPage > 0){
					content.innerHTML += "<button id='prvPage'>Previous Page</button>";
				  }		
				  content.innerHTML += " - Page: " + (parseInt(currentPage)+1) + " - ";
				  if(i >= 9){
				  content.innerHTML += "<button id='nxtPage'>Next Page</button>";
					document.querySelector("#nxtPage").addEventListener ("click", goToNextPage, false);
				  }
				  if(currentPage > 0){
					document.querySelector("#prvPage").addEventListener ("click", goToLastPage, false);
				  }
				}
			  }
			  break;
			case 201: 
			  content.innerHTML = `<b>Create</b><br>`;
			  content.innerHTML += JSON.parse(xhr.responseText)["message"];
			  break;
			case 204: 
			  content.innerHTML = `<b>Modified</b><br>`;
			  break;  		
			case 401: 
			  content.innerHTML = `<b>Unauthorized Request</b><br>`;
			  content.innerHTML += JSON.parse(xhr.responseText)["message"];
			  break;
			case 403: 
			  content.innerHTML = `<b>Forbidden Request</b><br>`;
			  content.innerHTML += JSON.parse(xhr.responseText)["message"];
			  break;
			case 400: //bad request 
			  content.innerHTML = `<b>Bad Request</b><br>`;
			  content.innerHTML += JSON.parse(xhr.responseText)["message"];
			  break;
			case 404: //not found (requested resource does not exist)
			  content.innerHTML = `<b>Resource Not Found</b><br>`;
			  content.innerHTML += JSON.parse(xhr.responseText)["message"];
			  break;
			case 500: 
			  content.innerHTML = `<b>Internal Error</b><br>`;
			  content.innerHTML += JSON.parse(xhr.responseText)["message"];
			  break;
			case 503: 
			  content.innerHTML = `<b>Service Unavailable</b><br>`;
			  content.innerHTML += JSON.parse(xhr.responseText)["message"];
			  break;
			default: //default other errors we are not handling in this example
			  content.innerHTML = `<b>Not Implemented</b><br>`;
			  content.innerHTML += JSON.parse(xhr.responseText)["message"];
		  }
    }
	
    //GET ajax request for search
    const sendAjaxSearch = (url, param, page) => {
	  window.history.pushState("string", "Title", "/");
	  const emailContent = document.querySelector("#EmailContent");
	  var params = "";
	  if(typeof(emailContent) != "undefined" && emailContent != null){
	    emailContent.innerHTML = "";
	  }
	  const commentContent = document.querySelector("#CommentContent");
	  if(typeof(commentContent) != "undefined" && commentContent != null){
	    commentContent.innerHTML = "";
	  }
      const xhr = new XMLHttpRequest();
	  if(typeof(page) != "undefined"){
	    params += "?page=" + page;
	  }
	  if(typeof(param) != "undefined"){
	    if(typeof(page) != "undefined"){
	      params += "&search=" + param;
		}else{
		  params += "?search=" + param;
		}
	  }
	  xhr.open('GET', url + params);
      xhr.setRequestHeader ("Accept", "");
      xhr.onload = () => handleResponse(xhr);
      xhr.send(param);
    }
	
	//Posts ajax
	const postAjax = (url) => {
      const xhr = new XMLHttpRequest();
	  const commentText = document.querySelector("#commentText").value;
	  const id = document.querySelector("#emailID").innerHTML;
	  const params = "?comment=" + commentText + "&id=" + id;
	  xhr.open('POST', url + params);
	  xhr.setRequestHeader("Content-type", "text");
	  xhr.onload = () => handleResponse(xhr);
	  xhr.send(params);
    }
	
	//Goes to next page
	const goToNextPage = () => {
	  currentPage++;
	  const typeSelector = document.querySelector("#searchType");
	  const typeName = typeSelector.options[typeSelector.selectedIndex].value;
	  const param = document.querySelector("#search").value;
	  sendAjaxSearch(typeName, param, currentPage);
	}
	
	//Submits comment
	const submitComment = () => {
	  const commentText = document.querySelector("#commentText").value;
	  postAjax("/comment");
	  if(commentText.replace(/\s/g,'').length > 0){
		window.location.reload()
	  }
	}
	
	//Goes to last page
    const goToLastPage = () => {
	  currentPage--;
	  const typeSelector = document.querySelector("#searchType");
	  const typeName = typeSelector.options[typeSelector.selectedIndex].value;
	  const param = document.querySelector("#search").value;
	  sendAjaxSearch(typeName, param, currentPage);
	}
	
	//Handles initialization
	const init = () => {
	  const selector = document.querySelector("#searchType");
	  const searchbar = document.querySelector("#search");
	  selector.onchange = getButton;
	  searchbar.onchange = getButton;
	  getButton();
	}
	
	//Method for search button
	const buttonMethod = (typeName, param) => {
		currentPage = 0;
		sendAjaxSearch(typeName, param);
	}
	
	//Updates button correctly
	const getButton = () => {
	  var send = document.querySelector("#searchButton");
      const sendClone = send.cloneNode(true);
      send.parentNode.replaceChild(sendClone, send);
	  const sendButton = document.querySelector("#searchButton");
	  const typeSelector = document.querySelector("#searchType");
	  const typeName = typeSelector.options[typeSelector.selectedIndex].value;
	  const param = document.querySelector("#search").value;
      const callMethod = () => buttonMethod(typeName, param);
      sendButton.addEventListener('click', callMethod);
	}
	
	//Precents enter from loading form
	const stopEnterKey = (evt) => {
	  var evt = (evt) ? evt : ((event) ? event : null);
	  var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
	  if ((evt.keyCode == 13) && (node.type == "text")) { return false; }
    }
    document.onkeypress = stopEnterKey; //http://stackoverflow.com/questions/2794017/disable-form-submission-via-enter-key-on-only-some-fields
	
    window.onload = init;