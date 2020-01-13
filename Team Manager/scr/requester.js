const baseUrl = "https://baas.kinvey.com/";
const appKey = "";//Have to be added
const appSecret = "";//Have to be added


//Setting Header Type (Basic or Kinvey)
function setAuthentication (type) {
    return type === 'Basic'
        ?  'Basic ' + btoa(appKey + ':' + appSecret)
        :  'Kinvey ' + sessionStorage.getItem('authtoken');
}

//Creating headers for any of the given requests
function createHeader (authType, methodType, userData) {
    const header = {
        method: methodType,
        headers: {
            'Authorization': setAuthentication(authType),
            'Content-Type':'application/json'
        }    
    }
    if(methodType === 'POST' || methodType === 'PUT'){
        header.body = JSON.stringify(userData);
    }
    return header;
}

//Requester for all requests to Server
function makeRequest (urlModule, endpoint, header) {
    const url = `${baseUrl}${urlModule}/${appKey}/${endpoint}`;

    return fetch(url, header)
          .then(x => x.json());
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
    
