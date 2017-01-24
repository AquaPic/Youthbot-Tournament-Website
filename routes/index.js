var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/', function(req, res, next) {
  res.render('index', {
    url: req.originalUrl,
    user: req.user,
    title: 'YouthBOT 2017 Standings'
  });
});

router.get('/login', function(req, res, next) {
  var bounce = req.header('Referer') || '/'
  if (bounce.includes(':3000')) {
    bounce = bounce.substring(bounce.indexOf(':3000') + 5, bounce.length)
  }

  if (bounce !== '/login') {
    req.session.bounceBack = bounce
  }

  res.render('login', {
    url: req.originalUrl,
    user: req.user
  })
})

router.get('/logout', function(req, res, next) {
  bounceBack = req.header('Referer') || '/'
  if (bounceBack.includes(':3000')) {
    bounceBack = bounceBack.substring(bounceBack.indexOf(':3000') + 5, bounceBack.length)
  }

  req.logout()
  res.redirect(bounceBack)
})

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.redirect('/login');
    }

    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }

      return res.redirect(req.session.bounceBack);
    });
  })(req, res, next);
});

module.exports = router;
