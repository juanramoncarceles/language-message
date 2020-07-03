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
   * @property {string} redirectButton Text content for the button to redirect. For example: 'View in English'
   * @property {string} stayButton Text content for the button to stay. For example: 'Stay in English'
   * @property {string} remember Label for the checkboc to don't show again the tooltip. For example: 'Don't show again'
   */
  const languagesData = [
    {
      urlCode: 'es',
      browserCode: 'es',
      sentence: 'Esta página está disponible en Español',
      redirectButton: 'Ver en Español',
      stayButton: 'Quedarse en Español',
      remember: 'No volver a mostrar'
    },
    {
      urlCode: 'fr',
      browserCode: 'fr',
      sentence: 'Cette page est disponible en français',
      redirectButton: 'Voir en Français',
      stayButton: 'Rester dans Français',
      remember: 'Ne montre plus'
    },
    {
      urlCode: 'it',
      browserCode: 'it',
      sentence: 'Questa web è disponibile in Italiano',
      redirectButton: 'Vedere in Italiano',
      stayButton: 'Rimanere in Italiano',
      remember: 'Non mostrare di nuovo'
    },
    {
      urlCode: 'zh-hans',
      browserCode: 'zh',
      sentence: '此页面有中文版本',
      redirectButton: '用中文查看',
      stayButton: '保持中文',
      remember: '不再显示'
    },
    {
      urlCode: '',
      browserCode: 'en',
      sentence: 'This page is available in English',
      redirectButton: 'View in English',
      stayButton: 'Stay in English',
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

  // TODO add automatic redirect option true or false.
  // If autoRedirect is set to true it is recommended to save the cookie also from another place to allow change the preferred lang

  const config = {
    mode: 'centered', // 'centered' | 'anchored'
    referenceElements: ['.wpml-ls-current-language', '.ast-mobile-menu-buttons'], // only required when mode anchored is set
    redirectBtnClassName: '',
    stayBtnClassName: '',
    delay: 2500,
    cssStyle: {
      backgroundColor: '#f3f3f3',
      borderRadius: '5px', // Main container border radius.
      zIndex: 98
    },
    /**
     * If true message wont show again, and if a language was selected it will redirect.
     */
    useDontAskAgainCheckbox: false,
    /**
     * Tooltip arrow size in pixels.
     */
    globalTipArrowSize: 8,
    /**
     * Default top position in pixels in case no reference HTML element is found.
     */
    tooltipDefaultTop: 10,
    /**
     * Default right position in pixels in case no reference HTML element is found.
     */
    tooltipDefaultRight: 10,
    /**
     * Amount of days until the tooltip will appear again in case the user already made a decision.
     */
    cookieExpirationDays: 30
  }




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
      langTipContainer.style.top = refElementBoundingRect.bottom + config.globalTipArrowSize + window.scrollY + 'px';
      langTipContainer.style.right = window.innerWidth - (refElementBoundingRect.right) + 'px';
    } else {
      langTipContainer.style.top = config.tooltipDefaultTop + 'px';
      langTipContainer.style.right = config.tooltipDefaultRight + 'px';
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
    for (let i = 0; i < config.referenceElements.length; i++) {
      refEl = document.querySelector(config.referenceElements[i]);
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
        langTipContainer.style.setProperty('--tip-arrow-size', config.globalTipArrowSize + 'px');
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
   * Applies some basic button CSS styles.
   * @param {HTMLElement} element 
   */
  function setButtonBaseStyle(element) {
    element.style.border = '1px solid';
    element.style.padding = '6px';
    element.style.borderRadius = '3px';
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
   * @param {Object} newLangObj The language object for the suggested language with the contents to populate the container.
   * @param {Object} pageLangObj The language object for the page language with the contents to populate the container.
   * @param {string} url The url of the equivalent page in the suggested language.
   * @returns {HTMLDivElement} The HTML tooltip element.
   */
  function createLanguageTooltip(newLangObj, pageLangObj, url) {
    const container = document.createElement('div');
    container.classList.add('language-tip');
    // Close button.
    const closeBtn = document.createElement('div');
    closeBtn.style.cssText = 'position:absolute;top:10px;right:10px;width:0.8em;cursor:pointer;';
    closeBtn.innerHTML = '<svg viewBox="0 0 15 15" stroke="#585858" stroke-width="2" style="display:block;"><line x1="0" y1="0" x2="15" y2="15" /><line x1="0" y1="15" x2="15" y2="0" /></svg>';
    closeBtn.onclick = () => {
      const dontAskAgainCheckbox = container.querySelector('#confirm-checkbox');
      if (dontAskAgainCheckbox && dontAskAgainCheckbox.checked) {
        setCookie("dontAskLang", "true", config.cookieExpirationDays);
      }
      removeTooltip();
    };
    container.appendChild(closeBtn);
    // Sentence.
    const sentence = document.createElement('span');
    sentence.textContent = newLangObj.sentence;
    container.appendChild(sentence);
    // Buttons container.
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.marginTop = '10px';
    if (config.mode === 'anchored') {
      buttonsContainer.style.flexDirection = 'column';
      buttonsContainer.style.alignItems = 'center';
    }
    // Redirect to change language button.
    const redirectBtn = document.createElement('a');
    redirectBtn.href = url;
    redirectBtn.textContent = newLangObj.redirectButton;
    redirectBtn.style.textDecorationLine = 'none';
    // If no CSS class has been provided for the main button apply default styles.
    if (!config.redirectBtnClassName) {
      redirectBtn.style.backgroundColor = '#d4d4d4';
      setButtonBaseStyle(redirectBtn);
    }
    // Style mode dependent.
    if (config.mode === 'anchored') {
      redirectBtn.style.marginBottom = '10px';
    } else {
      redirectBtn.style.marginRight = '10px';
    }
    if (config.redirectBtnClassName) redirectBtn.classList.add(config.redirectBtnClassName);
    redirectBtn.onclick = () => {
      const dontAskAgainCheckbox = container.querySelector('#confirm-checkbox');
      if (dontAskAgainCheckbox && dontAskAgainCheckbox.checked) {
        setCookie("dontAskLang", "true", config.cookieExpirationDays);
      }
      setCookie("preferredLang", newLangObj.browserCode, config.cookieExpirationDays);
      removeTooltip();
    };
    buttonsContainer.appendChild(redirectBtn);
    // Stay button.
    const stayBtn = document.createElement('button');
    stayBtn.textContent = pageLangObj.stayButton;
    stayBtn.style.cursor = 'pointer';
    stayBtn.style.fontSize = 'inherit';
    // If no CSS class has been provided for the secondary button apply default styles.
    if (!config.stayBtnClassName) {
      setButtonBaseStyle(stayBtn);
    }
    stayBtn.onclick = () => {
      const dontAskAgainCheckbox = container.querySelector('#confirm-checkbox');
      if (dontAskAgainCheckbox && dontAskAgainCheckbox.checked) {
        setCookie("dontAskLang", "true", config.cookieExpirationDays);
      }
      setCookie("preferredLang", pageLangObj.browserCode, config.cookieExpirationDays);
      removeTooltip();
    }
    buttonsContainer.appendChild(stayBtn);
    // Buttons wrapper appended.
    container.appendChild(buttonsContainer);
    // Checkbox to dont show again tooltip.
    if (config.useDontAskAgainCheckbox) {
      const dontShowAgain = document.createElement('div');
      dontShowAgain.style.cssText = 'display:flex;align-items:center;margin-top:10px;';
      dontShowAgain.innerHTML = `<input id="confirm-checkbox" type="checkbox" style="margin: 0 5px 0 0;"><label for="confirm-checkbox">${newLangObj.remember}</label>`;
      container.appendChild(dontShowAgain);
    }
    // Container css.
    container.style.cssText = `
      display:flex;
      flex-direction:column;
      align-items:center;
      padding:32px 14px 14px;
      font-family: sans-serif;
      border-radius:${config.cssStyle.borderRadius};
      background-color:${config.cssStyle.backgroundColor};
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
    if (langTipContainer.parentElement.dataset.tooltipWrapper === 'true') {
      langTipContainer.parentElement.remove();
    } else {
      langTipContainer.remove();
    }
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
      border-color: transparent transparent ${config.cssStyle.backgroundColor} transparent;
    }
  `;


  /**
   * Sets a delay and/or transition in an HTML element display.
   * @param {HTMLElement} HTMLElement the target HTML element.
   * @param {number} delay delay in milliseconds.
   * @param {number} transition transition duration in seconds.
   */
  function setElementDisplayDelay(HTMLElement, delay, transition = 1) {
    HTMLElement.style.opacity = "0";
    HTMLElement.style.transition = `opacity ${transition}s`;
    HTMLElement.style.visibility = "hidden";
    window.setTimeout(() => {
      HTMLElement.style.opacity = "1";
      HTMLElement.style.visibility = "visible";
    }, delay);
  }


  /**
   * Sets the position mode based on the config.mode value: 'anchored' or 'centered'
   */
  function setElementPositionMode() {
    // Setting the mode based on the config.
    if (config.mode === 'anchored') {
      // Sets the absolute position based on the position of another HTML element in the DOM.
      // Append styles for the tooltip arrow.
      const tipCSSStyle = document.createElement('style');
      document.head.appendChild(tipCSSStyle);
      tipCSSStyle.sheet.insertRule(tipCSSStyleRule);
      updatePosition();      
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      // Styles specific for the anchored mode tooltip.
      langTipContainer.style.willChange = "top,right";
      langTipContainer.style.position = "absolute";
      langTipContainer.style.zIndex = config.cssStyle.zIndex;
      setElementDisplayDelay(langTipContainer, config.delay, 1);
      document.body.appendChild(langTipContainer);
    } else if (config.mode === 'centered') {
      const wrapper = document.createElement('div');
      wrapper.dataset.tooltipWrapper = 'true';
      wrapper.style.cssText = `
        position: fixed;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100vw;
        height: 100vh;
        top: 0;
        background-color: rgba(128, 128, 128, 0.5);
      `;
      wrapper.onclick = e => {if (e.target === wrapper) removeTooltip();}
      wrapper.appendChild(langTipContainer);
      setElementDisplayDelay(wrapper, config.delay, 1);
      document.body.appendChild(wrapper);
    } else {
      console.warn('config.mode should be set to either anchored or centered');
    }
  }


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
    // Check the index of the preferredLang, if it is -1 the page is not available in this lang.
    const preferredLangIndex = languagesData.findIndex(lData => preferredLang === lData.browserCode);
    if (dontAsk) {
      if (preferredLang && preferredLangIndex !== -1) {
        // If url lang doesnt match with preferredLang redirect.
        if (preferredLangIndex !== urlLangIndex) {
          // Creation of the new url.
          const newUrl = createNewUrl(urlLangIndex, preferredLangIndex);
          // Redirection to the new url.
          // The initial page will not be saved in session History, meaning the user won't be able to use the back button to navigate to it.
          window.location.replace(newUrl);
        }
      }
    } else if (preferredLang && preferredLangIndex !== -1) {
      // If url lang doesnt match with the saved preferredLang.
      if (preferredLangIndex !== urlLangIndex) {
        // Get the new lang data.
        const newUrl = createNewUrl(urlLangIndex, preferredLangIndex);
        const proposedLangObject = languagesData[preferredLangIndex];
        // Assign a reference to the tooltip HTML element.
        langTipContainer = createLanguageTooltip(proposedLangObject, languagesData[urlLangIndex], newUrl);
        setElementPositionMode();
      }
    } else if (browserLangIndex !== -1) {
      if (preferredLang && preferredLangIndex === -1) {
        console.warn(`Sorry, we don't have our website in ${preferredLang}.`);
      }
      // If url lang doesnt match with the browserLang.
      if (browserLangIndex !== urlLangIndex) {
        // Get the new lang data.
        const newUrl = createNewUrl(urlLangIndex, browserLangIndex);
        const proposedLangObject = languagesData[browserLangIndex];
        // Assign a reference to the tooltip HTML element.
        langTipContainer = createLanguageTooltip(proposedLangObject, languagesData[urlLangIndex], newUrl);
        setElementPositionMode();
      }
    } else if ((preferredLang && preferredLangIndex === -1) || browserLangIndex === -1) {
      console.warn(`Sorry, we don't have our website in ${preferredLang ? preferredLang : (navigator.language || navigator.userLanguage)}.`);
    }
  }

  window.addEventListener('load', main);
})();