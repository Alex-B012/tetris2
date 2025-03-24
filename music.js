const audioStart = document.getElementById("audioStart");
const audioNut = document.getElementById("audioNut");
const applause = document.getElementById("applause");
const audioOhhs = document.getElementById("ohh");
const backHome = document.getElementById("backHome");
const corporateCorporation = document.getElementById("corporateCorporation");
const energeticRock = document.getElementById("energeticRock");
let currentTrack = corporateCorporation;
let moveDownSoundNoVolume = false;

export function startRoundSound() {
  audioStart.currentTime = 0;
  audioStart.play();
  setTimeout(() => {
    audioStart.pause();
  }, 2000);
}

export function nextLevelSound() {
  pauseTrack();
  moveDownSoundNoVolume = true;
  applause.currentTime = 0;
  applause.play();
  setTimeout(() => {
    applause.pause();
    moveDownSoundNoVolume = false;
    continueTrack();
  }, 3000);
}

export function moveDownSound() {
  if (moveDownSoundNoVolume) return;
  audioNut.volume = 0.3;
  audioNut.play();
}

export function ohhSound() {
  audioOhhs.play();
}

export function startTrack() {
  currentTrack.currentTime = 0;
  currentTrack.volume = 0.2;
  currentTrack.play();
}

export function stopTrack() {
  currentTrack.currentTime = 0;
  currentTrack.pause();
}

export function pauseTrack() {
  currentTrack.pause();
}

export function continueTrack() {
  currentTrack.play();
}

export function changeTrack(num) {
  if (num === 1) {
    currentTrack = corporateCorporation;
  } else if (num === 2) {
    currentTrack = backHome;
  } else if (num === 3) {
    currentTrack = energeticRock;
  }
  currentTrack.volume = 0.2;
}
