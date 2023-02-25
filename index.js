const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path');

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

// morgan logger
app.use(morgan('common', { stream: accessLogStream }));
app.use(express.static('public'));

let topMovies = [
  {
    title: 'Parasite',
    director: 'Bong Joon-ho'
  },
  {
    title: 'Fight Club',
    director: 'David Fincher'
  },
  {
    title: 'Casino',
    director: 'Martin Scorsese'
  },
  {
    title: 'Goodfellas',
    director: 'Martin Scorsese'
  },
  {
    title: 'Wolf of Wallstreet',
    director: 'Martin Scorsese'
  },
  {
    title: 'Pulp Fiction',
    director: 'Quentin Tarantino'
  },
  {
    title: 'Resevior Dogs',
    director: 'Quentin Tarantino'
  },
  {
    title: 'Rush',
    director: 'Ron Howard'
  },
  {
    title: 'All Quiet on the Western Front',
    director: 'Edward Berger'
  },
  {
    title: 'Saving Private Ryan',
    director: 'Steven Spielberg'
  },
];

// GET requests
app.get('/', (req, res) => {
    console.log('Welcome to myCinema');
    res.send('Welcome to myCinema!');
  });
  
  app.get('/movies', (req, res) => {                  
    console.log('Top movies request');
    res.json(topMovies);
  });
  app.get('/documentation', (req, res) => {                  
    console.log('Documentation Request');
    res.send('All documentation found here.');
  });
  
  // Morgan middleware error handling function
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error');
  });
// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});