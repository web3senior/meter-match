// when player start new level.
let timer = 0
let interval = 1000
let timerInterval

function new_level(level_number) {
  console.log('Started')
  timerInterval = setInterval(() => {
    timer += 1
    console.log(timer)
  }, interval)
}

// when play completed level
function level_completed(level_number, player_score) {
  clearInterval(timerInterval)
  console.log('Here is the score:', player_score)
  document.querySelector('#score').value = player_score
  window.parent.postMessage({ message: 'playerScore', value: player_score }, '*')

  var myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  var raw = JSON.stringify({
    tournament_id: localStorage.getItem('tournamentId'),
    wallet_addr: localStorage.getItem('wallet_addr'),
    score: player_score,
    level_number: level_number,
    timer: timer
  })

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  }

  fetch('https://candyzap.aratta.dev/v1/newRecord', requestOptions)
    .then((response) => response.json())
    .then((result) => console.log(result))
    .catch((error) => console.log('error', error))
}

// when player, close level before completed it.
function close_level(level_number) {
  // (Optional) or you can leave it empty
  console.log('CLOSE LEVEL')

  clearInterval(timerInterval)
}

/*
  ---details---
  level_number is number between 0 to 19, number 0 mean the first level (level 1)

*/

// window.addEventListener("message", (event) => {
//   // Do we trust the sender of this message?  (might be
//   // different from what we originally opened, for example).
//   if (event.origin !== "http://localhost:3040")
//     return;

//   console.log(event)

//   // event.source is popup
//   // event.data is "hi there yourself!  the secret response is: hiiiiiiii!"
// }, false);
