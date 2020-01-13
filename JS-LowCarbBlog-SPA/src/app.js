import { postRequest, getRequest, delRequest, putRequest } from './requester.js';
import { authInfo, setHeaderInfo } from './authentication.js';


function main () {
    const app = new Sammy ('#rooter', function () {

        this.use('Handlebars', 'hbs');
    
        //Header and Footer partials
        const partials = {
            header: '/template/common/header.hbs',
            footer: '/template/common/footer.hbs'
        }
    
        //Loading HOME page
        this.get('/', function (ctx) {
            setHeaderInfo(ctx);

            if(this.isLoggedIn){
                getRequest('Kinvey', 'appdata', 'recipes')
                    .then((data) => {
                        ctx.recipes = data;
                    });
    
                ctx.loadPartials(partials)
                   .partial('/template/home/home.hbs')
            }
            else{
                ctx.loadPartials(partials)
                   .partial('/template/home/home.hbs')
            }      
        });
     
        //Loading REGISTER page
        this.get('#/register', function (ctx) {
            this.loadPartials(partials)
                .partial('/template/register/register.hbs')
        });
    
        //REGISTER a new user
        this.post('#/register', function(ctx) {
    
            const userData = {
                firstName: ctx.params.firstName,
                lastName: ctx.params.lastName,
                username: ctx.params.username,
                password: ctx.params.password,
                //repeatPassword: ctx.password.repeatPassword
            }
    
            postRequest('Basic', 'user', '', userData)
                .then(function (userInfo) {
                    authInfo(userInfo);
                    ctx.redirect('/');
                })
                .catch(console.error);
            
        });
    
        //Loading LOGIN page
        this.get('#/login', function (ctx) {
            this.loadPartials(partials)
                .partial('/template/login/login.hbs')
        });
    
        //LOGIN as existing user
        this.post('#/login', function(ctx) {
            
            const { username, password } = ctx.params;
    
            postRequest('Basic', 'user', 'login', { username, password })
                .then(function (userInfo) {
                    authInfo(userInfo);
                    ctx.redirect('/');
                })
                .catch(console.error);
        });
    
        //LOGOUT 
        this.get('#/logout', function (ctx) {
            postRequest('Kinvey', 'user', '_logout', {})
                .then(() => {           
                    sessionStorage.clear();
                    ctx.redirect('/');
                })
                .catch(console.error);
        })
    
        //SHARE a recipe
        this.get('#/share', function (ctx) {
            setHeaderInfo(ctx);

            this.loadPartials(partials)
                .partial('/template/share/share.hbs')
        });  
        
        //POST new recipe
        this.post('#/share', function (ctx) {

            const categories = {
                'Vegetables and legumes/beans': 'https://cdn.pixabay.com/photo/2016/03/20/23/44/steam-1269716_960_720.jpg',
                'Fruits': 'https://cdn.pixabay.com/photo/2015/12/30/11/57/fruit-basket-1114060_960_720.jpg',
                'Grain Food': 'https://cdn.pixabay.com/photo/2013/12/15/16/36/bread-228939_960_720.jpg',
                'Milk, cheese, eggs and alternatives': 'https://cdn.pixabay.com/photo/2019/02/23/22/17/cheese-4016647_960_720.jpg',
                'Lean meats and poultry, fish and alternatives': 'https://cdn.pixabay.com/photo/2018/02/25/17/38/food-3181204_960_720.jpg'
            }

            const category = ctx.params.category;
            const ingredient = ctx.params.ingredients.split(', ');

            const userRecipe = {
                meal: ctx.params.meal,
                ingredients: ingredient,
                prepMethod: ctx.params.prepMethod,
                description: ctx.params.description,
                foodImageURL: ctx.params.foodImageURL,
                likesCounter: 0,
                categoryImageURL: categories[category]
            }

            postRequest('Kinvey', 'appdata', 'recipes', userRecipe)
                    .then(() => {
                        ctx.redirect('/');
                    })
                    .catch(console.error);       
        })
    });
    app.run();
}
main();
