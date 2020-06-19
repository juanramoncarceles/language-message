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
      urlCode: 'zh-hans',
      browserCode: 'zh',
      sentence: '此页面有中文版本',
      button: '用中文查看',
      remember: '不再显示'
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


  // TODO Add option to position it centered or anchored to another element.
  // const mode = 'centered or anchored';

  const config = {
    backgroundColor: '#f3f3f3',
    borderRadius: '5px',
    zIndex: 98
  }

  /**
   * Tooltip arrow size in pixels.
   */
  const globalTipArrowSize = 8;
  /**
   * Default top position in pixels in case no reference HTML element is found.
   */
  const tooltipDefaultTop = 10;
  /**
   * Default right position in pixels in case no reference HTML element is found.
   */
  const tooltipDefaultRight = 10;
  /**
   * Amount of days until the tooltip will appear again in case the user already made a decision.
   */
  const cookieExpirationDays = 30;


  /************************************************** SCRIPT **************************************************/

  /**
   * Reference to the tooltip HTML element.
   */
  let langTipContainer;
  /**
   * Index of the current string in the referenceElements array.
   */
  let referenceElementIndex;
  /**
   * Reference to the HTML element used to position the tooltip.
   */
  let referenceElement;


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
   * @param {HTMLElement | null}
   */
  function setContainerAbsolutePosition(el) { // puede ser que llegue como undefined
    if (el !== null) {
      const refElementBoundingRect = el.getBoundingClientRect();      
      // Container arrow position.
      langTipContainer.style.setProperty('--right-distance', refElementBoundingRect.width / 2 + 'px');
      // Container position.
      langTipContainer.style.top = refElementBoundingRect.bottom + globalTipArrowSize + window.scrollY + 'px';
      langTipContainer.style.right = window.innerWidth - (refElementBoundingRect.right) + 'px';
    } else {
      langTipContainer.style.top = tooltipDefaultTop + 'px';
      langTipContainer.style.right = tooltipDefaultRight + 'px';
    }
  }
  

  /**
   * The ResizeObserver for the current target HTML element.
   */
  let observer;
  if (window.ResizeObserver) {
    observer = new ResizeObserver(updatePosition);
  } else {
    console.warn("Your browser does not support ResizeObserver.");
  }
  

  // updates the current reference element which is necessary for the resize oberver, is the first one in the list that "is visilbe"
  function updatePosition() {
    let refEl;
    let refElIndex;
    for (let i = 0; i < themeData.referenceElements.length; i++) {
      refEl = document.querySelector(themeData.referenceElements[i]);
      if (refEl && elementTakesUpSpace(refEl)) {
        refElIndex = i;
        break;
      }
    }
    // If is the same as before nothing, otherwise update the observer
    if (referenceElementIndex !== refElIndex) {
      if (referenceElementIndex !== undefined) {
        // Remove the current observed element.
        if (observer) observer.unobserve(referenceElement); // If I stop observing then if it reappears it will no be called.
      }
      if (refEl) {
        // Save the index of the new element.
        referenceElementIndex = refElIndex;
        // Set new element to observe.
        if (observer) observer.observe(refEl);
        // Save a reference to the new element.
        referenceElement = refEl;
        // Also set the arrow again in case it was hidden from before.
        langTipContainer.style.setProperty('--tip-arrow-size', globalTipArrowSize + 'px');
      } else {
        // Set as undefined since no reference HTML element from the array was found.
        referenceElementIndex = undefined;
        // If there is no element the arrow will be hidden.
        langTipContainer.style.setProperty('--tip-arrow-size', 0);
      }
    }
    setContainerAbsolutePosition(refEl);
  }

  
  /**
   * This doesnt check the value of the CSS visibility, so it could not be visible but take up space.
   * true also for elements positioned out of the flow and out of the flow and widnwo.
   * @param {HTMLElement} el 
   */
  function elementTakesUpSpace(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }


  /**
   * Creates the HTML structure of the tooltip with all the data.
   * @param {Object} langCodeObj The language object for the suggested language with the contents to populate the container.
   * @param {string} url The url of the equivalent page in the suggested language.
   * @returns {HTMLDivElement} The HTML tooltip element.
   */
  function createLanguageTooltip(langCodeObj, url) {
    const container = document.createElement('div');
    container.classList.add('language-tip');
    // Close button.
    const closeBtn = document.createElement('div');
    closeBtn.style.cssText = 'position:absolute;top:10px;right:10px;cursor:pointer;';
    closeBtn.innerHTML = '<svg viewBox="0 0 15 15" width="15" height="15" stroke="#585858" stroke-width="2"><line x1="0" y1="0" x2="15" y2="15" /><line x1="0" y1="15" x2="15" y2="0" /></svg>';
    closeBtn.onclick = () => {
      if (container.querySelector('input').checked) {
        setCookie("dontAskLang", "true", cookieExpirationDays);
      }
      removeTooltip();
    };
    container.appendChild(closeBtn);
    // Sentence.
    const sentence = document.createElement('span');
    sentence.textContent = langCodeObj.sentence;
    container.appendChild(sentence);
    // Change language button.
    const changeLangBtn = document.createElement('a');
    changeLangBtn.href = url;
    changeLangBtn.textContent = langCodeObj.button;
    changeLangBtn.style.margin = '10px 0';
    if (themeData.buttonStyle) changeLangBtn.classList.add(themeData.buttonStyle);
    changeLangBtn.onclick = () => {
      if (container.querySelector('input').checked) {
        setCookie("dontAskLang", "true", cookieExpirationDays);
        setCookie("preferredLang", langCodeObj.browserCode, cookieExpirationDays);
      }
      removeTooltip();
    };
    container.appendChild(changeLangBtn);
    // Input to dont show again tooltip.
    const dontShowAgain = document.createElement('div');
    dontShowAgain.style.cssText = 'display:flex;align-items:center;';
    dontShowAgain.innerHTML = `<input type="checkbox" style="margin: 0 5px 0 0;"><span>${langCodeObj.remember}</span>`;
    container.appendChild(dontShowAgain);
    // Container css.
    container.style.cssText = `
      will-change:top,right;
      position:absolute;
      z-index:${config.zIndex};
      display:flex;
      flex-direction:column;
      align-items:center;
      opacity:0;
      visibility:hidden;
      padding:32px 14px 14px;
      transition:opacity 1s;
      border-radius:${config.borderRadius};
      background-color:${config.backgroundColor};
      filter:drop-shadow(0px 0px 5px #a1a1a1);`;
    return container;
  }


  /**
   * Removes the tooltip HTML element from the DOM and all its related events listeners.
   */
  function removeTooltip() {
    window.removeEventListener('scroll', updatePosition);
    window.removeEventListener('resize', updatePosition);
    if (observer) observer.disconnect();
    observer = null;
    langTipContainer.remove();
  }
  

  /**
   * Sets a cookie for the current page (current path).
   * @param {string} cname The name of the cookie.
   * @param {string} cvalue The value of the cookie.
   * @param {number} exdays (Optional) The amount of days until it expires. If not set it will last only until the browser is closed.
   */
  function setCookie(cname, cvalue, exdays) {
    let expires;
    if (exdays) {
      const d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      expires = `expires=${d.toUTCString()};`;
    }
    document.cookie = `${cname}=${cvalue};${expires ? expires : ''}samesite=lax;path=/`;
  }


  /**
   * Gets the value of a cookie by its name. If the cookie does not exist it returns an empty string.
   * @param {string} cname The name of the cookie to get the value of.
   */
  function getCookie(cname) {
    keyValue = document.cookie.split('; ').find(row => row.startsWith(cname));
    return keyValue ? keyValue.split('=')[1] : '';
  }


  /**
   * Deletes a cookie from the current page (current path).
   * @param {string} cname The name of the cookie to delete.
   */
  function deleteCookie(cname) {
    document.cookie = `${cname}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }


  /**
   * Creates the new url for the current page with the specified language.
   * This function will access the window.location object.
   * @param {number} currentUrlLangObjIndex The index of the language object in the url in the languagesData array.
   * @param {number} newLangCodeObjIndex The index of the new language object in the languagesData array.
   * @returns {string} The new url.
   */
  function createNewUrl(currentUrlLangObjIndex, newLangCodeObjIndex) {
    const currentUrlLangCode = languagesData[currentUrlLangObjIndex].urlCode;
    const newUrlLangCode = languagesData[newLangCodeObjIndex].urlCode;
    let urlPathname;
    if (currentUrlLangCode !== '') {
      const pathRegExp = new RegExp('^\/' + currentUrlLangCode + '(\/.+)');
      // Remove the current lang code on the url.
      const urlPathnameRes = window.location.pathname.match(pathRegExp);
      urlPathname = urlPathnameRes !== null ? urlPathnameRes[1] : '/';
    } else {
      urlPathname = window.location.pathname;
    }
    return window.location.origin + (newUrlLangCode !== '' ? "/" + newUrlLangCode : '') + urlPathname;
  }


  // Styles for the tooltip arrow.
  // Cannot be inlined since it targets a pseudo element.
  const tipCSSStyleRule = `
    .language-tip::after {
      content: " ";
      position: absolute;
      bottom: 100%;
      right: var(--right-distance, 50%);
      margin-right: calc(var(--tip-arrow-size, 0) * -1);
      border-width: var(--tip-arrow-size, 0);
      border-style: solid;
      border-color: transparent transparent ${config.backgroundColor} transparent;
    }
  `;


  /**
   * Main function.
   * Checks if a tooltip for redirection to the page in another language is necessary
   * and if so it shows it.
   */
  function main() {
    const preferredLang = getCookie('preferredLang');
    const dontAsk = getCookie('dontAskLang') === 'true' ? true : false;
    const urlLangIndex = getUrlLangIndex();
    const browserLangIndex = getBrowserLangIndex();
    // If there is a preferred languaged saved it will try to redirect to the page in that language.
    // If there is no preferred language and the user didn't say to don't ask again it will check if
    // it is necessary to show the tooltip by checking the browser language with the url language.
    const preferredLangIndex = languagesData.findIndex(lData => preferredLang === lData.browserCode); // TODO if the index of the preferred lang is -1 it fails
    if (preferredLang && preferredLangIndex !== -1) {
      if (preferredLangIndex !== urlLangIndex) {
        // Creation of the new url.
        const newUrl = createNewUrl(urlLangIndex, preferredLangIndex);
        // Redirection to the new url.
        // The initial page will not be saved in session History, meaning the user won't be able to use the back button to navigate to it.
        window.location.replace(newUrl);
      }
    } else if (!dontAsk && browserLangIndex !== -1 && browserLangIndex !== urlLangIndex) {
      // SHOW THE TOOLTIP.
      // Append styles for the tooltip arrow.
      const tipCSSStyle = document.createElement('style');
      document.head.appendChild(tipCSSStyle);
      tipCSSStyle.sheet.insertRule(tipCSSStyleRule);
      // Creation of the new url.
      const newUrl = createNewUrl(urlLangIndex, browserLangIndex);
      // Assigns a reference to the tooltip HTML element.
      langTipContainer = createLanguageTooltip(languagesData[browserLangIndex], newUrl);
      // Sets the absolute position based on the position of another HTML element in the DOM.
      updatePosition();      
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      document.body.appendChild(langTipContainer);
      window.setTimeout(() => {
        langTipContainer.style.opacity = "1";
        langTipContainer.style.visibility = "visible";
      }, 2500);
    } else if (browserLangIndex === -1) {
      console.warn("Sorry but we don't have our website in your browser's language.");
    }
  }

  window.addEventListener('load', main);
})();