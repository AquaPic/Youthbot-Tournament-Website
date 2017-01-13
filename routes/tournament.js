var express = require('express')
var router = express.Router()
var db = require('../db')

var data = [
  {
    name: 'practice',
    id: 1
  },
  {
    name: 'competition1',
    id: 2
  },
  {
    name: 'competition2',
    id: 3
  },
  {
    name: 'competition3',
    id: 4
  },
  {
    name: 'championship',
    id: 5
  },
  {
    name: 'field-testing',
    id: 6
  }
]

function currentTournament(url) {
  var tourn
  data.forEach(function(element) {
    if (url.includes(element.name)) {
      tourn = element
    }
  })
  return tourn
}

router.get('/', function(req, res, next) {
  var tourn = currentTournament(String(req.originalUrl))
  if (!tourn) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }

  res.render('tournaments', {
    url: req.originalUrl,
    tournamentName: tourn.name
  })
})

router.get('/:matchId', function(req, res, next) {
  var tourn = currentTournament(req.originalUrl)
  if (!tourn) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }

  db.get(function(err) {
    if (err)
      next(err)
  }).query(
    'select * from match_info where tournament_id = ? and match_id = ?',
    [tourn.id, req.params.matchId],
    function(err, rows) {
      if (err) {
        next(err)
      }

      var greenName, greenScore, redName, redScore
      if(rows[0]) {


        greenName = rows[0].green_team
        greenScore = rows[0].green_score
        redName = rows[0].red_team
        redScore = rows[0].red_score
      } else {
        greenName = 'Green'
        greenScore = '0'
        redName = 'Red'
        redScore = '0'
      }

      res.render('matches', {
        url: req.originalUrl,
        tournamentId: tourn.id,
        matchId: req.params.matchId,
        greenTeamName: greenName,
        greenTeamScore: greenScore,
        redTeamName: redName,
        redTeamScore: redScore
      })
    }
  )
})

module.exports = router
