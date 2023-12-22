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

// Middleware for at rydde session storage ved opstart
app.use((req, res, next) => {
  // Tjek om brugeren er logget ind, før du rydder session storage
  if (req.session.user) {
      console.log('Ryd session storage for bruger med ID:', req.session.user.id);
      req.session.bookings = [];
  }
  next();
});



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

  app.post('/lavBane', checkAdminAuth, (req, res) => {
    const {
        Adresse,
        PostnummerogBy,
        Banetype,
        Sport,
        Navn,
        Kodeord
    } = req.body;

    const query = `
        INSERT INTO baner (
            Adresse,
            PostnummerogBy,
            Banetype,
            Sport,
            Navn,
            Kodeord
        ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [Adresse, PostnummerogBy, Banetype, Sport, Navn, Kodeord], (err, result) => {
        if (err) {
            console.error('Fejl ved oprettelse af bane: ' + err.message);
            res.status(500).send('Serverfejl');
        } else {
            console.log('Bane oprettet:', result);
            // Send meddelelse om tilføjet bane
            res.redirect('/lavBane?added=true');
        }
    });
});

app.post('/sletBruger/:id', checkAdminAuth, (req, res) => {
  const id = req.params.id;

  const query = `
      DELETE FROM brugere WHERE id = ?
  `;

  db.query(query, [id], (err, result) => {
      if (err) {
          console.error('Fejl ved sletning af bruger: ' + err.message);
          res.status(500).send('Serverfejl');
      } else {
          console.log('Bruger slettet:', result);

          // Send the updated list of brugere
          db.query('SELECT * FROM brugere', (error, updatedBrugere) => {
              if (error) {
                  console.error('Fejl ved hentning af brugere: ' + error.message);
                  res.status(500).json({ error: 'Der opstod en fejl' });
              } else {
                  res.json(updatedBrugere);
              }
          });
      }
  });
}
)


app.post('/sletBane/:id', checkAdminAuth, (req, res) => {
  const id = req.params.id;

  const query = `
      DELETE FROM baner WHERE id = ?
  `;

  db.query(query, [id], (err, result) => {
      if (err) {
          console.error('Fejl ved sletning af bane: ' + err.message);
          res.status(500).send('Serverfejl');
      } else {
          console.log('Bane slettet:', result);

          // Send the updated list of baner
          db.query('SELECT * FROM baner', (error, updatedBaner) => {
              if (error) {
                  console.error('Fejl ved hentning af baner: ' + error.message);
                  res.status(500).json({ error: 'Der opstod en fejl' });
              } else {
                  res.json(updatedBaner);
              }
          });
      }
  });
});


  app.post('/lavBooking', checkAuth, (req, res) => {

    const {
      BookingType,
      BaneID,
      BrugerID,
      KalenderID,
      MedspillerID,
      Gæst,
      Gentagene,
      Dato,
      Klokkeslæt,
    } = req.body;

    if( Gæst == 'Ja'){
      MedspillerID = null;
    }
    Gentagene = "Nej";

    const query = `
      INSERT INTO booking (
        BookingType,
        BaneID,
        BrugerID,
        KalenderID,
        MedspillerID,
        Gæst,
        Gentagene,
        Dato,
        Klokkeslæt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [BookingType, BaneID, BrugerID, KalenderID, MedspillerID, Gæst, Gentagene, Dato, Klokkeslæt], (err, result) => {
      if (err) {
        console.error('Fejl ved booking: ' + err.message);
        res.status(500).send('Serverfejl');
      } else {
        console.log('Booking registreret:', result);
        
      }
    }
    );
  });
  app.delete('/delete-booking/:id', checkAuth, (req, res) => {
    const bookingId = req.params.id; // Extract the booking ID from the URL parameter

    // Perform deletion operation in your database
    // You should implement your database-specific logic here to delete the booking with the provided ID
    // For example, using a SQL DELETE statement or an ORM's delete method

    // Example using raw SQL with your database connection (replace this with your actual database logic)
    const sqlDeleteBooking = 'DELETE FROM booking WHERE id = ?';
    db.query(sqlDeleteBooking, [bookingId], (error, result) => {
        if (error) {
            console.error('Error deleting booking:', error);
            res.status(500).json({ error: 'Failed to delete booking' });
        } else {
            // Successful deletion
            res.status(200).json({ message: 'Booking deleted successfully' });
            console.log('Booking deleted successfully');
            // You can send any appropriate response back to the client
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

  app.get('/hentbrugere', (req, res) => {
    db.query('SELECT * FROM brugere', (error, result) => {
        if (error) {
            console.error('Fejl ved hentning af brugere: ' + error.message);
            res.status(500).json({ error: 'Der opstod en fejl' });
        } else {
            res.json(result);
            console.log(result);
        }
    }
    );
  });

  app.get('/hentbruger/:id', (req, res) => { 
    const id = req.params.id;
    
    db.query('SELECT * FROM brugere WHERE id = ?', [id], (error, result) => {
        if (error) {
            console.error('Fejl ved hentning af bruger: ' + error.message);
            res.status(500).json({ error: 'Der opstod en fejl' });
        } else {
            res.json(result[0]);
        }
    }
    );
});

app.get('/hentbaner', (req, res) => {
    db.query('SELECT * FROM baner', (error, result) => {
        if (error) {
            console.error('Fejl ved hentning af baner: ' + error.message);
            res.status(500).json({ error: 'Der opstod en fejl' });
        } else {
            res.json(result);
            console.log(result);
        }
    });
});


app.get('/hentBane/:id', (req, res) => {

    const id = req.params.id;
    
    db.query('SELECT * FROM baner WHERE id = ?', [id], (error, result) => {
        if (error) {
            console.error('Fejl ved hentning af bane: ' + error.message);
            res.status(500).json({ error: 'Der opstod en fejl' });
        } else {
            res.json(result[0]);
        }
    }
    );
});

app.post('/redigerBruger/:id', checkAdminAuth, (req, res) => {
  const id = req.params.id;
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

  const query = `
      UPDATE brugere
      SET Brugernavn = ?, Kodeord = ?, Brugertype = ?, Fornavn = ?, Efternavn = ?, Telefonnummer = ?, Email = ?, Adresse = ?, PostnummerogBy = ?, Medlemstype = ?
      WHERE id = ?
  `;
  db.query(query, [Brugernavn, Kodeord, Brugertype, Fornavn, Efternavn, Telefonnummer, Email, Adresse, PostnummerogBy, Medlemstype, id], (err, result) => {
      if (err) {
          console.error('Fejl ved redigering af bruger: ' + err.message);
          res.status(500).send('Serverfejl');
      } else {
          console.log('Bruger redigeret:', result);

          // Send den opdaterede liste over brugere
          db.query('SELECT * FROM brugere', (error, updatedBrugere) => {
              if (error) {
                  console.error('Fejl ved hentning af brugere: ' + error.message);
                  res.status(500).json({ error: 'Der opstod en fejl' });
              } else {
                  res.json(updatedBrugere);
              }
          });
      }
  }
  );
});

app.post('/redigerBane/:id', checkAdminAuth, (req, res) => {
  const id = req.params.id;
  const {
      Adresse,
      PostnummerogBy,
      Banetype,
      Sport,
      Navn,
      Kodeord
  } = req.body;

  const query = `
      UPDATE baner
      SET Adresse = ?, PostnummerogBy = ?, Banetype = ?, Sport = ?, Navn = ?, Kodeord = ?
      WHERE id = ?
  `;

  db.query(query, [Adresse, PostnummerogBy, Banetype, Sport, Navn, Kodeord, id], (err, result) => {
      if (err) {
          console.error('Fejl ved redigering af bane: ' + err.message);
          res.status(500).send('Serverfejl');
      } else {
          console.log('Bane redigeret:', result);

          // Send den opdaterede liste over baner
          db.query('SELECT * FROM baner', (error, updatedBaner) => {
              if (error) {
                  console.error('Fejl ved hentning af baner: ' + error.message);
                  res.status(500).json({ error: 'Der opstod en fejl' });
              } else {
                  res.json(updatedBaner);
              }
          });
      }
  });
});

app.get('/getSpillerID/:username', (req, res) => {
  const username = req.params.username;
  const sql = `
      SELECT id FROM brugere WHERE Brugernavn = ?;
  `;

  db.query(sql, [username], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).json({ success: false, error: 'Fejl under hentning af brugerens id' });
      } else {
          if (result.length > 0) {
              const medspillerID = result[0].id;
              res.json({ success: true, medspillerID });
          } else {
              res.status(404).json({ success: false, error: 'Brugeren blev ikke fundet' });
          }
      }
  });
});

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

// check user auth

function checkAuth(req, res, next) {
    if (req.session && req.session.user) {
      // Hvis der er en aktiv session, og currentUser er gemt i sessionen
      return next(); // Brugeren er godkendt, fortsæt med anmodningen
    } else {
      res.redirect('/login'); // Hvis ikke, omdirigér til login-siden
    }
  }

  app.get('/search', (req, res) => {
    const query = req.query.query.toLowerCase();
    const searchQuery = '%' + query + '%'; // Brug wildcard-tegn for at finde delvise match
    const searchSQL = 'SELECT Brugernavn FROM brugere WHERE Brugernavn LIKE ?';

    db.query(searchSQL, [searchQuery], (err, results) => {
        if (err) {
            console.error('Fejl under søgning efter brugere: ' + err.message);
            res.status(500).send('Serverfejl');
        } else {
            res.json(results);
        }
    });
});
  app.get('/bookingType',(req,res) => {
    const sqlString='SELECT DISTINCT BookingType FROM booking;';
    db.query(sqlString, (error, result) => {
      if(error){
        console.error('ingen BookingType fundet ' + error.message);
        res.status(204).send('ingen data returneret');
      }
      else{
        res.json(result);
        //console.log(result);
      }
      
    });
  });


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
    res.redirect('/');
  });
});

