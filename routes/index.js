var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
      url: req.originalUrl,
      title: 'My Test App'
    });
});

module.exports = router;