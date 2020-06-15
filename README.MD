# LANGUAGE TOOLTIP

## DESCRIPTION

Show a tooltip suggesting that the site is available in the browser language. This will happen if the site is available in the browser language and if the page is not already in this language.

### Example:
Browser language is Spanish.
The site is accessed in italian: www.example.com/it/
Tooltip will appear indicating that the site is available in Spanish (only if Spanish has been set as an avaiable language).

It works by checking the browser language in a list of laguanges that the site is available in.
If none matches (lang is not avaialble) or if the languge is the same nothing will happen, otherwise it will appear. 

It works in sites where the language code is placed at the beginning of the url (right after the origin). For example: www.example.com/es/ 
It will NOT work in subdomain cases: es.example.com


## SET UP

All the logic is in the index.js file.

At the beginning of the index.js file there is an array of language objects where the available languages for the site should be set with all the information.

languagesData is and array of objects with this data:
urlCode: 'es',
browserCode: 'es',
sentence: 'Esta página está disponible en Español',
button: 'Ver en Español',
remember: 'No volver a mostrar'

There should be one for each of the languages avaialble for the site.

The url without languge code will be considered the default language of the site.
For example:
urlCode: '',
browserCode: 'en',
sentence: 'This page is available in English',
button: 'View in English',
remember: 'Don\'t show again'


Set the CSS classes of the existing HTML elements to use as a reference to position the tooltip. The first one that is found and visible will be used.





## TEST

NOTE: Some kind of server should be used because it works by checking the origin and pathname of the url of the page.

To test it, move to the 'test' folder and serve the files from that folder.
There is one index.html in the 'test' folder and three more inside language folders: /es/index.html, /it/index.html and /zh-hans/index.html.

Example:
Open http://localhost/index.html which corresponds to the default language (English).
If the browser language is English no link will appear, but if it is in another language supported by the website a link will appear suggesting it.

Open http://localhost/zh-hans/index.html which corresponds to the Chinese website.
If the browser is not in Chinese then it will suggest to go the browser's language in case it is supported by the website.



If the "Don't ask again" is checked a cookie will be saved.

Cookies saved:
  preferredLang saves the lang code value of the browser lang choosed
  dontAskLang saves "true"

This can be used to set those cookies for example from the languages list in the page or to serve the right page.
Even if the preferredLang is set from another point the tooltip will appear unless the dontAskLang is set to "true" as well.


