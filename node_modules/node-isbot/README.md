# node-isbot

 
 

[![NPM](https://nodei.co/npm/node-isbot.png)](https://nodei.co/npm/node-isbot/)


[![npm version](https://badge.fury.io/js/node-isbot.svg)](https://badge.fury.io/js/node-isbot)


### install

      $ npm install node-isbot --save

### usage

    
    const http = require('http');
    const isbot = require('node-isbot');



    http.createServer(function(req, res, next) {

        isbot(req.headers['user-agent']);

        isbot("Googlebot/2.1 (+http://www.google.com/bot.html)"); // true
        isbot("Googlebot"); // true
        isbot("yahoo"); // true
        isbot("Sogou Pic Spider"); // true
        isbot("PHP"); // true
        isbot("Baiduspider"); // true
        isbot("360Spider"); // true
        isbot("java/"); // true

        isbot("Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36"); // false

    });
    

### test

    $ npm test

#### browser.txt

    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36"
    Mozilla/5.0 (Android; Mobile; rv:14.0) Gecko/14.0 Firefox/14.0
    Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19
    Mozilla/5.0 (compatible; WOW64; MSIE 10.0; Windows NT 6.2)
    Mozilla/4.0 (Windows; MSIE 6.0; Windows NT 5.2)
    Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)
    Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)
    Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)


#### crawlers.txt

    java/
    360Spider
    Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)
    bingbot
    Googlebot
    http_client
    yahoo
