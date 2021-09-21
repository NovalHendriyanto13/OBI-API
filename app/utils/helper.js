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
  let [hour, minute, second] = new Date().toLocaleTimeString("en-US", { timeZone:  "Asia/Jakarta"}).split(':')
  const [s, ampm] = second.split(' ')
  
  if (ampm === 'PM' && hour != 12) {
      hour = parseInt(hour) + 12
  }
  if (hour < 10) {
    hour = '0' + hour
  }

  return `${hour}:${minute}:${s}` 
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

let currencyFormat = function(i) {
  const currency = i.toLocaleString('en-US', {
    style: 'currency',
    currency: 'IDR'
  })
  let formatted = currency.replace(/IDR/g,'').replace(/,/g,'.')
  const { length } = formatted

  formatted = formatted.substring(0,(length - 3))
  return formatted
}

module.exports = {
  dateNow,
  timeNow,
  convertDate,
  convertTime,
  randomInt,
  currencyFormat,
}