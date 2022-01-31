"use strict";

/* prepare soap */
var MusicianCafe_soap = new https___musician_cafe__MusicianCafe;
MusicianCafe_soap.url = "/php/soap.php";

window.cache_store = false;

if (navigator && navigator.storage && navigator.storage.estimate)
{
   navigator.storage.estimate().then(function(estimate)
   {
      console.log("STORAGE LIMIT : "+(estimate.usage/(1024*1024))+'Mb used / '+(estimate.quota/(1024*1024))+'Mb Max');
   });
}

var dbconnect = window.indexedDB.open('MusicianCafeCache', 1);
dbconnect.onupgradeneeded = ev =>
{
   const db = ev.target.result;
   const store = db.createObjectStore('data', { keyPath: 'name'});
   store.createIndex('name', 'name', { unique: true });
}
dbconnect.onsuccess = ev =>
{
   window.cache_store = ev.target.result;
}

function StoreInCache(type, id, data)
{
   /* Prepare cache stuff */
   var cache_key_name = JSON.stringify({type: type, id: id});

   window.cache_store.transaction('data', 'readwrite').objectStore('data').put({name: cache_key_name, value: data});
}
function CheckInCache(type, id, on_success, on_failure)
{
   /* Prepare cache stuff */
   var cache_key_name = JSON.stringify({type: type, id: id});

   /* Check if we can retrieve from cache */
   var request = window.cache_store.transaction('data', 'readwrite').objectStore('data').get(cache_key_name);

   request.onerror = function(event)
   {
      on_failure();
   }

   request.onsuccess = function(event)
   {
      if (request.result)
      {
         on_success(request.result.value);
      }
      else
      {
         on_failure();
      }
   };
}

function PerformSoap(method, on_success, on_failure, args)
{
   if ((method == 'Login') ||
       (method == 'ChangePassword') ||
       (method == 'ResetPassword') ||
       (method == 'Register'))
   {
      /* Peform query */
      MusicianCafe_soap[method].apply(MusicianCafe_soap, [function(r)
      {
         /* Call on success callback */
         on_success(r);
      }, on_failure].concat(args));
   }
   else
   {
      /* Concatenate login argument */
      var login = new https___musician_cafe__loginType()
      login.setId(logInfo.getId());
      login.setPassword(logInfo.getPassword());

      /* Peform query */
      MusicianCafe_soap[method].apply(MusicianCafe_soap, [function(r)
      {
         /* Call on success callback */
         if (r.getStatus() == 0)
         {
            on_success(r);
         }
         else
         {
            on_failure(r.getStatus());
         }
      }, function(){on_failure(-1);}, login].concat(args));
   }
}

/* Declare history management */
var historyNavigation =
{
   hash: false,
   history: [],
   onLeave: false,
   last_poped_state: false,

   init: function(page, func, _arguments)
   {
      this.hash = makeid(50);

      this.last_poped_state = {page: page, is_first: true, func: func, args: _arguments, hash: this.hash}

      $('body').attr('page', page);

      window.history.replaceState(this.last_poped_state, '');
      window.onpopstate = this.onState.bind(this)

      /* Remove icon */
      $('#go-back').hide();

      $('#go-back').off( "click");
      $('#go-back').click(function(){window.history.back();})

      /* Reset internal stuff */
      this.onLeave = false;
   },

   registerOnLeave: function(clbck)
   {
      this.onLeave = clbck;
   },

   onState: function(e)
   {
      if (e.state && (e.state.hash == this.hash))
      {
         /* Invoke onleave callback */
         if (this.onLeave)
         {
            this.onLeave();
         }
         this.onLeave = false;

         /* Check for display of go-back */
         if (e.state.is_first)
         {
            $('#go-back').hide();
         }
         else
         {
            $('#go-back').show();
         }

         /* Perform navigation on last entry now */
         $('body').attr('page', e.state.page);
         window[e.state.page][e.state.func].apply(window[e.state.page], e.state.args);
      }
      else
      {
         window.history.replaceState(this.last_poped_state, '');
      }
   },

   GoBack: function()
   {
      window.history.back();
   },

   Navigate: function(page, func, _arguments)
   {
      $('#go-back').show();

      this.last_poped_state = {page: page, is_first: false, func: func, args: _arguments, hash: this.hash}
      window.history.pushState(this.last_poped_state, '');
      $('body').attr('page', page);
      window[page][func].apply(window[page], _arguments);
   },

   NavigateNoHistory: function(page, func, _arguments)
   {
      $('#go-back').show();

      /* We push a dummy entry so that we can go back, but cannot return to navigated page */
      this.last_poped_state = {page: '', is_first: false, func: '', args: '', hash: ''}
      window.history.pushState(this.last_poped_state, '');

      /* Perform navigation */
      $('body').attr('page', page);
      window[page][func].apply(window[page], _arguments);
   },

   SetPageWithoutNavigation: function(page)
   {
      $('body').attr('page', page);
   }
}

/* Initialise screen */
$( document ).ready(function()
{
   /* Initialise the menu */
   var html = '<ul>'
             +'   <li><a href="#" id="on-pres">'+_("Presentation")+'</a></li>'
             +'   <li><a href="#" id="on-access">'+_("Acces")+'</a></li>'
             +'   <li><a href="#" id="on-forum">'+_("Forum")+'</a></li>'
             +'</ul>'
   $('#main-menu').html(html);
   $('#main-header').navbar();

   $('#on-pres').click( function()
   {
      historyNavigation.Navigate('PresentationPage', 'LoadPresentationScreen', []);
      $('#on-access').removeClass('ui-btn-active');
      $('#on-forum').removeClass('ui-btn-active');
   });
   $('#on-access').click( function()
   {
      historyNavigation.Navigate('LoginPage', 'LoadLoginScreen', [])
      $('#on-pres').removeClass('ui-btn-active');
      $('#on-forum').removeClass('ui-btn-active');
   });
   $('#on-forum').click( function(){alert(_("Coming soon !"))});

   /* Init log info */
   logInfo.init();

   /* Init history stuff */
   historyNavigation.init('LoginPage', 'LoadLoginScreen', []);

   /* Perform initialisation of page */
   LoginPage.LoadLoginScreen();
})

jsGettext.initialize();
window._ = function(a){return jsGettext.gettext(a);}

/* Define functions used for navigation */
window.onPrevious = function(){}
window.onNext = function(){}

/* Connect arrow keys for navigation */
function checkKey(e)
{
   e = e || window.event;

   if (e.keyCode == '37')
   {
      window.onPrevious()
   }
   else if (e.keyCode == '39')
   {
      window.onNext();
   }
}
document.onkeydown = checkKey;

window.alert = function(str)
{
   $('#alert-message').text(str);
   
   $('#alert-popup').enhanceWithin();

   $('#alert-popup').css('display', 'inline-block');

   $("#alert-popup").popup();
   $("#alert-popup").popup("open"); 
}
