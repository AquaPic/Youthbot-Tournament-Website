function sidebar_open() {
  document.getElementById('main').style.marginLeft = '230px';
  document.getElementById('header').style.zIndex = 'auto';
  document.getElementById('header_title').style.marginLeft = '175px';
  document.getElementById('side_nav').style.width = '220px';
  document.getElementById('side_nav').style.display = 'block';
}

function sidebar_close() {
  document.getElementById('main').style.marginLeft = '40px';
  document.getElementById('header').style.zIndex = '1';
  document.getElementById('header_title').style.marginLeft = '0px';
  document.getElementById('side_nav').style.display = 'none';
}

function topbar_open() {
  document.getElementById('main').style.marginTop = '245px';
  document.getElementById('header').style.zIndex = 'auto';
  document.getElementById('top_nav').style.height = '235px';
  document.getElementById('top_nav').style.display = 'block';
}

function topbar_close() {
  document.getElementById('main').style.marginTop = '53px';
  document.getElementById('header').style.zIndex = '1';
  document.getElementById('top_nav').style.display = 'none';
}

function show_add_team() {
  document.getElementById('addTeam').style.display = 'block';
  document.getElementById('addSchool').style.display = 'none';
}

function team_selection_click(number) {
  var elementId = 'click' + number
  var element = document.getElementById(elementId)
  if (element.classList.contains('fa-check-circle-o')) {
    element.classList.remove ('fa-check-circle-o')
    element.classList.add ('fa-circle-o')
  } else {
    element.classList.remove ('fa-circle-o')
    element.classList.add ('fa-check-circle-o')
  }
}

function send_team_post() {
  var listElements = document.body.getElementsByTagName("li")
  var schoolsInMatch = {}
  schoolsInMatch['schools'] = []
  for (let element of listElements) {
    if (element.id.includes('team')) {
      var id = element.id.substring(element.id.indexOf('team') + 4, element.id.length)
      if (element.querySelector('#click' + id).classList.contains('fa-check-circle-o')) {
        var name = element.querySelector('#name')
        schoolsInMatch['schools'].push(name.textContent)
      }
    }
  }

  var xhr = new XMLHttpRequest()
  xhr.open("POST", window.location.pathname, true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.onreadystatechange = function () {
    if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      window.location.reload()
    }
  };
  xhr.send(JSON.stringify(schoolsInMatch))
}


function delete_teams_post() {
  var xhr = new XMLHttpRequest()
  xhr.open("POST", window.location.pathname, true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.onreadystatechange = function () {
    if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      window.location.reload()
    }
  };
  xhr.send(JSON.stringify({action: 'delete' }))
}
