const baseUrl = "https://baas.kinvey.com/";
const appKey = "kid_HkGP6KDxI";
const appSecret = "fa25769dc9f840328c239ea499d04a4a";

function handleError (e) {
    if(!e.ok){
        throw new Error (e.statusText)
    }
    return e;
}

function deserializeData (e) {
    if(e.status === 204){
        return e;
    } 
    return e.json();
}

//Setting Header Type (Basic or Kinvey)
function authentication (type) {
    return type === 'Basic'
        ?  'Basic ' + btoa(appKey + ':' + appSecret)
        :  'Kinvey ' + sessionStorage.getItem('authtoken');
}

//Creating headers for any of the given requests
function createHeader (authType, methodType, userData) {
    const header = {
        method: methodType,
        headers: {
            'Authorization': authentication(authType),
            'Content-Type':'application/json'
        }    
    }
    if(methodType === 'POST' || methodType === 'PUT'){
        header.body = JSON.stringify(userData);
    }
    return header;
}

//Requester to Server
function makeRequest (urlModule, endpoint, header) {
    const url = `${baseUrl}${urlModule}/${appKey}/${endpoint}`;

    return fetch(url, header)
          .then(handleError)
          .then(deserializeData);
}


//POST request method
export function postRequest (authType, urlModule, urlEndpoint, userData) {
    const header = createHeader(authType, 'POST', userData);

    return makeRequest(urlModule, urlEndpoint, header);    
}

//GET request method
export function getRequest (authType, urlModule, urlEndpoint) {
    const header = createHeader(authType, 'GET');

    return makeRequest(urlModule, urlEndpoint, header);    
}

//PUT request method
export function putRequest (authType, urlModule, urlEndpoint, userData) {
    const header = createHeader(authType, 'PUT', userData);
    
    return makeRequest(urlModule, urlEndpoint, header)
}

//DELETE request method
export function delRequest (params) {
    
}
    

