//Saving user Data
export function saveSession (userInfo) {

    let userAuth = userInfo._kmd.authtoken;
    sessionStorage.setItem('authtoken', userAuth);
    let userId = userInfo._id;
    sessionStorage.setItem('userId', userId);
    let username = userInfo.username;
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('teamId', userInfo.teamId);
}

//Data Authentication authentication
export function dataAuthentication (username, password, repeatPassword) {
    if(password !== repeatPassword){
        errorBox('PASSWORDS MUST MATCH!');
        return false;
    }else if(password.length < 4 || username.length < 4){
        errorBox('GIVEN DATA IS TOO SHORT!')
        return false
    }else{
        return true;
    }
}

//LOG-IN Authentication
export function loginAuth (username, password) {
    
}

//Info message 
export function infoBox (message) { 
    let infoBox = $('#infoBox');
    infoBox.text(message);
    infoBox.show();
    setTimeout(() => infoBox.fadeOut(), 3000);
}


//Error message for not correct or wrong input
export function errorBox (message) {
    let errorBox = $('#errorBox');
    errorBox.text(message);
    errorBox.show();
    setTimeout(() => errorBox.fadeOut(), 3000);
}


