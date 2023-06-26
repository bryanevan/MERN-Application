//requirements + frameworks
const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  uuid = require('uuid'),
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  bodyParser = require('body-parser');

//Models
const Movies = Models.Movie;
const Users = Models.User;

const {check, validationResult} = require('express-validator');

//Mongoose connection to db for CRUD ops
//local connection _ for testing:
//mongoose.connect('mongodb://localhost:27017/myCinema', { useNewUrlParser: true, useUnifiedTopology: true });

//Atlas & Heroku connection:
require('dotenv').config({path: path.resolve(__dirname, './env/env.js')});
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(process.env.CONNECTION_URI);

// morgan logger, app, body-parser
const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

//CORS
const cors = require('cors');
let allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:27017',
  'http://localhost:1234',
  'http://localhost:52090',
  'http://localhost:64003',
  'http://localhost:4200',
  'https://mycinema.herokuapp.com/',
  'https://my-cinema808.netlify.app',
  'https://bryanevan.github.io/myFlix_Angular/welcome'];

  app.use(cors({
    origin: (origin, callback) => {
      if(!origin) return callback(null, true);
      if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
        let message = 'The CORS policy for this application doesn/t allow access from origin ' + origin;
        return callback(new Error(message ), false);
      }
      return callback(null, true);
    }
  }));

//Middleware
app.use(express.static('public')); //server static files
app.use(morgan('common', { stream: accessLogStream })); //log requests in terminal
app.use(bodyParser.json()); //use body-parser
app.use(bodyParser.urlencoded({ extended: true })); //...encoded

//import auth endpoints after body-parser
let auth = require('./auth')(app);

//require passport for auth
const passport = require('passport');
require('./passport');

//READ
app.get('/', (req, res) => {
  console.log('Welcome to myCinema');
  res.send('Welcome to myCinema!');
});
app.get('/documentation', (req, res) => {                  
  console.log('Documentation Request');
  res.sendFile('public/Documentation.html', {root: __dirname});
});

app.get('/users', passport.authenticate('jwt',{session:false}), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/movies', passport.authenticate('jwt',{session:false}), (req, res) => {
  Movies.find({ Movies: req.params.Movies })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/users/:Username', passport.authenticate('jwt',{session:false}), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/movies/:Title', passport.authenticate('jwt',{session:false}), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/movies/genre/:genreName', passport.authenticate('jwt',{session:false}), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.genreName })
    .then((movies) => {
      res.json(movies.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/movies/director/:directorName', passport.authenticate('jwt',{session:false}), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.directorName })
    .then((movies) => {
      res.json(movies.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//CREATE
app.post('/users',
  [
    check('Username', 'Username is required').isLength({min: 4}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search if username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

app.post('/users/:Username/movies/:id', passport.authenticate('jwt',{session:false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
                          {$addToSet:{favoriteMovieList: req.params.id}},
                          req.body,
                          { new: true })
  .then((updatedUser) => {
    res.status(200).json(updatedUser);
  })
  .catch(error => {
    res.status(500).json({ error: error.message });
  });
});


//UPDATE
app.put('/users/:Username', passport.authenticate('jwt',{session:false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true })
  .then((updatedUser) => {
    res.status(200).json(updatedUser);
  })
  .catch(error => {
    res.status(500).json({ error: error.message });
  });
});


//DELTE
app.delete('/users/:Username', passport.authenticate('jwt',{session:false}), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.delete('/users/:Username/movies/:id', passport.authenticate('jwt',{session:false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
                          {$pull:{favoriteMovieList: req.params.id}},
                          req.body,
                          { new: true })
  .then((updatedUser) => {
    res.status(200).json(updatedUser);
  })
  .catch(error => {
    res.status(500).json({ error: error.message });
  });
});


// Morgan middleware error handling function
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Uh oh, something went wrong');
});
//variable port listening
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
