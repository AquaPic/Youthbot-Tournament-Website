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

function show_add_team() {
  document.getElementById('addTeam').style.display = 'block';
  document.getElementById('addSchool').style.display = 'none';
}

function team_selection_click(number) {
  var elementId = 'team' + number
  var element = document.getElementById(elementId)
  if (element.className.match(/(?:^|\s)ybot-theme-secc(?!\S)/)) {
    element.classList.remove ('ybot-theme-secc')
  } else {
    element.classList.add ('ybot-theme-secc')
  }
}

function send_team_post() {
  var listElements = document.body.getElementsByTagName("li")
  var schoolsInMatch = {}
  schoolsInMatch['schools'] = []
  for (let element of listElements) {
    if ((element.id.includes ('team')) && (element.className.match(/(?:^|\s)ybot-theme-secc(?!\S)/))) {
      schoolsInMatch['schools'].push(element.textContent)
    }
  }

  var xhr = new XMLHttpRequest()
  xhr.open("POST", '/competition1', true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send(JSON.stringify(schoolsInMatch))
}
