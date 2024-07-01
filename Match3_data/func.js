// the current script folder path
const PATH = document.currentScript.src.split('?')[0].split('/').slice(0, -1).join('/') + '/';

// game audio library
var audioContext, loadSound, playSound, playMusic, stopSound, setSoundVolume;
if(window.location.protocol=='file:'){
  loadSound = (src, len) => {
    len=len||1;
    const s = {a:[], i:0, len:len};
    for(var i = 0; i < len; i++) s.a.push(new Audio(src))
    return s;
  }
  playSound = (s) => {s.a[0].loop=false; s.a[s.i].pause(); s.a[s.i].play(); s.i=(s.i+1)%s.len;};
  playMusic = (s) => {s.a[0].loop=true; s.a[0].play();};
  stopSound = (s) => {for (var a of s.a) {a.pause(); a.currentTime = 0;}};
  setSoundVolume = (s, volume) => {for (var a of s.a) {a.volume = volume;}};
}
else {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  loadSound = (filename) => {
    var sound = {volume: 1, audioBuffer: null};
    var ajax = new XMLHttpRequest();
    ajax.open("GET", filename, true);
    ajax.responseType = "arraybuffer";
    ajax.onload = function(){
      audioContext.decodeAudioData(ajax.response, function(buffer) {sound.audioBuffer = buffer},function(error) {debugger});
    }
    ajax.onerror = function() {debugger};
    ajax.send();
    Sound_arr.push(sound);
    return sound;
  };
  playSound = (sound) => {
    if(!sound.audioBuffer) return false;

    var source = audioContext.createBufferSource();
    if(!source) return false;

    source.buffer = sound.audioBuffer;
    if(!source.start) source.start = source.noteOn;

    if(!source.start) return false;
    var gainNode = audioContext.createGain();
    gainNode.gain.value = sound.volume;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.loop=false;
    source.start(0);

    sound.gainNode = gainNode;
    return true;
  };
  playMusic = (sound) => {
    if(!sound.audioBuffer) return false;

    var source = audioContext.createBufferSource();
    if(!source) return false;

    source.buffer = sound.audioBuffer;
    if(!source.start) source.start = source.noteOn;
    if(!source.start) return false;
    var gainNode = audioContext.createGain();
    gainNode.gain.value = sound.volume;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.loop=true;
    source.start(0);

    sound.gainNode = gainNode;
    return true;
  };
  stopSound = (sound) => {
    if(sound.gainNode) sound.gainNode.gain.value = 0;
  };
  setSoundVolume = (sound, volume) => {
    sound.volume = volume;
    if(sound.gainNode) sound.gainNode.gain.value = volume;
  };
  // active the sound after first click, this step necessary for play audio in safari
  canvas.addEventListener("mousedown", firstClick);
  canvas.addEventListener("touchstart", firstClick);
  function firstClick() {
    for (var i = 0; i < Sound_arr.length; i++) {
      var s = Sound_arr[i];
      playSound(s);
      stopSound(s);
      s.src = s.src_name;
    }
    can.removeEventListener("mousedown", firstClick);
    can.removeEventListener("touchstart", firstClick);
  }
}

// craete new image function
function newImage(src) {
  var m = new Image(); // craete image object
  m.src=PATH+src; // load image from the source
  Img_arr.push(m); // put the Img in Img_arr, Img_arr will be used later to check if all images inside it are full loaded from the giving source.
  return m; // return the image
}

