const express = require('express');
const mysql = require('mysql')

const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root',
    password: '',
    database: 'netbooker'
});

db.connect(function(error){
    if(!!error){
        console.log('error');
    }
    else{
        console.log('connected');
    }
})

app.listen(3000);

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

/*
app.set('view engine', 'ejs');
app.set('views','views');

app.get('/',(req,res)=>{
    res.render('index');
});
*/


