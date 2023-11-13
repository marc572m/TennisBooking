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

app.listen(3000);

app.get('/', (req, res) => {
    db.query('SELECT * FROM brugere', (error, result) => {
        if(error){
            console.error('fejl med sql ' + error.message);
            res.status(500).send('server fejl');
        }
        else{
            res.render('index', { data: result });
        }
    })
})

/*
app.get('/', function(req, res){
    db.query('SELECT * FROM brugere', function(error, rows, fields){
        if(!!error){
            console.log('error in query');
        }
        else{
            console.log('success\n');
            console.log(rows);
        }
    })
})
*/


