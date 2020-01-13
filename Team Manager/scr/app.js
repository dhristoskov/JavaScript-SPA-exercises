import { postRequest, putRequest, getRequest } from './requester.js';
import { saveSession, dataAuthentication, infoBox, loginAuth } from './authentication.js'

function main () {

    const partials = {
        header: '/htmlTemplates/common/header.hbs',
        footer: '/htmlTemplates/common/footer.hbs'
    }

    //Loading HOME page
    function getHome (context) {
        context.loggedIn = sessionStorage.getItem('authtoken') !== null;
        context.username = sessionStorage.getItem('username');

        context.loadPartials(partials)
               .then(function () {
                   this.partial('/htmlTemplates/home/home.hbs')
               });            
    }

    //Loading CATALOG page
    function getCatalot (context) {
        context.loggedIn = sessionStorage.getItem('authtoken') !== null;
        context.username = sessionStorage.getItem('username');

        partials['team'] = '/htmlTemplates/catalog/team.hbs';

        getRequest('Kinvey', 'appdata', 'teams')
                    .then((data) => {
                        context.hasTeam = sessionStorage.getItem('teamId') !== null;
                        context.hasNoTeam = sessionStorage.getItem('teamId') === null
            ||          sessionStorage.getItem('teamId') === "undefined";
                        context.teams = data;
                        context.loadPartials(partials)
                            .then(function() {
                            this.partial('/htmlTemplates/catalog/teamCatalog.hbs')
                    });               
        });          
    };

    const app = new Sammy ('#main', function () {
        this.use('Handlebars', 'hbs');

        //Display HOME
        this.get('/', getHome);
        this.get('#/home', getHome);

        //Display ABOUT
        this.get('#/about', function() {
            this.loggedIn = sessionStorage.getItem('authtoken') !== null;
            this.username = sessionStorage.getItem('username');

            this.loadPartials(partials)
                .then(function() {
                    this.partial('/htmlTemplates/about/about.hbs')
                });
        });

        //Display LOGIN
        this.get('#/login', function() {
            partials['loginForm'] = '/htmlTemplates/login/loginForm.hbs';
            this.loadPartials(partials)
                .then(function() {
                    this.partial('/htmlTemplates/login/loginPage.hbs')
                });
        });

        //LOGIN into Existing Account
        this.post('#/login', function(context) {
            const { username, password } = context.params;

            postRequest('Basic', 'user', 'login', {username, password})  
                .then(function (userInfo) {
                    saveSession(userInfo);
                    infoBox('Successfully logged in!');
                    getHome(context);
                });       
        });

        //LOGOUT when user is logged in
        this.get('#/logout', function (context) {
           sessionStorage.clear();
           getHome(context);
        });

        //Dipslay REGISTER
        this.get('#/register', function() {
            partials['registerForm'] = '/htmlTemplates/register/registerForm.hbs';
            this.loadPartials(partials)
                .then(function() {
                    this.partial('/htmlTemplates/register/registerPage.hbs')
                });
        });

        //Make new REGISTRATION
        this.post('#/register', function (context) {
            const { username, password, repeatPassword } = context.params;

            if(dataAuthentication(username, password, repeatPassword)){
                postRequest('Basic', 'user', '', {username, password})
                .then(function (userInfo) {
                    saveSession(userInfo);
                    infoBox('Successfully registered!');
                    getHome(context);                       
                });
            }          
        });

        //Display CATALOG page
        this.get('#/catalog', getCatalot);  

        //Display CREATE TEAM page
        this.get('#/create', function () {
            this.loggedIn = sessionStorage.getItem('authtoken') !== null;
            this.username = sessionStorage.getItem('username');

            partials['createForm'] = '/htmlTemplates/create/createForm.hbs'

            this.loadPartials(partials)
                .then(function () {
                    this.partial('/htmlTemplates/create/createPage.hbs')
                })
        });

        //POST a new TEAM resquest
        this.post('#/create', function (context) {

            let teamData = {
                name: context.params.name,
                comment: context.params.comment,
                author: sessionStorage.getItem('username')
                // members:{
                //     username: sessionStorage.getItem('username')
                // }      
            };

            postRequest('Kinvey', 'appdata', 'teams', teamData)
                .then(function (data){                   
                    //saveSession(userInfo);
                    infoBox('TEAM HAS BEEN CREATED!');
                    getCatalot(context);
                })
        });

        //Display TEAM details
        this.get('#/catalog/:id', function (context) {
            const teamId = this.params.id;
            partials['teamMember'] = '/htmlTemplates/catalog/teamMember.hbs';
            partials['teamControls'] = '/htmlTemplates/catalog/teamControls.hbs';
        
            getRequest('Kinvey', 'appdata', `teams/${teamId}`)
                    .then(function(teamInfo){
                        context.loggedIn = sessionStorage.getItem('authtoken') !== null;
                        context.username = sessionStorage.getItem('username');
                        context.name = teamInfo.name;
                        context.comment = teamInfo.comment;
                        context.members = teamInfo.members;
                        context.teamId = teamInfo._id;
                        context.isOnTeam = teamInfo._id === sessionStorage.getItem('teamId');
                        context.isAuthor = teamInfo._acl.creator === sessionStorage.getItem('userId');
                        context.loadPartials(partials)
                        .then(function () {            
                            this.partial('/htmlTemplates/catalog/details.hbs')
                        })
                    })
        });  

        //JOIN a TEAM
        this.get('#/join/:id', function(context){
            let userData = {
                username: sessionStorage.getItem('username'),
                teamId: this.params.id
            }
            putRequest('Kinvey', 'user', sessionStorage.getItem('userId'), userData )
                    .then((data) => {
                        saveSession(data);
                        infoBox('TEAM HAS BEEN JOINED!');
                        getCatalot(context);
                    });
        });

        //LEAVE a TEAM
        this.get('#/leave', function (context) {
            let userData = {
                username: sessionStorage.getItem('username'),
                teamId: ''
            };
            putRequest('Kinvey', 'user', sessionStorage.getItem('userId'), userData)
                    .then((userInfo) => {
                         saveSession(userInfo);
                         infoBox('TEAM HAS BEEN LEFT!');
                         getCatalot(context);
            });
        });

        //Display EDIT TEAM page
        this.get('#/edit/:id', function (context) {
            this.loggedIn = sessionStorage.getItem('authtoken') !== null;
            this.username = sessionStorage.getItem('username');
            context.teamId = this.params.id;

            partials['editForm'] = '/htmlTemplates/edit/editForm.hbs';

            getRequest('Kinvey', 'appdata', `teams/${context.teamId}`)
                    .then(data =>{
                        context.name = data.name;
                        context.comment = data.comment;                       
                        this.loadPartials(partials)
                            .then(function () {
                                this.partial('/htmlTemplates/edit/editPage.hbs')
                            });
                    });
        });

        //EDIT TEAM page
        this.post('#/edit/:id', function (context) {
            const teamId = context.params.id;

            let teamData = {
                name: context.params.name,
                comment: context.params.comment,
                author: sessionStorage.getItem('username')
            };
        
            putRequest('Kinvey', 'appdata', `teams/${teamId}`, teamData)
                    .then(function() {
                        infoBox(`TEAM ${name} EDITED!`);
                        getCatalot(context);   
                    });
        });


    });   
    app.run();
}
main();