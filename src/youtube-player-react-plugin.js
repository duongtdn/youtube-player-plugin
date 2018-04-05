"use strict"

import React, { Component } from 'react'

import YoutubePlayerPlugin from './youtube-player-plugin'
import { bindRender } from 'content-presenter'

class YoutubeReactComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id = "youtube-player">
      </div>
    )
  }

  finish() {
    this.props.player.finish();
  }

}

export default bindRender(YoutubePlayerPlugin, YoutubeReactComponent)