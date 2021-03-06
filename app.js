var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var morgan = require('morgan');

var db = require('./db');
var config = require('./config');
var index = require('./routes/index');
var tournament = require('./routes/tournament');

var app = express();

passport.use(new LocalStrategy(
  function (username, password, done) {
    if ((username === config.user.username) && (password === config.user.password)) {
      return done(null, config.user);
    } else {
      return done(null, false, {'message': 'User not found.'});
    }
  })
);

passport.serializeUser(function(user, done) {
  done(null, config.user.id);
});

passport.deserializeUser(function(id, done) {
  done(null, config.user)
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.signingKey));

app.use(session({
    secret: config.signingKey,
    resave: true,
    saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(morgan('combined'));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/practice', tournament);
app.use('/competition1', tournament);
app.use('/competition2', tournament);
app.use('/competition3', tournament);
app.use('/championship', tournament);
app.use('/field-testing', tournament);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    url: req.originalUrl,
    user: req.user
  });
});

db.connect(db.MODE_PRODUCTION, false, function(err) {
  if(err)
    next(err)

  console.log('Successfully connected to SQL server')
})

module.exports = app;