// Mouse //
const Mouse = {
  X: 0, Y: 0, Left: -1, Right: -1
  , MouseMove(e) {
    // Get x and y of Mouse on the canvas
    Mouse.GetXandY(e.clientX,e.clientY);
  }
  , TouchMove(e){
    // Get x and y of Touch on the canvas
    if (e.type == "touchstart" || e.type == "touchend"){
      Mouse.GetXandY(e.changedTouches[0].pageX,e.changedTouches[0].pageY);
    }
    else if (e.type == "touchmove"){
      Mouse.GetXandY(e.targetTouches[0].pageX,e.targetTouches[0].pageY);
    }
  }
  , GetXandY(mx,my){
    // Get x and y of mouse/touch on the canvas
    var s = can.getBoundingClientRect(),X,Y;//,cw=W,ch=H;
    if (!sys.IsFullscreen()) { // if canvas not in full screen
      X = Math.floor((mx - s.left) * cw / s.width);
      Y = Math.floor((my - s.top) * ch / s.height);
    }
    else { // if canvas in full screen
      var w = s.width / cw, h = s.height / ch;
      if (h > w) {
        X = Math.floor(cw / s.width * mx);
        Y = Math.floor((my - (s.height - (ch * w)) / 2) / w);
      } else {
        X = Math.floor((mx - (s.width - (cw * h)) / 2) / h);
        Y = Math.floor(ch / s.height * my);
      }
    }

    // Update Mouse X and Y
    if (X != null && Y != null) { this.X = X; this.Y = Y; } // in case values is null from touch, we not going update Mouse X and Y
    this.X-=cx;
    this.Y-=cy;
  }
  , Down(key) { return this[key] == 1;} // Check if mouse-click down
  , Up(key) { return this[key] == 0;} // Check if mouse-click up
  , Press(key) { return this[key] > 0;} // Check if mouse-click press
  , Update() {
    // Update mouse left and right click (1- mean not clicked, 0 mean key is 'up', 1 mean key is 'down' also 'press', 2 mean key is 'press')
    if (this.Left > 0) this.Left = 2; else this.Left = -1;
    if (this.Right > 0) this.Right = 2; else this.Right = -1;
  }
  , MouseClick(e) {
    // Update Mouse-key when it is clicked
    // Get the clicked key
    var s;
    switch (e.which) {
      case 1: s = "Left"; break;
      case 3: s = "Right"; break;
      default: return;
    }
    this[s] = e.type == 'mousedown' ? 1 : 0; // If mouse Event is 'mousedown' set the key to 1, else it should be 0 for 'mouseup'
  }
  /* Touches */, TouchClick() { if (event.type == "touchstart") this.Left = 1; }
  // Check if mouse coordinates x and y is on the given Square x,y,w,h
  , Square(x, y, w, h) { return this.X >= x && this.X < x + w && this.Y >= y && this.Y < y + h }
};


function irandom(a) { return Math.round(Math.random() * a) }
function point_direction(a, b, c, d) { return 180 * Math.atan2(d - b, c - a) / Math.PI }
function point_distance(a, b, c, d) { var e = a - c, f = b - d; return Math.sqrt(e * e + f * f) }
function DrawBtn(x,y,w,h,m){
  var r = Mouse.Square(x-w/2,y,w,h);
  ctx.globalAlpha = r?1:0.9;
  ctx.drawImage(m,x-w/2,y,w,h);
  ctx.globalAlpha = 1;
  return r;
}


const sys = {
  // Open Fullscreen
  openFullscreen() { var a = can; a.requestFullscreen ? a.requestFullscreen() : a.mozRequestFullScreen ? a.mozRequestFullScreen() : a.webkitRequestFullscreen ? a.webkitRequestFullscreen() : a.msRequestFullscreen && a.msRequestFullscreen(); }
  // Close Fullscreen
  , closeFullscreen() { var a = document; a.exitFullscreen ? a.exitFullscreen() : a.mozCancelFullScreen ? a.mozCancelFullScreen() : a.webkitExitFullscreen ? a.webkitExitFullscreen() : a.msExitFullscreen && a.msExitFullscreen(); }
  // Switch Fullscreen, if is in Fullscreen then close Fullscreen, else open Fullscreen
  , swithFullscreen() { sys.IsFullscreen() ? sys.closeFullscreen() : sys.openFullscreen() }
  // check if game in Fullscreen or not
  , IsFullscreen() {
    if(sys.IsMobile) return document.webkitCurrentFullScreenElement != null;
    return window.fullScreen || (window.innerHeight == screen.height);
  }
  // if the game is in mobile device
  ,IsMobile:typeof window.orientation !== 'undefined' ? true : false
}
