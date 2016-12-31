var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.redirect('/matches/0');
});

router.get('/:matchId', function(req, res, next) {
    res.render('games', { matchId: req.params.matchId, redTeam: '100', greenTeam: '400' });
});

module.exports = router;