app.get('/minprofil', checkAuth, (req, res) => {
    // checkAuth middleware sikrer, at brugeren er logget ind
    // Du kan hente brugeroplysninger fra sessionen eller databasen
    const currentUser = req.session.user; // Antager, at brugeroplysninger gemmes i sessionen
  
    res.render('minprofil', { user: currentUser });
  });

  app.get('/registrer', checkAdminAuth, (req, res) => {
    res.render('registrer');
  });

  app.get('/redigerprofil', checkAuth, (req, res) => {
    // Hent brugeroplysninger fra sessionen
    const currentUser = req.session.user;
  
    res.render('redigerprofil', { user: currentUser });
  });

  app.get('/kurv', (req, res) => {
    // Hent eksisterende bookinger fra sessionStorage
    console.log('Data, der skal parses:', req.session.bookings);
    let storedBookings;
  
    try {
      // Tjek om req.session.bookings er en streng, før JSON-parsing
      storedBookings = JSON.parse(req.session.bookings || '[]');
    } catch (error) {
      console.error('Fejl ved parsing af sessionstorage-data: ', error);
      storedBookings = [];
    }
  
    // Kontroller om bruger er logget ind og har en id
    if (req.session.user && req.session.user.id) {
      // Hent alle bookinger relateret til brugerens id fra databasen
      db.query('SELECT * FROM booking WHERE BrugerID = ?', [req.session.user.id], (error, userBookings) => {
        if (error) {
          console.error('Fejl ved hentning af brugerens bookinger fra database: ' + error.message);
          res.status(500).send('Fejl ved hentning af brugerens bookinger fra database');
        } else {
          res.render('kurv', {
            user: req.session.user,
            bookedData: storedBookings, // Send sessionstorage-dataene til visning
            userBookings: userBookings, // Send brugerens bookinger til visning
          });
        }
      });
    } else {
      // Bruger er ikke logget ind, håndter dette efter behov
      res.redirect('/login'); // eller anden håndtering
    }
  });
  

