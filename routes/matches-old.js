var express = require('express')
var router = express.Router()
var db = require('../db')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('/matches/1')
})

router.get('/:matchId', function(req, res, next) {
  var pool = db.get(function(err) {
    if (err)
      next(err)
  })

  pool.query(
    'select * from match_info where tournament_id = ? and match_id = ?',
    ['6', req.params.matchId],
    function(err, rows) {
      if (err) {
        next(err)
      }

      var redName = rows[0].red_team
      var greenName = rows[0].green_team
      var score = rows[0].score

      res.render('matches', {
        url: req.originalUrl,
        matchId: req.params.matchId,
        redTeamName: redName,
        greenTeamName: greenName,
        score: score
      })
    }
  )
})

module.exports = router
