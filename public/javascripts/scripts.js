function sidebar_open() {
  document.getElementById('main').style.marginLeft = '230px';
  document.getElementById('header').style.zIndex = 'auto';
  document.getElementById('header_title').style.marginLeft = '200px';
  document.getElementById('side_nav').style.width = '220px';
  document.getElementById('side_nav').style.display = 'block';
}

function sidebar_close() {
  document.getElementById('main').style.marginLeft = '40px';
  document.getElementById('header').style.zIndex = '1';
  document.getElementById('header_title').style.marginLeft = '0px';
  document.getElementById("side_nav").style.display = 'none';
}
