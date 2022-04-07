const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:false}));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tidings'
});


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true }
  }))
  app.use((req, res, next) => {
    if(req.session.userId === undefined){
        res.locals.isLoggedIn = false;
        
    } else {
        res.locals.isLoggedIn = true;
        res.locals.fullname = req.session.fullname;
    }
    next();
})






connection.query(
    'SELECT * FROM users',(error,results) => {
        if(error) console.log(error)
        console.log('connection successfully')
    }
)

app.get('/', (req, res) => {
    res.render('home.ejs')
})

app.get('/about', (req, res) => {
    res.render('about-us.ejs')
})


app.get('/signup', (req,res) => {
    res.render('signup.ejs',{error: false})
})


app.post('/signup', (req,res) => {
    let email = req.body.email,
    fullname = req.body.fullname,
    gender = req.body.gender,
    password = req.body.password,
    confirmpassword = req.body.confirmpassword

    if(password = confirmpassword) {
        bcrypt.hash(password, 10, (error, hash) => {
            connection.query(
                'SELECT email FROM users WHERE email = ?',
                [email],
                (error,results) => {
                    
                    if(results.length === 0){
                        connection.query(
                            'INSERT INTO users (email, fullname,gender, password) VALUES(?,?,?,?)',
                            [email, fullname, gender, hash],
                            (error, results) => {
                                res.redirect('/login');
                            }
                        )
                    
                    } else{
                        console.log('email already registered')
                    }
                 })         
           })
         
        } else{
            console.log('enter macthing passwords')
        }
        
             
    })
    




app.get('/login', (req, res) => {
    res.render('login.ejs')
})



app.post('/login',(req,res)=>{
    let email = req.body.email
    let password = req.body.password

    connection.query(
        'SELECT * FROM users WHERE email=?',[email],
        (error,results)=>{
            if(results.length>0){
                bcrypt.compare(password,results[0].password, (error,isEqual)=>{
                    if(isEqual){
                        req.session.userId = results[0].id;
                       req.session.fullname = results[0].fullname;
                        res.render('new-tyd.ejs')


                    }else{
                      console.log('mmn')
                        
                       
                    }
                })
                
            }else{
                console.log('str')
            }
        }
    )
})


app.get('/tyd',(req, res) => {
    if (res.locals.isLoggedIn)
    connection.query(
        'SELECT * FROM tyds WHERE userID =?',[req.session.userID],(error,results)=>{
            res.render('new-tyd.ejs')
        }
    )
    
})


app.post('/tyd',(req,res) => {
    connection.query(
        'INSERT INTO tyds (tyd, userID) VALUES (?,12)',
         [req.body.tyd],
         (error, results) => {
             console.log(error)
             res.render('about-us.ejs');
         }
    );
 });
 
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server up on PORT ${PORT}`);
})