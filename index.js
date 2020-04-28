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
      sentence: 'Ver en Español'
    },
    {
      urlCode: 'fr',
      browserCode: 'fr',
      sentence: 'Voir en Français'
    },
    {
      urlCode: 'it',
      browserCode: 'it',
      sentence: 'Vedere in Italiano'
    },
    {
      urlCode: 'de',
      browserCode: 'de',
      sentence: 'Ansicht auf Deutsch'
    },
    {
      urlCode: 'zh-hans',
      browserCode: 'zh',
      sentence: '用中文查看'
    },
    {
      urlCode: 'ko',
      browserCode: 'ko',
      sentence: '한국어로보기'
    },
    {
      urlCode: '',
      browserCode: 'en',
      sentence: 'View in English'
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


  /**
   * Main function.
   * Checks if a tip for redirection to the site in another language is necessary
   * and if so it shows it.
   */
  function manageLanguageTip() {
    // If the getBrowserLangIndex() returns -1 means that we have no website language that matches, so nothing is done.
    // If the browser lang is available on the website and it is different than the one on the url then suggest to change it.
    if (getBrowserLangIndex() !== -1 && getBrowserLangIndex() !== getUrlLangIndex()) {
      const newUrlLangCode = langCodes[getBrowserLangIndex()].urlCode;
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
      const langTipContainer = document.createElement('div');
      langTipContainer.classList.add('language-tip');
      langTipContainer.innerHTML = `<svg class="close-btn" viewBox="0 0 15 15" width="15" height="15" stroke="#000" stroke-width="2"><line x1="0" y1="0" x2="15" y2="15"></line><line x1="0" y1="15" x2="15" y2="0"></line></svg><a href="${newUrl}" class="confirm-btn ast-button">${langCodes[getBrowserLangIndex()].sentence}</a><span class="dont-show-again-btn">Don\'t show again</span>`;
      document.body.appendChild(langTipContainer);
    } else if (getBrowserLangIndex() === -1) {
      console.warn("Sorry but we don't have our website in your browser's language.");
    }
  }

  window.addEventListener('load', manageLanguageTip);
})();