app.post('/opretBooking', (req, res) => {
  try {
    const { bookingForm } = req.body;

    // Log data for at følge med i, hvad der bliver modtaget
    console.log('Modtaget bookingForm:', bookingForm);

    // Tjek om der er en sessionsvariabel for bookinger, hvis ikke, opret en
    req.session.bookings = req.session.bookings || [];

    // Tilføj bookingForm til sessionsvariablen
    req.session.bookings.push(bookingForm);

    // Log sessiondata efter opdatering
    console.log('Session data efter opdatering:', req.session);

    // Send en bekræftelse til klienten
    res.json({ success: true, message: 'BookingForm gemt i serverens session.' });
  } catch (error) {
    console.error('Fejl under håndtering af opretBooking-anmodning:', error);
    res.status(500).json({ success: false, message: 'Serverfejl under håndtering af opretBooking-anmodning.' });
  }
});

app.post('/OpretBooking/submit', async (req, res) => {
  const successMessage = 'Booking tilføjet til Indkøbskurven.';
  res.status(200).json({ message: successMessage });
});



// Serverroute for at fjerne bookinger fra serverens session
app.post('/clearServerSessionBookings', (req, res) => {
  // Fjern alle bookinger fra sessionsvariablen
  req.session.bookings = [];

  // Send en bekræftelse til klienten
  res.json({ success: true, message: 'Bookinger fjernet fra serverens session.' });
});

  app.get('/kalender2', (req, res) => {
    const user = req.session.user;

    // Hent banerne fra databasen
    db.query('SELECT * FROM baner', (banerError, banerResult) => {
        if (banerError) {
            console.error('Fejl ved hentning af baner: ' + banerError.message);
            res.status(500).json({ error: 'Der opstod en fejl ved hentning af baner' });
        } else {
            // Hent booking-data fra databasen
            db.query('SELECT * FROM booking', (bookingError, bookingResult) => {
                if (bookingError) {
                    console.error('Fejl ved hentning af bookinger: ' + bookingError.message);
                    res.status(500).send('Serverfejl');
                } else {
                    // Send både baner og bookinger til skabelonen
                    res.render('kalender2', {
                        baner: banerResult,
                        data: bookingResult,
                        user: user
                    });
                }
            });
        }
    });
});




  app.get('/lavBooking',checkAuth, (req, res) => {
    const user = req.session.user;
    res.render('lavBooking', { user });
  });

  app.get('/lavBane', checkAdminAuth, (req, res) => {
    const added = req.query.added === 'true';
    const user = req.session.user;

    res.render('lavBane', { added, user });
});

