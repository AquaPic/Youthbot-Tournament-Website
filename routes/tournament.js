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

function indexLimiter(index, max) {
  if (index >= max) {
    return (index % max) + 1
  } else {
    return index
  }
}

router.get('/', function(req, res, next) {
  var tourn = currentTournament(req.originalUrl)
  if (!tourn) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }

  var matchIniatized = false

  if (tourn.id === 6) {
    res.redirect('/field-testing/0')
  } else if (tourn.id === 2) {
    db.get(
      function(err) {
        if (err)
          next(err)
      }
    ).query(
      'select * from tournament_info where tournament_id = ?',
      tourn.id,
      function(err, rows) {
        if (err) {
          next(err)
        }

        if(rows[0]) {
          var matches = {}
          matchIniatized = true
          var schools = []
          matches['matchesPerRound'] = 0
          matches['roundCount'] = 0

          for (let row of rows) {
            if (!schools.includes(row.green_team)) {
              schools.push (row.green_team)
            }

            if (!schools.includes(row.red_team)) {
              schools.push (row.red_team)
            }

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

          var schoolsParticipating = schools.length
          matches['matchesPerRound'] = schoolsParticipating / 2
          matches['roundCount'] = schoolsParticipating - 1

          res.render('tournaments', {
            url: req.originalUrl,
            user: req.user,
            tournamentName: tourn.urlName,
            matches: matches
          })
        }

        if (!matchIniatized) {
          db.get(
            function(err) {
              if (err)
                next(err)
            }
          ).query(
            'select school_name from schools where participating=1;',
            function(err, rows) {
              if (err) {
                next(err)
              }

              var teams = new Array();
              if(rows[0]) {
                for (let row of rows) {
                  teams.push(row.school_name)
                }
              }

              teams.sort()
              res.render('team-selection', {
                url: req.originalUrl,
                user: req.user,
                title: tourn.name,
                teams: teams
              })
            }
          )
        }
      }
    )
  } else {
    res.render('index', { url: req.originalUrl, user: req.user, title: tourn.name })
  }
})

router.get('/:matchId', function(req, res, next) {
  var tourn = currentTournament(req.originalUrl)
  if (!tourn) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }

  db.get(
    function(err) {
      if (err)
        next(err)
    }
  ).query(
    'select * from match_info where tournament_id = ? and match_id = ?;',
    [tourn.id, req.params.matchId],
    function(err, rows) {
      if (err) {
        next(err)
      }

      var matchInfo;
      if(rows[0]) {
        matchInfo = {
          played: rows[0].played,
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
          played: 0,
          greenName: 'Green Team',
          greenScore: 0,
          greenPenalty: 0,
          greenDq: 0,
          greenResult: 'I',
          redName: 'Red Team',
          redScore: 0,
          redPenalty: 0,
          redDq: 0,
          redResult: 'I',
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
        user: req.user,
        tournamentId: tourn.id,
        matchId: req.params.matchId,
        match: matchInfo
      })
    }
  )
})

router.post('/', function(req, res, next) {
  if (req.body.schoolName) {
    db.get(
      function(err) {
        if (err)
          next(err)
      }
    ).query(
      'insert into schools (school_name, participating) values (?, 1);',
      req.body.schoolName,
      function(err, rows) {
        if (err) {
          next(err)
        }

        res.redirect('/' + currentTournament(req.originalUrl).urlName)
      }
    )
  } else {
    next()
  }
})

router.post('/', function(req, res, next) {
  if (req.body.schools) {
    var tourn = currentTournament(req.originalUrl)
    if (!tourn) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    }

    var schools = req.body.schools
    if (schools.length % 2 === 1) {
      schools.splice(0, 0, 'Bye')
    }

    var schoolIds = {}
    db.get(
      function(err) {
        if (err)
          next(err)
      }
    ).query(
      'select * from schools;',
      function(err, rows) {
        if (err) {
          next(err)
        }

        if(rows[0]) {
          for (let row of rows) {
            if (schools.includes(row.school_name)) {
              schoolIds[row.school_name] = row.school_id
            }
          }
        }

        var schoolsParticipating = schools.length
        var matchesPerRound = schoolsParticipating / 2
        var roundCount = schoolsParticipating - 1

        var sqlQuery = 'insert into matches '
        sqlQuery += '(tournament_id, match_number, played, '
        sqlQuery += 'red_team, red_result, green_team, green_result) values '

        var matchNumber = 1

        for (var round = 0; round < roundCount; ++round) {
          for (var intermatch = 0; intermatch < matchesPerRound - 1; ++intermatch) {
            var green = indexLimiter(schoolsParticipating / 2 + round - 1 - intermatch, schoolsParticipating)
            var red = indexLimiter(green + (intermatch * 2) + 1, schoolsParticipating)

            if (sqlQuery.endsWith (')')) {
              sqlQuery += (', ')
            }

            sqlQuery += ('(' + tourn.id + ', ' + matchNumber + ', 0, ')
            sqlQuery += (schoolIds[schools[red]] + ', \'N\', ')
            sqlQuery += (schoolIds[schools[green]] + ', \'N\')')
            ++matchNumber
          }

          var red = 0
          var green = indexLimiter(schoolsParticipating - 1 + round, schoolsParticipating)

          if (sqlQuery.endsWith (')')) {
            sqlQuery += (', ')
          }

          sqlQuery += ('(' + tourn.id + ', ' + matchNumber + ', 0, ')
          sqlQuery += (schoolIds[schools[red]] + ', \'N\', ')
          sqlQuery += (schoolIds[schools[green]] + ', \'N\')')
          ++matchNumber
        }

        db.get(
          function(err) {
            if (err)
              next(err)
          }
        ).query(sqlQuery, function(err, rows) {
          if (err) {
            next(err)
          }

          res.redirect('/' + currentTournament(req.originalUrl).urlName)
        })
      }
    )
  } else {
    res.redirect('/' + currentTournament(req.originalUrl).urlName)
  }
})

module.exports = router
