const express = require('express');
const mysql = require('mysql');
const session = require('express-session');

const app = express();
const port = 3000;


//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'hemmelig_nøgle', resave: true, saveUninitialized: true }));

app.use(express.static('public'));

//Database connection
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


// Post metode til login

app.post('/login', (req, res) => {
    const { Brugernavn, Kodeord } = req.body;
  
    db.query('SELECT * FROM brugere WHERE Brugernavn = ?', [Brugernavn], (err, results) => {
      if (err) {
        console.error('Fejl ved login: ' + err.message);
        res.status(500).send('Serverfejl');
      } else {
        if (results.length > 0) {
          const user = results[0];
  
          if (Kodeord === user.Kodeord) {
            req.session.user = user;
  
            // Redirect til registreringssiden, hvis brugeren er en administrator
            if (user.Brugertype === 'Admin') {
              res.redirect('/registrer');
            } else {
              res.redirect('/'); 
            }
          } else {
            res.render('login', { error: 'Forkert adgangskode' });
          }
        } else {
          res.render('login', { error: 'Forkert brugernavn' });
        }
      }
    });
  });


//Registrer bruger

app.post('/registrer', checkAdminAuth, (req, res) => {
    const {
      Brugernavn,
      Kodeord,
      Brugertype,
      Fornavn,
      Efternavn,
      Telefonnummer,
      Email,
      Adresse,
      PostnummerOgBy,
      Medlemstype
    } = req.body;
  
    // Tabelstrukturen
    const query = `
      INSERT INTO brugere (
        Brugernavn,
        Kodeord,
        Brugertype,
        Fornavn,
        Efternavn,
        Telefonnummer,
        Email,
        Adresse,
        PostnummerogBy,
        Medlemstype
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    db.query(query, [Brugernavn, Kodeord, Brugertype, Fornavn, Efternavn, Telefonnummer, Email, Adresse, PostnummerOgBy, Medlemstype], (err, result) => {
      if (err) {
        console.error('Fejl ved registrering af bruger: ' + err.message);
        res.status(500).send('Serverfejl');
      }
    });
  });
  
  

//admin auth check


function checkAdminAuth(req, res, next) {
    const user = req.session.user;
  
    if (!user) {
      return res.redirect('/login');
    }
  
    // Tilpas denne betingelse efter dine krav
    if (user.Brugertype === 'Admin') {
      return next();
    } else {
      res.status(403).send('Du har ikke tilladelse til at få adgang til denne side.');
    }
  }


app.listen(3000);


//Endpoints
app.get('/', (req,res)=>{
    const user = req.session.user;
    res.render('index', { user });
})

app.get('/registrer', checkAdminAuth, (req, res) => {
  res.render('registrer');
});

app.get('/login', (req, res) => {
    res.render('login');
  });

app.get('/logout', (req, res) => {
 req.session.destroy((err) => {
    res.redirect('/login');
});
});
