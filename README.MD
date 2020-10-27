# LANGUAGE MESSAGE BOX

## DESCRIPTION

A message box that indicates that the current web page is available in the user preferred language.

Initially the preferred language is taken from the browser language. Once the user has made a decision by clicking one of the two buttons of the message box this data will be used instead. Each time the user makes a decision a new value will be saved.

The message box will appear only if the site is not already in the preferred language and if the site is available in the preferred language.

It works by checking the preferred language against the language in the url of the page.

It only works in sites where the language code is placed at the beginning of the url (right after the origin). For example: `www.example.com/es/` 
It will NOT work in subdomain cases like: `es.example.com`

TODO --> IMG GIF VIDEO

### Example:

- Browser language is set to English.
- Site is accessed in Italian: `www.example.com/it/`
- Message box will appear indicating that the site is available in English (only if English has been set as an available language).
- If the button to stay in the italian version is clicked then italian will be saved as the preferred language.
- If the button to redirect to english is clicked then english will be saved as the preferred language.
- Next time, message box will only apear if the url language doesn't match with the stored prefererd language (if it is still a language available).

### Cookies

Two cookies are stored:
- `preferredLang` - When any of the two buttons is clicked. Stores the code for the language (corresponds to the `browserCode` of an object from the `languagesData` array).
- `dontAskLang` - When checkbox is available (`config.useDontAskAgainCheckbox`) and checked and one of the two buttons is clicked it stores "true".

## Warning

This script takes for granted that all the pages of the site are available in all the languages set in the `languagesData` array. It doesn't check if a page exists, it creates the new url by replacing the language code in the current one.

## TRY IT (TODO Live example ?)

Move to the 'test' directory and serve the files. Files should be served instead of just opening them with the browser because the script works by checking the origin and pathname of the url of the page. Port should be 8080.

In the 'test' directory there are four language folders to simulate these urls: /es/index.html, /fr/index.html, /it/index.html and /zh-hans/index.html.

Open `http://localhost:8080/index.html` which corresponds to the default language (English).
If the browser language is English nothing will happen, but if it is in another language available by the website the message box will appear suggesting it.

Open `http://localhost:8080/zh-hans/index.html` which corresponds to the Chinese website.
If the browser is not in Chinese it will suggest to go the browser's language in case it is supported by the website.

Once a decision has been made by clicking one of the two buttons a languge will be saved as preferred and next time it will be used.

At the beginning of the script you will find the `config` object.
- Try changing the `config.mode` from 'centered' to 'anchored' or viceversa.
- Enable the `config.useDontAskAgainCheckbox` so a checkbox will be available. If checked and clicked a button next time instead of asking it will redirect automatically. Since automatic redirect can cause frustration it is recommended to also save that cookie from the site's language buttons.

## INSTALLATION

All the logic including the configuration data is in the src/index.js file. Just reference the file in your website.

## CONFIGURATION

### Site languages data

At the beginning of the file there is an array of language objects (`languagesData`) where the available languages for the site should be set with all the information. They should correspond to languages avaialble for the site, no more no less objects.

- `urlCode` - Lang code used in the website url (without the slashes). For example: 'es'. Leave as empty string for the language that corresponds to the url without any code (default language).
- `browserCode` - The two first characters of the official browser lang code. For example: 'es'. https://www.metamodpro.com/browser-language-codes
- `sentence` - First string on the message box. For example: 'This page is available in English'.
- `redirectButton` - Text content for the button to redirect. For example: 'View in English'.
- `stayButton` - Text content for the button to stay. For example: 'Stay in English'.
- `remember` - Label for the checkbox to don't show again the message box. For example: 'Don't show again'.

### Configuration object

At the beginning of the file there is also the configuration object (`config`).

- `mode` - Modes can be *centered* or *anchored*. First to place it in the center of the window, second to place it relative to another HTMLElement as a tooltip.
- `referenceElements` - Array of CSS classes or ids to place the container relative to. Only required when mode is set to 'anchored'. If more than one they should be in order of preference, and the first one that is find is the one that will be used. For example: ['.first-element', '.second-element'].
- `redirectBtnClassName` - Optional CSS class to style the button to redirect (HTMLAnchorElement). For example: *theme-button-primary*.
- `stayBtnClassName` - Optional CSS class to style the button to stay (HTMLButtonElement). For example: *theme-button-default*.
- `displayDelay` - Delay in milliseconds to display the message box.
- `cssStyle` - Main container styles.
  - `backgroundColor`
  - `borderRadius`
  - `zIndex`
- `useDontAskAgainCheckbox` - If true message won't show again, and if a language is selected by clicking one of the buttons it will redirect automatically next time. If this is used it is recommended to also save the preferredLang cookie from another place in the website, like buttons to switch the language.
- `tooltipArrowSize` - When mode is 'anchored' it will appear like a tooltip relative to a referenceElement. This sets the tooltip arrow size in pixels.
- `tooltipDefaultTop` - When mode is 'anchored' this will be the default CSS top position in pixels in case no referenceElement is found.
- `tooltipDefaultRight` - When mode is 'anchored' this will be the default CSS right position in pixels in case no referenceElement is found.
- `cookieExpirationDays` - Amount of days the cookies with the language preference data will last.
- `useAlternateHreflang` - Boolean - If set to true each page is expected to have a link element like &lt;link rel="alternate" hreflang=".." href=".." /&gt; in the &lt;head&gt; for each of the translations for the page, and the url provided in its href will be used to direct to the translation. Note that if set to true but no translation url is found nothing will happen. If translations have different urls because for example they are translated this would be the only way to get them.

## License

MIT