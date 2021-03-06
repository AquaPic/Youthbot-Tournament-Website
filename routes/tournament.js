var express = require('express')
var router = express.Router()
var db = require('../db')
var _ = require('lodash')

var data = [
  {
    urlName: 'practice',
    name: 'Practice',
    id: 1
  },
  {
    urlName: 'competition1',
    name: '1st Competition',
    id: 11
  },
  {
    urlName: 'competition2',
    name: '2nd Competition',
    id: 12
  },
  {
    urlName: 'competition3',
    name: '3rd Competition',
    id: 13
  },
  {
    urlName: 'championship',
    name: 'Championship',
    id: 14
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
  } else if ((tourn.id >= 2) && (tourn.id <= 14)) {
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

          for (var row of rows) {
            if (row.match_id !== 0) { // hack to prevent display issues if match 0 is accidently scored
              if (row.green_team === "Anderson Prep Academy") {
                row.green_team = "APA"
              }

              if (!_.includes(schools, row.green_team)) {
                if (row.green_team != null) {
                  schools.push (row.green_team)
                }
              }

              if (row.red_team === "Anderson Prep Academy") {
                row.red_team = "APA"
              }

              if (!_.includes(schools, row.red_team)) {
                if (row.red_team != null) {
                  schools.push (row.red_team)
                }
              }
              
              if (_.includes(row.red_result, "I")) {
                row.red_result = null
              }
              
              if (_.includes(row.green_result, "I")) {
                row.green_result = null
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
          }

          if (tourn.id === 5) { // 2017 Championship
            matches['numSchools'] = schools.length

            res.render('championship', {
              url: req.originalUrl,
              user: req.user,
              tournamentName: tourn.urlName,
              matches: matches
            })
          } else if  (tourn.id === 14) { // 2018 Championship
            matches['matchesPerRound'] = 3
            matches['roundCount'] = 6

            res.render('championship2018', {
              url: req.originalUrl,
              user: req.user,
              tournamentName: tourn.urlName,
              matches: matches
            })
          } else {
            var schoolsParticipating = schools.length
            matches['matchesPerRound'] = schoolsParticipating / 2
            matches['roundCount'] = schoolsParticipating - 1
            
            if ((tourn.id >= 12) && (tourn.id <= 13)) {              
              matches['roundCount'] = matches['roundCount'] * 2
            }

            res.render('tournaments', {
              url: req.originalUrl,
              user: req.user,
              tournamentName: tourn.urlName,
              matches: matches
            })
          }
        } else {
          db.get(
            function(err) {
              if (err)
                next(err)
            }
          ).query(
            'select * from standings_by_score;',
            function(err, rows) {
              if (err) {
                next(err)
              }

              var teams = new Array();
              if(rows[0]) {
                res.render('team-selection', {
                  url: req.originalUrl,
                  user: req.user,
                  title: tourn.name,
                  teams: rows
                })
              } else {
                res.render('index', { url: req.originalUrl, user: req.user, title: tourn.name })
              }
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

router.get('/override/:matchId', function(req, res, next) {
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
          greenDq: rows[0].green_dq,
          greenResult: rows[0].green_result,
          redName: rows[0].red_team,
          redScore: rows[0].red_score,
          redDq: rows[0].red_dq,
          redResult: rows[0].red_result,
          notes: rows[0].notes
        }
      } else {
        matchInfo = {
          played: 0,
          greenName: 'Green Team',
          greenScore: 0,
          greenDq: 0,
          greenResult: 'I',
          redName: 'Red Team',
          redScore: 0,
          redDq: 0,
          redResult: 'I',
          notes: null
        }
      }

      res.render('match-override', {
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
  if (req.body.action) {
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
      'select * from matches where tournament_id = ?',
      tourn.id,
      function(err, rows) {
        if (err) {
          next(err)
        }

        deleteMatches = false
        startIndex = -1
        endIndex = -1
        if (rows) {
          deleteMatches = true
          startIndex = rows[0].match_id
          endIndex = rows[rows.length - 1].match_id

          for (var row of rows) {
            if (row.played == 1) {
              deleteMatches = false
            }
          }
        }

        if (deleteMatches) {
          db.get(
            function(err) {
              if (err)
                next(err)
            }
          ).query(
            'delete from matches where match_id between ? and ?;',
            [startIndex, endIndex],
            function(err, rows) {
              if (err) {
                next(err)
              }

              db.get(
                function(err) {
                  if (err)
                    next(err)
                }
              ).query(
                'alter table matches auto_increment=?;',
                startIndex,
                function(err, rows) {
                  if (err) {
                    next(err)
                  }
                  res.redirect('/' + currentTournament(req.originalUrl).urlName)
                  console.log('auto increment reset');
                }
              )
            }
          )
        } else {
          console.log('can\'t delete matches');
          res.redirect('/' + currentTournament(req.originalUrl).urlName)
        }
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

        for (var row of rows) {
          if (schools.includes(row.school_name)) {
            schoolIds[row.school_name] = row.school_id
          }
        }

        if (tourn.id === 5) { // only works for 2017 Championship and 7 teams
          if (schools[0] === 'Bye') {
            schools.splice(0, 1)  // remove 'Bye' from the beginning
            schools.push('Bye')   // and append to the end
          }

          var order = []
          var numSchools = schools.length
          var matches = numSchools / 2
          for (var i = 0; i < matches - 1 ; ++i) {
            var team1 = numSchools / 2 - 1 - i, numSchools
            var team2 = team1 + (i * 2) + 1, numSchools
            order.push(schools[team1])
            order.push(schools[team2])
          }

          if (schools[numSchools - 1] === 'Bye') {
            order.splice(0,0, schools[0])
            numSchools = numSchools - 1
          } else {
            order.push(schools[0])
            order.push(schools[numSchools - 1])
          }

          var sqlQuery = 'insert into matches '
          sqlQuery += '(tournament_id, match_number, played, '
          sqlQuery += 'green_team, green_result) values '

          for (var i = 0; i < numSchools * 2; ++i) {
            var index = i
            if (index >= numSchools) {
              index = index - numSchools
            }

            if (sqlQuery.endsWith (')')) {
              sqlQuery += (', ')
            }

            sqlQuery += ('(' + tourn.id + ', ' + (i + 1) + ', 0, ')
            sqlQuery += (schoolIds[order[index]] + ', \'I\')')
          }

          if (numSchools === 7) {
            for (var i = 1; i < order.length; ++i) {
              sqlQuery += (', (' + tourn.id + ', ' + '1' + i + '0' + ', 0, ')
              sqlQuery += (schoolIds[order[i]] + ', \'I\')')
              sqlQuery += (', (' + tourn.id + ', ' + '1' + i + '1' + ', 0, ')
              sqlQuery += (schoolIds[order[i]] + ', \'I\')')
              sqlQuery += (', (' + tourn.id + ', ' + '1' + i + '2' + ', 0, ')
              sqlQuery += (schoolIds[order[i]] + ', \'I\')')
            }

            sqlQuery += (', (' + tourn.id + ', ' + '210' + ', 0, ')
            sqlQuery += (schoolIds[order[0]] + ', \'I\')')
            sqlQuery += (', (' + tourn.id + ', ' + '211' + ', 0, ')
            sqlQuery += (schoolIds[order[0]] + ', \'I\')')
            sqlQuery += (', (' + tourn.id + ', ' + '212' + ', 0, ')
            sqlQuery += (schoolIds[order[0]] + ', \'I\')')
          }

          console.log(sqlQuery);

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
        } else { // general match generation
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
              sqlQuery += (schoolIds[schools[red]] + ', \'I\', ')
              sqlQuery += (schoolIds[schools[green]] + ', \'I\')')
              ++matchNumber
            }

            var red = 0
            var green = indexLimiter(schoolsParticipating - 1 + round, schoolsParticipating)

            if (sqlQuery.endsWith (')')) {
              sqlQuery += (', ')
            }

            sqlQuery += ('(' + tourn.id + ', ' + matchNumber + ', 0, ')
            sqlQuery += (schoolIds[schools[red]] + ', \'I\', ')
            sqlQuery += (schoolIds[schools[green]] + ', \'I\')')
            ++matchNumber
          }

          if ((tourn.id >= 12) && (tourn.id <= 13)) {
            for (var round = 0; round < roundCount; ++round) {
              for (var intermatch = 0; intermatch < matchesPerRound - 1; ++intermatch) {
                var red = indexLimiter(schoolsParticipating / 2 + round - 1 - intermatch, schoolsParticipating)
                var green = indexLimiter(red + (intermatch * 2) + 1, schoolsParticipating)

                if (sqlQuery.endsWith (')')) {
                  sqlQuery += (', ')
                }

                sqlQuery += ('(' + tourn.id + ', ' + matchNumber + ', 0, ')
                sqlQuery += (schoolIds[schools[red]] + ', \'I\', ')
                sqlQuery += (schoolIds[schools[green]] + ', \'I\')')
                ++matchNumber
              }

              var green = 0
              var red = indexLimiter(schoolsParticipating - 1 + round, schoolsParticipating)

              if (sqlQuery.endsWith (')')) {
                sqlQuery += (', ')
              }

              sqlQuery += ('(' + tourn.id + ', ' + matchNumber + ', 0, ')
              sqlQuery += (schoolIds[schools[red]] + ', \'I\', ')
              sqlQuery += (schoolIds[schools[green]] + ', \'I\')')
              ++matchNumber
            }
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
      }
    )
  } else {
    res.redirect('/' + currentTournament(req.originalUrl).urlName)
  }
})

router.post('/override/:matchId' , function(req, res, next) {
  if (req.body.greenScore && req.body.redScore) {
    var tourn = currentTournament(req.originalUrl)
    if (!tourn) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    }

    var sqlQuery = 'update matches '
    sqlQuery += 'set played=1'
    sqlQuery += ', green_score=' + req.body.greenScore
    sqlQuery += ', red_score=' + req.body.redScore

    if(req.body.greenDq == 'on') {
      sqlQuery += ', green_dq=1'
    } else {
      sqlQuery += ', green_dq=0'
    }

    if(req.body.redDq == 'on') {
      sqlQuery += ', red_dq=1'
    } else {
      sqlQuery += ', red_dq=0'
    }

    if(req.body.greenResult == 'on') {
      sqlQuery += ', green_result=\'P\''
    } else {
      sqlQuery += ', green_result=\'N\''
    }

    if(req.body.redResult == 'on') {
      sqlQuery += ', red_result=\'P\''
    } else {
      sqlQuery += ', red_result=\'N\''
    }

    var notes = req.body.notes
    if(!notes.includes('Manually Overriden')) {
      if(notes) {
        notes += '\n'
      }
      notes += 'Manually Overriden'
    }
    sqlQuery += ', notes=\'' + notes + '\''

    sqlQuery += ' where tournament_id=' + tourn.id


    db.get(
      function(err) {
        if (err)
          next(err)
      }
    ).query(
      'select match_id from matches where tournament_id = ? and match_number = ?;',
      [tourn.id, req.params.matchId],
      function(err, rows) {
        if (err) {
          next(err)
        }

        if(rows[0]) {
          sqlQuery += ' and match_id=' + rows[0].match_id + ';'
          console.log(sqlQuery)

          db.get(
            function(err) {
              if (err)
                next(err)
            }
          ).query(
            sqlQuery,
            function(err, rows) {
              if (err) {
                next(err)
              }

              res.redirect('/' + currentTournament(req.originalUrl).urlName + '/' + req.params.matchId)
            }
          )
        }
      }
    )

  } else {
    next()
  }
})

module.exports = router
