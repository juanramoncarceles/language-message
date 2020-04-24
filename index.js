// This script works by checking the value of the language code found in the current url (window.location) against the language set on the browser.
// The language code in the url of the site is expected to be located after the origin and at the begining of the path: www.example.com/LANG/rest/of/the/path
// The default site language in this case is considered English, without any lang code in the url.

/**
 * Website language codes used in the url.
 * Set the language codes used as the values of the entries.
 */
const langCodes = {
  es: "es",
  fr: "fr",
  it: "it",
  de: "de",
  zh: "zh-hans",
  ko: "ko",
  en: "en"
}


// Regular expressions according to the Official Language Codes for the browsers.
// Create only the ones available in the website.
const browserLangRegExps = {
  es: new RegExp(/^es-{0,1}/),
  fr: new RegExp(/^fr-{0,1}/),
  it: new RegExp(/^it-{0,1}/),
  de: new RegExp(/^de-{0,1}/),
  zh: new RegExp(/^zh-{0,1}/),
  ko: new RegExp(/^ko-{0,1}/),
  en: new RegExp(/^en-{0,1}/)
}

/**
 * Creates an object with all the regular expressions to check the web site url language code.
 * @param {Object} languageCodes The object with the website language codes.
 */
function createUrlLangRegExpsObj(languageCodes) {
  const regExpsObj = {};
  for (let key in languageCodes) {
    const regExpValue = '^\/' + languageCodes[key] + '\/';
    regExpsObj[key] = new RegExp(regExpValue);
  }
  return regExpsObj;
}

const urlLangRegExps = createUrlLangRegExpsObj(langCodes);

// According to the available languages of the web site.
// Last one should be the default language.
function getUrlLang() {
  const websitePath = window.location.pathname;
  if (urlLangRegExps.es.test(websitePath)) {
    return langCodes.es;
  } else if (urlLangRegExps.fr.test(websitePath)) {
    return langCodes.fr;
  } else if (urlLangRegExps.it.test(websitePath)) {
    return langCodes.it;
  } else if (urlLangRegExps.de.test(websitePath)) {
    return langCodes.de;
  } else if (urlLangRegExps.zh.test(websitePath)) {
    return langCodes.zh;
  } else if (urlLangRegExps.ko.test(websitePath)) {
    return langCodes.ko;
  } else {
    return langCodes.en;
  }
}

/**
 * Checks if the browser has a language that the website supports,
 * otherwise it returns undefined.
 */
function getBrowserLang() {
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLangRegExps.es.test(browserLang)) {
    return langCodes.es;
  } else if (browserLangRegExps.fr.test(browserLang)) {
    return langCodes.fr;
  } else if (browserLangRegExps.it.test(browserLang)) {
    return langCodes.it;
  } else if (browserLangRegExps.de.test(browserLang)) {
    return langCodes.de;
  } else if (browserLangRegExps.zh.test(browserLang)) {
    return langCodes.zh;
  } else if (browserLangRegExps.ko.test(browserLang)) {
    return langCodes.ko;
  } else if (browserLangRegExps.en.test(browserLang)) {
    return langCodes.en;
  } else {
    return undefined;
  }
}


// Here is checked if a redirection could be necessary.
// If the getBrowserLang returns undefined it means that we have no website language that can match, so nothing is done.
// If there is a supported browser language and it is different than the one on the current website then offer the website with the browser lang.
if (getBrowserLang() !== undefined && getBrowserLang() !== getUrlLang()) {
  let newUrl;
  if (getUrlLang() === langCodes.en) { // If the url had the default lang (english) then only add the browser one at the beginning of the path.
    newUrl = window.location.origin + "/" + getBrowserLang() + window.location.pathname;
  } else { // If the url had another language, then replace it by the one of the browser.
    const urlPathname = window.location.pathname.match(/^\/[a-z-]+(\/.+)/);
    newUrl = window.location.origin + (getBrowserLang() !== langCodes.en ? "/" + getBrowserLang() : '') + (urlPathname !== null ? urlPathname[1] : '');
  }
  const changeLangContainer = document.getElementById('changeLangContainer');
  changeLangContainer.style.display = "block"; // TODO add a class that has opacity with transition.
  changeLangContainer.innerHTML = `<a href="${newUrl}">View the site in ${getBrowserLang()}</a>`;
}


// TESTS
// What happens if the site is in english (default lang) or any other lang and the browser is in a not supported language?