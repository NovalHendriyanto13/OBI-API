let dateNow = function() {
  var [month, date, year] = new Date().toLocaleDateString("en-US", { timeZone:  "Asia/Jakarta"}).split('/'); 
  
  if (month < 10) {
    month = '0' + month
  }

  if (date < 10) {
    date = '0' + date
  }

  return year + "-"
    + month  + "-" 
    + date
}

let timeNow = function() {
  var currentdate = new Date().toLocaleTimeString("en-US", { timeZone:  "Asia/Jakarta"}); 
  return currentdate
  // return currentdate.getHours() + ":"  
  //   + currentdate.getMinutes() + ":" 
  //   + currentdate.getSeconds();
}

let convertDate = function(date) {
  let month = (date.getMonth()+1)
  let dt = date.getDate()

  if (month < 10) {
    month = '0' + month
  }

  if (dt < 10) {
    dt = '0' + dt
  }

  return date.getFullYear() + "-"
    + month  + "-" 
    + dt    
}

let convertTime = function(date) {
  return date.getHours() + ":"  
    + date.getMinutes() + ":" 
    + date.getSeconds();
}

let randomInt = function(end, start=0) {
  return Math.floor(Math.random() * end) + start
}

module.exports = {
  dateNow,
  timeNow,
  convertDate,
  convertTime,
  randomInt
}