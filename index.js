(function () {
  /**
   * This script works by checking the value of the language code found in the current url (window.location) against the language set on the browser.
   * The language code in the url of the site is expected to be located after the origin and at the begining of the path:
   *   www.example.com/LANG/rest/of/the/path
   */

  /**
   * ADD THE AVAILABLE LANGUAGES ON THE WEBSITE TO THIS ARRAY OF LANGUAGE OBJECTS.
   * For each language object set:
   * * 'urlCode': lang code used in the website url. Leave as an empty string for language that corresponds to the url without any code (default language).
   * * 'browserCode': the two first characters of the official browser lang code. https://www.metamodpro.com/browser-language-codes
   * * 'sentence': string to be displayed to the user suggesting to change to that language.
   */
  const langCodes = [
    {
      urlCode: 'es',
      browserCode: 'es',
      sentence: 'Esta página está disponible en Español',
      button: 'Ver en Español',
      remember: 'No volver a mostrar'
    },
    {
      urlCode: 'fr',
      browserCode: 'fr',
      sentence: '',
      button: 'Voir en Français',
      remember: ''
    },
    {
      urlCode: 'it',
      browserCode: 'it',
      sentence: 'Questa web è disponibile in Italiano',
      button: 'Vedere in Italiano',
      remember: 'Non mostrare di nuovo'
    },
    {
      urlCode: 'de',
      browserCode: 'de',
      sentence: '',
      button: 'Ansicht auf Deutsch',
      remember: ''
    },
    {
      urlCode: 'zh-hans',
      browserCode: 'zh',
      sentence: '',
      button: '用中文查看',
      remember: ''
    },
    {
      urlCode: 'ko',
      browserCode: 'ko',
      sentence: '',
      button: '한국어로보기',
      remember: ''
    },
    {
      urlCode: '',
      browserCode: 'en',
      sentence: 'This page is available in English',
      button: 'View in English',
      remember: 'Don\'t show again'
    }
  ];


  /**
   * Returns the index of the website language in the langCodes array.
   */
  function getUrlLangIndex() {
    const websitePath = window.location.pathname;
    const langIndex = langCodes.findIndex(lang => {
      const langRegExp = new RegExp('^\/' + lang.urlCode + '\/');
      return langRegExp.test(websitePath);
    });
    // If no lang code is found in the url return the index of the language object with empty 'urlCode'.
    if (langIndex === -1)
      return langCodes.findIndex(lang => lang.urlCode === '');
    else
      return langIndex;
  }


  /**
   * Returns the index of the browser language in the langCodes array.
   * If the browser is in a language not available in the website -1 is returned.
   */
  function getBrowserLangIndex() {
    const browserLang = navigator.language || navigator.userLanguage;
    return langCodes.findIndex(lang => {
      const langRegExp = new RegExp('^' + lang.browserCode);
      return langRegExp.test(browserLang);
    });
  }


  // Tip arrow size in pixels.
  const globalTipArrowSize = 8;


  /**
   * Sets the CSS 'top' and 'right' absolute values for the provided HTML element.
   * It doesn't set the CSS Position as 'absolute' neither the 'z-index' so make sure you set those elsewhere.
   * @param {HTMLElement} htmlElement The HTML element to position.
   * @param {HTMLElement[]} htmlRefElements Array of HTMLElement in order of preference to calculate the Top value base of.
   * @param {number} defaultTop Optional default top value in case reference HTML elements doens't work.
   * @param {number} defaultRight Optional default right value in case reference HTML elements doesn't work.
   */
  function setContainerAbsolutePosition(htmlElement, htmlRefElements, defaultTop = 0, defaultRight = 0) {
    let topValue = defaultTop;
    let rightValue = defaultRight;
    for (let i = 0; i < htmlRefElements.length; i++) {
      if (htmlRefElements[i] !== null && (htmlRefElements[i].getBoundingClientRect().bottom > 0 || htmlRefElements[i].getBoundingClientRect().right > 0)) {
        // Container position.
        topValue = htmlRefElements[i].getBoundingClientRect().bottom + globalTipArrowSize;
        rightValue = window.innerWidth - (htmlRefElements[i].getBoundingClientRect().right);
        // Container arrow position.
        htmlElement.style.setProperty('--right-distance', htmlRefElements[i].getBoundingClientRect().width / 2 + 'px');
        break;
      }
    }
    htmlElement.style.top = topValue + 'px';
    htmlElement.style.right = rightValue + 'px';
  }


  /**
   * Creates an HTML element to show the message with the link to the suggested page.
   * @param {Object} langCodeObj The language object for the suggested language with the contents to populate the container.
   * @param {string} url The url of the equivalent page in the suggested language. 
   * @param {number} tipArrowSize Size in pixels of the tooltip arrow.
   */
  function createLanguageTooltip(langCodeObj, url, tipArrowSize) {
    const container = document.createElement('div');
    container.classList.add('language-tip');
    // Event listener to close the container.
    container.addEventListener('click', e => {
      if (e.target.closest('.close-btn') !== null) container.remove();
    });
    container.style.setProperty('--tip-arrow-size', tipArrowSize + 'px');
    container.innerHTML = `
      <svg class="close-btn" viewBox="0 0 15 15" width="15" height="15" stroke="#000" stroke-width="2">
        <line x1="0" y1="0" x2="15" y2="15" />
        <line x1="0" y1="15" x2="15" y2="0" />
      </svg>
      <span>${langCodeObj.sentence}</span>
      <a href="${url}" class="ast-button" style="margin:10px 0;">${langCodeObj.button}</a>
      <div class="dont-show-again"><input type="checkbox" style="margin: 0 5px 0 0;"><span>${langCodeObj.remember}</span></div>`;
    return container;
  }


  /**
   * Main function.
   * Checks if a tooltip for redirection to the page in another language is necessary
   * and if so it shows it.
   */
  function main() {
    // If the getBrowserLangIndex() returns -1 means that we have no website language that matches, so nothing is done.
    // If the browser lang is available on the website and it is different than the one on the url then suggest to change it.
    if (getBrowserLangIndex() !== -1 && getBrowserLangIndex() !== getUrlLangIndex()) {
      // Language object with the browser language.
      const browserLangCodeObj = langCodes[getBrowserLangIndex()];
      const newUrlLangCode = browserLangCodeObj.urlCode;
      let urlPathname;
      if (langCodes[getUrlLangIndex()].urlCode !== '') {
        const pathRegExp = new RegExp('^\/' + langCodes[getUrlLangIndex()].urlCode + '(\/.+)');
        // Remove the current lang code on the url.
        urlPathnameRes = window.location.pathname.match(pathRegExp);
        urlPathname = urlPathnameRes !== null ? urlPathnameRes[1] : '/';
      } else {
        urlPathname = window.location.pathname;
      }
      const newUrl = window.location.origin + (newUrlLangCode !== '' ? "/" + newUrlLangCode : '') + urlPathname;
      // Create the HTML element to show the message and append it.
      const langTipContainer = createLanguageTooltip(browserLangCodeObj, newUrl, globalTipArrowSize);
      // Set the absolute position based on the position of another HTML element in the DOM.
      setContainerAbsolutePosition(langTipContainer, [document.querySelector('.wpml-ls-current-language'), document.querySelector('.ast-mobile-menu-buttons')], 130, 10);
      document.body.appendChild(langTipContainer);
    } else if (getBrowserLangIndex() === -1) {
      console.warn("Sorry but we don't have our website in your browser's language.");
    }
  }

  window.addEventListener('load', main);
})();