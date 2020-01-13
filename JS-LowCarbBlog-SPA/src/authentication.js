//Saving user data 
export function authInfo (userInfo) {
    sessionStorage.setItem('authtoken', userInfo._kmd.authtoken);
    sessionStorage.setItem('names', userInfo.firstName + ' ' + userInfo.lastName);
    sessionStorage.setItem('userId', userInfo._id)
}

//For Header visualisation
export function setHeaderInfo (ctx){
    ctx.isLoggedIn = sessionStorage.getItem('authtoken') !== null;
    ctx.names = sessionStorage.getItem('names');
}