import React from 'react';
import './InteractionContent.scss';
import {H5PContext} from '../../context/H5PContext';
import AudioButton from '../HUD/Buttons/AudioButton';

export default class InteractionContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isInitialized: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.audioIsPlaying && this.props.audioIsPlaying !== prevProps.audioIsPlaying) {
      // The Audio Player has changed

      if (AudioButton.isVideoAudio(prevProps.audioIsPlaying)) {
        // Thas last player was us, we need to stop it
        this.instance.pause();
      }
    }
  }

  initializeContent(contentRef) {
    if (!contentRef || this.state.isInitialized) {
      return;
    }

    // Remove any old content
    while (contentRef.firstChild) {
      contentRef.removeChild(contentRef.firstChild);
    }

    const scene = this.context.params.scenes.find(scene => {
      return scene.sceneId === this.props.currentScene;
    });
    const interaction = scene.interactions[this.props.currentInteraction];
    const library = interaction.action;

    this.instance = H5P.newRunnable(
      library,
      this.context.contentId,
      H5P.jQuery(contentRef)
    );

    if (library.library.split(' ')[0] === 'H5P.Video') {
      this.instance.on('stateChange', e => {
        if (e.data === H5P.Video.PLAYING) {
          this.props.onAudioIsPlaying('video-' + scene.sceneId + '-' + this.props.currentInteraction);
        }
      });
    }

    this.setState({
      isInitialized: true,
    });

    if (this.instance.libraryInfo.machineName === 'H5P.Image') {
      const img = contentRef.children[0];
      const rect = this.context.getRect();
      const contentRatio = (rect.width / rect.height);
      const imageRatio = (this.instance.width / this.instance.height);
      const isWide = (imageRatio > contentRatio);
      img.style.width = isWide ? '100%' : 'auto';
      img.style.height = isWide ? 'auto' : '100%';

      this.instance.on('loaded', () => this.props.onResize(!isWide));
    }

    this.instance.on('resize', () => this.props.onResize());
  }

  render() {
    return (
      <div ref={ el => this.initializeContent(el) } />
    );
  }
}

InteractionContent.contextType = H5PContext;
