/**
 * The introduction module
 * Constructor function.
 */
class Cover extends H5P.EventDispatcher {
  constructor(params, titleText, readText, contentId, parent) {
    super();

    this.parent = parent;

    // Container
    this.container = this.createContainer();

    // Visual header
    if (params.coverImage) {
      this.container.appendChild(this.createVisualsElement(params, contentId));
    }
    else {
      this.container.classList.add('h5p-cover-nographics');
    }

    // Title
    this.container.appendChild(this.createTitleElement(titleText));

    // Description text
    if (params.coverDescription) {
      this.container.appendChild(this.createDescriptionElement(params.coverDescription));
    }

    // Read button
    this.container.appendChild(this.createReadButton(readText));
  }

  /**
   * Create the top level element.
   *
   * @return {HTMLElement} Cover.
   */
  createContainer() {
    const container = document.createElement('div');
    container.classList.add('h5p-interactive-book-cover');
    return container;
  }

  /**
   * Create an element which contains both the cover image and a background bar.
   *
   * @param {object} coverImage Image object.
   * @param {number} contentId Content Id.
   */
  createVisualsElement(params, contentId) {
    if (!params || !params.coverImage) {
      return null;
    }

    const visuals = document.createElement('div');
    visuals.classList.add('h5p-interactive-book-cover-graphics');
    visuals.appendChild(this.createImage(params.coverImage.path, contentId, params.coverAltText));
    visuals.appendChild(this.createCoverBar());

    return visuals;
  }

  /**
   * Create Image.
   *
   * @param {string} path Relative image path.
   * @param {number} contentId Content id.
   * @param {string|null} altText
   */
  createImage(path, contentId, altText) {
    const img = document.createElement('img');
    img.classList.add('h5p-interactive-book-cover-image');
    img.src = H5P.getPath(path, contentId);
    img.setAttribute('draggable', 'false');
    if (altText) {
      img.alt = altText;
    }

    return img;
  }

  /**
   * Create an element responsible for the bar behind an image.
   *
   * @return {HTMLElement} Horizontal bar in the background.
   */
  createCoverBar() {
    const coverBar = document.createElement('div');
    coverBar.classList.add('h5p-interactive-book-cover-bar');
    return coverBar;
  }

  /**
   * Create title.
   *
   * @param {string} titleText Text for title element.
   * @return {HTMLElement} Title element.
   */
  createTitleElement(titleText) {
    const title = document.createElement('p');
    title.innerHTML = titleText;

    const titleWrapper = document.createElement('div');
    titleWrapper.classList.add('h5p-interactive-book-cover-title');
    titleWrapper.appendChild(title);

    return titleWrapper;
  }

  /**
   * Create description.
   *
   * @param {string} descriptionText Text for description element.
   * @return {HTMLElement} Description element.
   */
  createDescriptionElement(descriptionText) {
    if (!descriptionText) {
      return null;
    }

    const descriptionElement = document.createElement('div');
    descriptionElement.classList.add('h5p-interactive-book-cover-description');
    descriptionElement.innerHTML = descriptionText;

    return descriptionElement;
  }

  /**
   * Create a button element.
   *
   * @param {string} buttonText Button text.
   * @return {HTMLElement} Read button element.
   */
  createReadButton(buttonText) {
    const button = document.createElement('button');
    button.innerHTML = buttonText;
    button.onclick = () => {
      this.removeCover();
    };

    const buttonWrapper = document.createElement('div');
    buttonWrapper.classList.add('h5p-interactive-book-cover-readbutton');
    buttonWrapper.appendChild(button);

    return buttonWrapper;
  }

  /**
   * Remove cover.
   */
  removeCover() {
    this.container.parentElement.classList.remove('covered');
    this.container.parentElement.removeChild(this.container);
    this.hidden = true;
    this.parent.trigger('coverRemoved');
  }
}

export default Cover;