app.get('/sletBane', checkAdminAuth, (req, res) => {
    const user = req.session.user;
    res.render('sletBane', { user });
});

app.get('/redigerogsletbruger', checkAdminAuth, (req, res) => {
  const user = req.session.user;
  res.render('redigerogsletbruger', { user });
});

app.get('/minebooking',checkAuth, (req, res) => {
  const user = req.session.user;
  const userID = req.session.user.id;

  const sqlString =
    'SELECT booking.id, ' +
      'booking.BookingType, ' +
      'baner.Adresse AS Bane_Adresse, ' +
      'baner.PostnummerogBy AS Bane_PostnummerogBy, ' +
      'baner.Banetype AS Bane_Banetype, ' +
      'baner.Sport AS Bane_Sport, ' +
      'baner.Kodeord AS Bane_Kodeord, ' +
      'brugere1.Fornavn AS Bruger_Fornavn, ' +
      'brugere2.Fornavn AS Medspiller_Fornavn, ' +
      'booking.Gæst, ' +
      'booking.Gentagene, ' +
      'booking.Dato, ' +
      'booking.Klokkeslæt ' +
    'FROM booking ' +
    'JOIN baner ON booking.BaneID = baner.id ' +
    'JOIN brugere AS brugere1 ON booking.BrugerID = brugere1.id ' +
    'JOIN brugere AS brugere2 ON booking.MedspillerID = brugere2.id ' +
    'WHERE (BrugerID = ' + userID + ' OR MedspillerID = ' + userID + ') AND booking.BaneID = baner.id'
  ;
  
  db.query(sqlString, (error, result) => {
    if(error){
      console.error('ingen bookinger fundet ' + error.message);
      res.status(204).send('ingen data returneret');
    }
    else{
      res.render('minebooking', { data: result, user: user });
      console.log(result);
    }
    
  });
  //res.render('minebooking', { user });
});

app.get('/OpretHoldSide', checkAdminAuth, (req, res) => {
  const user = req.session.user;
  res.render('opretHold', { user });
});