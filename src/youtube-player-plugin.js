"use strict"

const YOUTUBE_API_SOURCE = "https://www.youtube.com/iframe_api";

const TIMEOUT = 5000;

export default class YoutubePlayerPlugin {
  constructor(events) {

    this.ready = false;
    this._instance = null;
    this.active = false;
    this.timeout = false;
    this.events = {...events};

    this.queue = [];

  }

  init() {
    console.log('Youtube Player init')
    /* load plugin script, then create new player when api is loaded */
    this._loadPluginScript();
    window.onYouTubeIframeAPIReady = () => {
      this._onApiReady();
    }
  }

  _onApiReady() {
    console.log('Loaded Youtube API');
    this._clearTimeout();
    this._instance = this._createPlayer();
  }

  load(src) {
    this.active = true;
    this._setTimeout(TIMEOUT);
    if (!this.ready) {
      this.queue.push(src);
      return this;
    }
    const mediaContentUrl = `http://www.youtube.com/v/${src}?version=3`;
    this._instance && this._instance.cueVideoByUrl(mediaContentUrl);
    return this;
  }

  stop() {
    this.active = false;
    this.ready &&  this._instance && this._instance.stopVideo();
    return this;
  }

  finish() {
    this.stop();
    return this;
  }

  onReady() {
    this.ready = true;
    this._clearTimeout();
    if (this.active && this.queue.length > 0) { // only load when active
      const src = this.queue.pop();
      this.load(src);
    }
  }

  _loadPluginScript() {
    if (this._checkIfScriptExist()) {
      return this;
    }
    const tag = document.createElement('script');
    tag.src = YOUTUBE_API_SOURCE;
    const body = document.getElementsByTagName('BODY')[0];
    body.appendChild(tag, body);
    return this;
  }

  _checkIfScriptExist() {
    const el = document.getElementsByTagName('script');
    for (let i = 0; i < el.length; i++) {
      const e = el[i];
      if (e.src === YOUTUBE_API_SOURCE) {
        return true;
      }
    }
    return false;
  }

  _createPlayer() {
    const playerParams = {
      'theme':'dark',
      'autohide':0,
      'modestbranding':1,
      'showinfo':1,
      'controls':1,
      'rel':0
    };
    return new YT.Player('youtube-player', {
      playerVars : playerParams,
      events      : {
        'onReady' : () => this.onReady(),
        'onStateChange' : evt => {
          switch (evt.data) {
            case 0 : this._fire('onFinished'); break;
            case 5 : this.onLoaded(); break;
          } 
        } 
      }
    })
  }

  onLoaded() {
    this._clearTimeout()._fire('onLoaded');
  }

  _fire(event, ...args) {
    /* only fire event when active */    
    this.active && this.events[event] && this.events[event](...args);
    return this;
  }

  _setTimeout(duration) {
    this.timeout = true;
    setTimeout(() => {
      if (this.timeout) {
        this._fire('onTimeout');
      }
    }, duration);
  }

  _clearTimeout() {
    this.timeout = false;
    return this;
  }

}

YoutubePlayerPlugin.playerName = 'YOUTUBE'
YoutubePlayerPlugin.version = '1.0.0'
