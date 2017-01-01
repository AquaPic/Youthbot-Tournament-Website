function sidebar_open() {
  document.getElementById('main').style.marginLeft = '230px';
  document.getElementById('titlebar').style.marginLeft = '220px';
  document.getElementById('sidebar').style.width = '220px';
  document.getElementById('sidebar').style.display = 'block';
  document.getElementById('opennavbtn').style.display = 'none';
}

function sidebar_close() {
  document.getElementById('main').style.marginLeft = '40px';
  document.getElementById('titlebar').style.marginLeft = '0';
  document.getElementById("sidebar").style.display = 'none';
  document.getElementById("opennavbtn").style.display = 'inline-block';
}
