var express = require('express')
var router = express.Router()
var db = require('../db')

var data = [
  {
    urlName: 'practice',
    name: 'Practice',
    id: 1
  },
  {
    urlName: 'competition1',
    name: '1st Competition',
    id: 2
  },
  {
    urlName: 'competition2',
    name: '2nd Competition',
    id: 3
  },
  {
    urlName: 'competition3',
    name: '3rd Competition',
    id: 4
  },
  {
    urlName: 'championship',
    name: 'Championship',
    id: 5
  },
  {
    urlName: 'field-testing',
    name: 'Field Testing',
    id: 6
  }
]

function currentTournament(url) {
  var tourn
  data.forEach(function(element) {
    if (url.includes(element.urlName)) {
      tourn = element
    }
  })
  return tourn
}

router.get('/', function(req, res, next) {
  var tourn = currentTournament(req.originalUrl)
  if (!tourn) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }

  if (tourn.id === 6) {
    res.redirect('/field-testing/0')
  } else {
    db.get(function(err) {
      if (err)
        next(err)
    }).query(
      'select * from tournament_info where tournament_id = ?',
      tourn.id,
      function(err, rows) {
        if (err) {
          next(err)
        }

        var matches = new Object();
        if(rows[0]) {
          for (let row of rows) {
            console.log(row.match_id)
            matches[row.match_id] = {
              greenTeam: row.green_team,
              greenScore: row.green_score,
              greenDq: row.green_dq,
              greenResult: row.green_result,
              redTeam: row.red_team,
              redScore: row.red_score,
              redDq: row.red_dq,
              redResult: row.red_result
            }
          }

          res.render('tournaments', {
            url: req.originalUrl,
            tournamentName: tourn.urlName,
            matches: matches
          })

        } else {
          res.render('index', {
            url: req.originalUrl,
            title: tourn.name
          })
        }
      }
    )
  }
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

      var matchInfo;
      if(rows[0]) {
        matchInfo = {
          greenName: rows[0].green_team,
          greenScore: rows[0].green_score,
          greenPenalty: rows[0].green_penalty,
          greenDq: rows[0].green_dq,
          greenResult: rows[0].green_result,
          redName: rows[0].red_team,
          redScore: rows[0].red_score,
          redPenalty: rows[0].red_penalty,
          redDq: rows[0].red_dq,
          redResult: rows[0].red_result,
          autoCornersTested: rows[0].auto_corners_tested,
          autoEmergencyCycled: rows[0].auto_emergency_cycled,
          autoSolarPanel: rows[0].auto_solar_panel,
          manualSolarPanel1: rows[0].manual_solar_panel_1,
          manualSolarPanel2: rows[0].manual_solar_panel_2,
          manualEmergencyCleared: rows[0].manual_emergency_cleared,
          rocketPosition: rows[0].rocket_position,
          rockWeight: rows[0].rock_weight,
          rockScore: rows[0].rock_score,
          rocketBonus: rows[0].rocket_bonus,
          notes: rows[0].notes
        }
      } else {
        matchInfo = {
          greenName: 'Green Team',
          greenScore: 0,
          greenPenalty: 0,
          greenDq: 0,
          greenResult: 'N',
          redName: 'Red Team',
          redScore: 0,
          redPenalty: 0,
          redDq: 0,
          redResult: 'N',
          autoCornersTested: 0,
          autoEmergencyCycled: 0,
          autoSolarPanel: 0,
          manualSolarPanel1: 0,
          manualSolarPanel2: 0,
          manualEmergencyCleared: 0,
          rocketPosition: 1,
          rockWeight: 0,
          rockScore: 0,
          rocketBonus: 0,
          notes: null
        }
      }

      res.render('matches', {
        url: req.originalUrl,
        tournamentId: tourn.id,
        matchId: req.params.matchId,
        match: matchInfo
      })
    }
  )
})

module.exports = router
