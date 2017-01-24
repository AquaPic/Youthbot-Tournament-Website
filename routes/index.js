var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    url: req.originalUrl,
    user: req.user,
    title: 'YouthBOT 2017 Standings'
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', {
    url: req.originalUrl,
    user: req.user
  })
})

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

module.exports = router;
