// let apiUrl = 'http://172.17.1.100:8089/api/';
let apiUrl = 'http://app.esdgd.com/api/';
let imgUrl = 'http://app.esdgd.com/upload'
// let id = getQueryVariable('id');
function getQueryVariable(variable){
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
  }
  return(false);
};
function getUrlValue(url,key){
  var query = url.split('?');
  var vars = query[1].split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == key){return pair[1];}
  }
  return(false);
};
let guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
  };
}());