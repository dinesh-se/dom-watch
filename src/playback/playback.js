import { logErrorMessage } from '../logger';
import './playback.css';

(function () {
  const childBeep = new Audio(chrome.runtime.getURL('assets/audio/child.mp3'));
  const attrBeep = new Audio(chrome.runtime.getURL('assets/audio/attr.mp3'));

  try {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'play-child-beep') {
        childBeep.play();
      }

      if (request.action === 'play-attr-beep') {
        attrBeep.play();
      }
      sendResponse(true);
    });
  } catch (e) {
    logErrorMessage(6, e);
  }
})();
