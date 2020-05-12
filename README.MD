# DESCRIPTION

Script to show a tooltip indicating if the website is available in the language of the browser.

# INSTRUCTIONS

Serve the folder files with a server.
To test there is one index.html in the root folder and three more inside language folders: /es/index.html, /it/index.html and /zh-hans/index.html.

Open http://localhost/index.html which corresponds to the default language (English).
If the browser language is English no link will appear, but if it is in another language supported by the website a link will appear suggesting it.

Open http://localhost/zh-hans/index.html which corresponds to the Chinese website.
If the browser is not in Chinese then it will suggest to go the browser's language in case it is supported by the website.