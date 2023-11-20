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
            res.redirect('/')
  
            // Redirect til registreringssiden, hvis brugeren er en administrator
           
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

app.post('/registrer', checkAdminAuth, async (req, res) => {
    console.log('Forespørgsel modtaget på /registrer', req.body);
  
    const {
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
    } = req.body;
  
    // Tjek om brugernavn allerede eksisterer
    const usernameExists = await checkIfUsernameExists(Brugernavn);
    if (usernameExists) {
      return res.status(400).send('Brugernavnet eksisterer allerede. Vælg venligst et andet.');
    }
  
    // Tjek om e-mail allerede eksisterer
    const emailExists = await checkIfEmailExists(Email);
    if (emailExists) {
      return res.status(400).send('E-mailen eksisterer allerede. Vælg venligst en anden.');
    }
  
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
  
    db.query(query, [Brugernavn, Kodeord, Brugertype, Fornavn, Efternavn, Telefonnummer, Email, Adresse, PostnummerogBy, Medlemstype], (err, result) => {
      if (err) {
        console.error('Fejl ved registrering af bruger: ' + err.message);
        res.status(500).send('Serverfejl');
      } else {
        console.log('Bruger registreret:', result);
        
      }
    });
  });
  
  // Funktion til at tjekke om brugernavnet allerede eksisterer
  function checkIfUsernameExists(username) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM brugere WHERE Brugernavn = ?';
      db.query(query, [username], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length > 0);
        }
      });
    });
  }
  
  // Funktion til at tjekke om e-mailen allerede eksisterer
  function checkIfEmailExists(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM brugere WHERE Email = ?';
      db.query(query, [email], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length > 0);
        }
      });
    });
  }
  

// opdater oplysninger via redigerprofil

app.post('/redigerprofil', checkAuth, (req, res) => {
    const {
      Brugernavn,
      Email,
      Telefonnummer,
      Fornavn,
      Efternavn,
      Adresse,
      PostnummerogBy,
    } = req.body;
  
    const currentUser = req.session.user;
  
    // Opdater brugeroplysningerne i databasen
    const query = 'UPDATE brugere SET Brugernavn = ?, Email = ?, Telefonnummer = ?, Fornavn = ?, Efternavn = ?, Adresse = ?, PostnummerogBy = ? WHERE id = ?';
    db.query(
    query,
        [
        Brugernavn,
        Email,
        Telefonnummer,
        Fornavn,
        Efternavn,
        Adresse,
        PostnummerogBy,
        currentUser.id
    ],
  (err, results) => {
    if (err) {
      console.error('Fejl ved databaseforespørgsel: ' + err.message);
      res.status(500).send('Serverfejl');
    } else {
      console.log('Brugeroplysninger opdateret i databasen:', results);
          // Opdater også brugeroplysningerne i sessionen
          req.session.user.Brugernavn = Brugernavn;
          req.session.user.Email = Email;
          req.session.user.Telefonnummer = Telefonnummer;
          req.session.user.Fornavn = Fornavn;
          req.session.user.Efternavn = Efternavn;
          req.session.user.Adresse = Adresse;
          req.session.user.PostnummerogBy = PostnummerogBy;
  
          res.redirect('/minprofil'); // Omdiriger til profilsiden eller en anden ønsket destination
        }
      }
    );
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

  function checkNotAuthenticated(req, res, next) {
    if (!req.session.user) {
      return next(); // Brugeren er ikke logget ind, fortsæt med anmodningen
    } else {
      res.redirect('/'); // Hvis brugeren allerede er logget ind, omdirigér til hjemmesiden
    }
  }

// check user auth

function checkAuth(req, res, next) {
    if (req.session && req.session.user) {
      // Hvis der er en aktiv session, og currentUser er gemt i sessionen
      return next(); // Brugeren er godkendt, fortsæt med anmodningen
    } else {
      res.redirect('/login'); // Hvis ikke, omdirigér til login-siden
    }
  }


app.listen(3000);


//Endpoints
app.get('/', (req,res)=>{
    const user = req.session.user;
    res.render('index', { user });
})


app.get('/login', (req, res) => {
    res.render('login');
  });

app.get('/logout', (req, res) => {
 req.session.destroy((err) => {
    res.redirect('/login');
});
});

app.get('/minprofil', checkAuth, checkNotAuthenticated, (req, res) => {
    // checkAuth middleware sikrer, at brugeren er logget ind
    // Du kan hente brugeroplysninger fra sessionen eller databasen
    const currentUser = req.session.user; // Antager, at brugeroplysninger gemmes i sessionen
  
    res.render('minprofil', { user: currentUser });
  });

  app.get('/redigerprofil', checkAuth, (req, res) => {
    // Hent brugeroplysninger fra sessionen
    const currentUser = req.session.user;
  
    res.render('redigerprofil', { user: currentUser });
  });