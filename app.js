const express = require('express');
const mysql = require('mysql');
const ejs = require('ejs');

const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root',
    password: '',
    database: 'netbooker'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

db.connect(function(error){
    if(!!error){
        console.log('error');
    }
    else{
        console.log('connected');
    }
})
// middleware
/*app.use((req, res, next) => {
    console.log('new request made:');
    console.log('host: ', req.hostname);
    console.log('path: ', req.path);
    console.log('method: ', req.method);
    console.log('ip',req.ip);
      console.log('');
    next();
});*/

app.listen(3000);

app.use(express.static('public'));

app.get('/', (req,res)=>{
    res.render('index');
})

app.get('/login', (req, res) => {
    db.query('SELECT * FROM brugere', (error, result) => {
        if(error){
            console.error('fejl med sql ' + error.message);
            res.status(500).send('server fejl');
        }
        else{
            res.render('login', { data: result });
        }
    })
})

app.get('/kalender', (req, res) => {
    db.query('SELECT * FROM kalender', (error, result) => {
        if(error){
            console.error('ingen bookinger fundet ' + error.message);
            res.status(204).send('ingen data returneret');
        }
        else{
            res.render('kalender', { data: result });
        }
    })
})

app.get('/getCalendarData', (req, res) => {
    const query = 'SELECT * FROM kalender'; // Tilpas til din database

    db.query(query, (error, result) => {
        if (error) {
            console.error('Fejl ved hentning af kalenderdata: ' + error.message);
            res.status(500).send('Serverfejl');
        } else {
            res.json(result);
        }
    });
});






