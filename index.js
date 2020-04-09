const langCodes = {
    es: "es",
    fr: "fr",
    it: "it",
    de: "de",
    zh: "zh-hans",
    ko: "ko",
    en: "en",
    other: "en"
}

const urlLangRegExps = {
    es: new RegExp(/^\/es\//),
    fr: new RegExp(/^\/fr\//),
    it: new RegExp(/^\/it\//),
    de: new RegExp(/^\/de\//),
    zh: new RegExp(/^\/zh-hans\//),
    ko: new RegExp(/^\/ko\//)
}

const browserLangRegExps = {
    es: new RegExp(/^es-{0,1}/),
    fr: new RegExp(/^fr-{0,1}/),
    it: new RegExp(/^it-{0,1}/),
    de: new RegExp(/^de-{0,1}/),
    zh: new RegExp(/^zh-{0,1}/),
    ko: new RegExp(/^ko-{0,1}/),
    en: new RegExp(/^en-{0,1}/)
}

// According to the available languages of the web site.
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
        return langCodes.other;
    }
}


// Set as browser lang if the site is different.
if (getUrlLang() !== getBrowserLang()) {
    let newUrl;
    if (getUrlLang() == langCodes.en) {
        newUrl = window.location.origin + "/" + getBrowserLang() + window.location.pathname;
    } else {
        newUrl = window.location.origin + "/" + getBrowserLang() + window.location.pathname.match(/^\/[a-z-]+(\/.+)/)[1];
    }
    const changeLangContainer = document.getElementById('changeLangContainer');
    changeLangContainer.style.display = "block"; // TODO add a class that has opacity with transition.
    changeLangContainer.innerHTML = `<a href="${newUrl}">View the site in ${getBrowserLang()}</a>`;
}