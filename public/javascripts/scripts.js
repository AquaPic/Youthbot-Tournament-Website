function sidebar_open() {
  document.getElementById('main').style.marginLeft = '230px';
  document.getElementById('titlebar').style.marginLeft = '220px';
  document.getElementById('side_nav').style.width = '220px';
  document.getElementById('side_nav').style.display = 'block';
  document.getElementById('open_nav').style.display = 'none';
}

function sidebar_close() {
  document.getElementById('main').style.marginLeft = '40px';
  document.getElementById('titlebar').style.marginLeft = '0';
  document.getElementById("side_nav").style.display = 'none';
  document.getElementById("open_nav").style.display = 'inline-block';
}
