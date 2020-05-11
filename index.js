(function () {
  /**
   * This script works by checking the value of the language code found in the current url (window.location) against the language set on the browser.
   * The language code in the url of the site is expected to be located after the origin and at the begining of the path:
   *   www.example.com/LANG/rest/of/the/path
   */

  /**
   * ADD THE AVAILABLE LANGUAGES ON THE WEBSITE TO THIS ARRAY OF LANGUAGE OBJECTS.
   * For each language object set:
   * @property {string} urlCode Lang code used in the website url (without the slashes). Leave as empty string for the language that corresponds to the url without any code.
   * @property {string} browserCode The two first characters of the official browser lang code. https://www.metamodpro.com/browser-language-codes
   * @property {string} sentence First string on the tooltip. For example: 'This page is available in English'
   * @property {string} button Text content for the main button. For example: 'View in English'
   * @property {string} remember Label for the checkboc to don't show again the tooltip. For example: 'Don't show again'
   */
  const languagesData = [
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
      sentence: 'Cette page est disponible en français',
      button: 'Voir en Français',
      remember: 'Ne montre plus'
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
      sentence: 'Diese Seite ist auf Deutsch verfügbar',
      button: 'Ansicht auf Deutsch',
      remember: 'Nicht mehr zeigen'
    },
    {
      urlCode: 'zh-hans',
      browserCode: 'zh',
      sentence: '此页面有中文版本',
      button: '用中文查看',
      remember: '不再显示'
    },
    {
      urlCode: 'ko',
      browserCode: 'ko',
      sentence: '이 페이지는 한국어로 제공됩니다',
      button: '한국어로보기',
      remember: '다시 표시하지 않습니다'
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
   * Theme specific data to place and style the tooltip.
   * @property {string[]} referenceElements CSS classes or ids to place the tooltip below the element where they are.
   * Should be in order of preference. If they are classes, the first one that is find is the one that will be used.
   * @example ['.wpml-ls-current-language', '.ast-mobile-menu-buttons']
   * @property {string} buttonStyle Optional CSS class to style the main anchor element. An empty string if none.
   * @example 'ast-button'
   */
  const themeData = {
    referenceElements: ['.wpml-ls-current-language', '.ast-mobile-menu-buttons'],
    buttonStyle: 'ast-button'
  }


  /**
   * Tip arrow size in pixels.
   */
  const globalTipArrowSize = 8;


  /**
   * Reference to the tooltip HTML element.
   */
  let langTipContainer;


  /**
   * Gets the language of the url.
   * @returns {number} The index of the website language in the languagesData array.
   */
  function getUrlLangIndex() {
    const websitePath = window.location.pathname;
    const langIndex = languagesData.findIndex(lang => {
      const langRegExp = new RegExp('^\/' + lang.urlCode + '\/');
      return langRegExp.test(websitePath);
    });
    // If no lang code is found in the url return the index of the language object with empty 'urlCode'.
    if (langIndex === -1)
      return languagesData.findIndex(lang => lang.urlCode === '');
    else
      return langIndex;
  }


  /**
   * Gets the language of the browser only if it is a language available for the website (available in the languagesData object).
   * If the browser is in a language not available -1 is returned.
   * @returns {number} The index of the browser language in the languagesData array.
   */
  function getBrowserLangIndex() {
    const browserLang = navigator.language || navigator.userLanguage;
    return languagesData.findIndex(lang => {
      const langRegExp = new RegExp('^' + lang.browserCode);
      return langRegExp.test(browserLang);
    });
  }


  /**
   * Sets the CSS 'top' and 'right' absolute values for the provided HTML element.
   * It doesn't set the CSS Position as 'absolute' neither the 'z-index' so make sure you set those elsewhere.
   */
  function setContainerAbsolutePosition() {
    let topValue = 130;
    let rightValue = 10;
    const htmlRefElements = [];
    themeData.referenceElements.forEach(selector => {
      if (document.querySelector(selector) !== null) htmlRefElements.push(document.querySelector(selector));
    });
    for (let i = 0; i < htmlRefElements.length; i++) {
      if (htmlRefElements[i].getBoundingClientRect().bottom > 0 || htmlRefElements[i].getBoundingClientRect().right > 0) {
        // Container position.
        topValue = htmlRefElements[i].getBoundingClientRect().bottom + globalTipArrowSize;
        rightValue = window.innerWidth - (htmlRefElements[i].getBoundingClientRect().right);
        // Container arrow position.
        langTipContainer.style.setProperty('--right-distance', htmlRefElements[i].getBoundingClientRect().width / 2 + 'px');
        break;
      }
    }
    langTipContainer.style.top = topValue + window.scrollY + 'px';
    langTipContainer.style.right = rightValue + 'px';
  }


  /**
   * Creates the HTML structure of the tooltip with all the data.
   * @param {Object} langCodeObj The language object for the suggested language with the contents to populate the container.
   * @param {string} url The url of the equivalent page in the suggested language. 
   * @param {number} tipArrowSize Size in pixels of the tooltip arrow.
   * @returns {HTMLDivElement} The HTML tooltip element.
   */
  function createLanguageTooltip(langCodeObj, url, tipArrowSize) {
    const container = document.createElement('div');
    container.classList.add('language-tip');
    // Event listener to close the container.
    container.addEventListener('click', e => {
      if (e.target.closest('.close-btn') !== null) removeTooltip();
    });
    container.style.setProperty('--tip-arrow-size', tipArrowSize + 'px');
    container.innerHTML = `
      <svg class="close-btn" viewBox="0 0 15 15" width="15" height="15" stroke="#585858" stroke-width="2">
        <line x1="0" y1="0" x2="15" y2="15" />
        <line x1="0" y1="15" x2="15" y2="0" />
      </svg>
      <span>${langCodeObj.sentence}</span>
      <a href="${url}" ${themeData.buttonStyle ? `class="${themeData.buttonStyle}"` : ''} style="margin:10px 0;">${langCodeObj.button}</a>
      <div class="dont-show-again"><input type="checkbox" style="margin: 0 5px 0 0;"><span>${langCodeObj.remember}</span></div>`;
    return container;
  }


  /**
   * Removes the tooltip HTML element from the DOM and all its related events listeners.
   */
  function removeTooltip() {
    window.removeEventListener('scroll', setContainerAbsolutePosition);
    window.removeEventListener('resize', setContainerAbsolutePosition);
    langTipContainer.remove();
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
      const browserLangCodeObj = languagesData[getBrowserLangIndex()];
      const newUrlLangCode = browserLangCodeObj.urlCode;
      let urlPathname;
      if (languagesData[getUrlLangIndex()].urlCode !== '') {
        const pathRegExp = new RegExp('^\/' + languagesData[getUrlLangIndex()].urlCode + '(\/.+)');
        // Remove the current lang code on the url.
        urlPathnameRes = window.location.pathname.match(pathRegExp);
        urlPathname = urlPathnameRes !== null ? urlPathnameRes[1] : '/';
      } else {
        urlPathname = window.location.pathname;
      }
      const newUrl = window.location.origin + (newUrlLangCode !== '' ? "/" + newUrlLangCode : '') + urlPathname;
      // Assigns a reference to the tooltip HTML element.
      langTipContainer = createLanguageTooltip(browserLangCodeObj, newUrl, globalTipArrowSize);
      // Sets the absolute position based on the position of another HTML element in the DOM.
      setContainerAbsolutePosition(langTipContainer, themeData.referenceElements, 130, 10);      
      window.addEventListener('scroll', setContainerAbsolutePosition);
      window.addEventListener('resize', setContainerAbsolutePosition);
      langTipContainer.classList.add('hidden');
      document.body.appendChild(langTipContainer);
      window.setTimeout(() => {
        langTipContainer.classList.remove('hidden');
      }, 2500);
    } else if (getBrowserLangIndex() === -1) {
      console.warn("Sorry but we don't have our website in your browser's language.");
    }
  }

  window.addEventListener('load', main);
})();