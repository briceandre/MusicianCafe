"use strict";

if (!String.prototype.startsWith) {
   Object.defineProperty(String.prototype, 'startsWith', {
       value: function(search, rawPos) {
           var pos = rawPos > 0 ? rawPos|0 : 0;
           return this.substring(pos, pos + search.length) === search;
       }
   });
}

function isIOS()
{
   return [
     'iPad Simulator',
     'iPhone Simulator',
     'iPod Simulator',
     'iPad',
     'iPhone',
     'iPod'
   ].includes(navigator.platform)
   // iPad on iOS 13 detection
   || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

function htmlentities(value)
{
   return jQuery('<div />').text(value).html();
}

function computeXPath(base, path)
{
   /* Compose the path */
   var result = "";
   if (path.startsWith('./'))
   {
      result = base+'/'+path;
   }
   else
   {
      result = path;
   }
   
   /* cleanup it */
   var cont = true;
   while (cont)
   {
      var q = result.replace('/./', '/');
      q = q.replace('//', '/');
      
      if (q == result)
      {
         cont = false;
      }
      else
      {
         result = q;
      }
   }
   
   return result;
}

function makeid(length)
{
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
function validateEmail(email) {
   const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   return re.test(String(email).toLowerCase());
}

function atou(b64) {
   return decodeURIComponent(escape(atob(b64)));
 }

 function utoa(data) {
   return btoa(unescape(encodeURIComponent(data)));
 }
