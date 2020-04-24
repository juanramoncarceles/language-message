// This script works by checking the value of the language code found in the current url (window.location) against the language set on the browser.
// The language code in the url of the site is expected to be located after the origin and at the begining of the path: www.example.com/LANG/rest/of/the/path
// The default site language in this case is considered English, without any lang code in the url.

/**
 * Website language codes used in the url.
 * Set the language codes used as the values of the entries.
 */

// IMPORTATN LEAVE EMPTY string THE urlCode value OF THE DEFAULT LANG
// put the beginning of the browser code, until the dash. should be the official
// Add the available languages in the website.
const langCodes2 = [
  {
    urlCode: 'es',
    browserCode: 'es-',
    sentence: 'Ver en Español'
  },
  {
    urlCode: 'fr',
    browserCode: 'fr-',
    sentence: 'Voir en Français'
  },
  {
    urlCode: 'it',
    browserCode: 'it-',
    sentence: 'Vedere in Italiano'
  },
  {
    urlCode: 'de',
    browserCode: 'de-',
    sentence: 'Ansicht auf Deutsch'
  },
  {
    urlCode: 'zh-hans',
    browserCode: 'zh-',
    sentence: '用中文查看'
  },
  {
    urlCode: 'ko',
    browserCode: 'ko-',
    sentence: '한국어로보기'
  },
  {
    urlCode: '',
    browserCode: 'en-',
    sentence: 'View in English'
  }
];


// Returns the index of the code lang in langCodes2.
function getUrlLangIndex() {
  const websitePath = window.location.pathname;
  const xx = langCodes2.findIndex(lang => {
    const langRegExp = new RegExp('^\/' + lang.urlCode + '\/');
    return langRegExp.test(websitePath);
  });
  // If -1 return the index of the empty, which is the default
  if (xx === -1) 
    return langCodes2.findIndex(lang => lang.urlCode === '');
  else
    return xx;
}

// If no code matches it is intended that the website doesnt have the browsers language and -1 is returned.
function getBrowserLangIndex() {
  const browserLang = navigator.language || navigator.userLanguage;
  return langCodes2.findIndex(lang => {
    const langRegExp = new RegExp('^' + lang.browserCode + '{0,1}');
    return langRegExp.test(browserLang);
  });
}

// Here is checked if a redirection could be necessary.
// If the getBrowserLang returns undefined it means that we have no website language that can match, so nothing is done.
// If there is a supported browser language and it is different than the one on the current website then offer the website with the browser lang.
if (getBrowserLangIndex() !== -1 && getBrowserLangIndex() !== getUrlLangIndex()) {
  const newUrlLangCode = langCodes2[getBrowserLangIndex()].urlCode;
  // remove the existing url lang if any
  let urlPathname;
  if (langCodes2[getUrlLangIndex()].urlCode !== '') {
    const pathRegExp = new RegExp('^\/' + langCodes2[getUrlLangIndex()].urlCode + '(\/.+)');
    urlPathnameRes = window.location.pathname.match(pathRegExp);
    urlPathname = urlPathnameRes !== null ? urlPathnameRes[1] : '/';
  } else {
    urlPathname = window.location.pathname;
  }
  const newUrl = window.location.origin + (newUrlLangCode !== '' ? "/" + newUrlLangCode : '') + urlPathname;
  const changeLangContainer = document.getElementById('changeLangContainer');
  changeLangContainer.style.display = "block"; // TODO add a class that has opacity with transition.
  changeLangContainer.innerHTML = `<a href="${newUrl}">${langCodes2[getBrowserLangIndex()].sentence}</a>`;
} else if (getBrowserLangIndex() === -1) {
  console.warn("Sorry but we don't have our website in your browser's language.");
}