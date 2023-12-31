var express = require('express'),
  session = require('express-session'),
  passport = require('passport'),
  SpotifyStrategy = require('passport-spotify').Strategy,
  consolidate = require('consolidate');

require('dotenv').config();

const bodyParser = require('body-parser');

var localport = 3000;
//var authCallbackPath = '/index.html';
var authCallbackPath = '/auth/spotify/callback';

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

async function getArtist(accessToken) {
  const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=100&offset=0', {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  });

  const data = await response.json();
  const tracks = data.items;

  // Correcting the structure within the map function
  tracksAndAlbums = tracks.map(track => ({
    trackName: track.name,
    albumName: track.album.name
  }));
}

const mongoose = require("mongoose");

mongoose.connect('mongodb+srv://dabrutis:zyWNRX92O7s8YiMl@cluster0.preryr8.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const highScoreSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
  },
});

const HighScore = mongoose.model("HighScore", highScoreSchema);

module.exports = HighScore;

passport.use(
  new SpotifyStrategy(
    {
      //clientID: process.env.CLIENT_ID,
      clientID: '34d0e6eb6a32491a91c9dba78b1a4926',
      //clientSecret: process.env.CLIENT_SECRET,
      clientSecret: 'ed4da973c5ef4a3c9cea45eb94de492e',
      //callbackURL: 'http://localhost:' + localport + authCallbackPath,
      callbackURL: 'https://spotifysongiq.azurewebsites.net' + authCallbackPath,
    },
    function (accessToken, refreshToken, expires_in, profile, done) {
      process.nextTick(function () {
        getArtist(accessToken);
        return done(null, profile);
      });
    }
  )
);

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(
  session({secret: 'session ID cookie yuuuuuuum', resave: true, saveUninitialized: true})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

app.engine('html', consolidate.nunjucks);

app.get('/', function (req, res) {
  res.render('index.html', {user: req.user});
});

app.get('/account', ensureAuthenticated, function (req, res) {
  res.render('account.html', {user: req.user});
});

app.get('/login', function (req, res) {
  res.render('login.html', {user: req.user});
});

app.get(
  '/auth/spotify',
  passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-read-private', 'user-library-read', 'user-top-read'],
    showDialog: true,
  })
);

app.get(
  authCallbackPath,
  passport.authenticate('spotify', {failureRedirect: '/login'}),
  function (req, res) {
    res.redirect('/');
  }
);

app.get('/logout', function (req, res) {
  req.logout(function(err){
    if(err) {
      return next(err);
    }
    res.redirect('/');
  });
});

app.get('/leaderboard', function(req, res) {
  res.render('leaderboard.html', { user: req.user });
});

app.get('/api/tracks', (req, res) => {
  res.json(tracksAndAlbums);
});

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

app.post("/api/highscores", async (req, res) => {
  const { score } = req.body; // Ensure that 'score' is present in the request body

  try {
    if (typeof score !== 'undefined') {
      const highScore = new HighScore({ score });
      await highScore.save();
      res.status(201).send("High score saved!");
    } else {
      res.status(400).send("Score is missing in the request body");
    }
  } catch (error) {
    res.status(500).send("Error saving high score");
  }
});

app.get('/leaderboard-scores', async (req, res) => {
  try {
    const highScores = await HighScore.find().sort({ score: -1 }).limit(10);
    res.json(highScores);
  } catch (error) {
    console.error('Error fetching high scores:', error);
    res.status(500).json({ error: 'Error fetching high scores' }); // Send an error response
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}