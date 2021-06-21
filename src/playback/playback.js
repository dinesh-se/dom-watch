import './playback.css';

(function () {
  const childBeep = new Audio(chrome.runtime.getURL('assets/audio/child.mp3'));
  const attrBeep = new Audio(chrome.runtime.getURL('assets/audio/attr.mp3'));

  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'play-child-beep') {
      childBeep.play();
    }

    if (request.action === 'play-attr-beep') {
      attrBeep.play();
    }
  });
})();
