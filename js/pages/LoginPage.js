"use strict";

var logInfo =
{
   news_callback: false,
   displayed_news_unread_message: [],
   displayed_news_shared_sample: [],
   displayed_news_shared_partition: [],

   init: function()
   {
      var has_logged = false;

      var cookie_value = Cookies.get('connection');
      if (cookie_value)
      {
         var data = JSON.parse(cookie_value);
         if (data.connected)
         {
            has_logged = true;
            this.login(data.email, data.password, data.info);
         }
      }

      if (!has_logged)
      {
         this.logout();
      }
   },

   logout: function()
   {
      if (this.news_callback)
      {
         clearInterval(this.news_callback);
         this.news_callback = false;
      }

      Cookies.set('connection', JSON.stringify({connected: false, email: false, password: false, info: false}), { expires: 7, sameSite: 'strict', secure: true });

      this.is_logged = false;
      this.email = '';
      this.password = '';
      this.info = false;

      $('#show-user-info').hide();
   },

   login: function(email, password, info)
   {
      Cookies.set('connection', JSON.stringify({connected: true, email: email, password: password, info: info}), { expires: 7, sameSite: 'strict', secure: true });

      if (!this.is_logged)
      {
         this.is_logged = true;
         this.email = email;
         this.password = password;
         this.info = info;

         $('#show-user-info').show();

         var html = '<div is="grid" class="ui-grid-a" style="height:95px">'
                   +'  <div is="block" class="ui-block-a" style="height:100%;width:80%"> <h3>'+_('Bonjour')+' '+htmlentities(this.info.name)+' !</h3></div>'
                   +'  <div is="block" class="ui-block-b" style="height:100%;width:15%"><a id="logout-button" href="#" data-role="button" data-icon="ui-icon-power" data-show-label="false" data-inline="true">Exit</a></div>'
                   +'</div>'
                   +'<div><h3 id="news-panel">'+_('Fil d\'actualite')+'</h3></div>'
                   +'<div id="news-popup"></div>';

         $('#user-info').html(html);
         $('#user-info').enhanceWithin();

         $('#logout-button').click( function()
         {
            $("[data-role=panel]").panel("close");

            this.logout();
            historyNavigation.init('LoginPage', 'LoadLoginScreen', []);
            LoginPage.LoadLoginScreen();
         }.bind(this));

         if (!this.news_callback)
         {
            this.news_callback = setInterval(this.checkNews.bind(this), 5*60*1000);
            this.displayed_news_unread_message = [];
            this.displayed_news_shared_sample = [];
            this.displayed_news_shared_partition = [];
            this.checkNews();
         }
      }
   },

   checkNews: function()
   {
      MusicianCafeGetNews(function(r)
      {
         if (r.length > 0)
         {
            for (var i = (r.length-1); i >= 0; i--)
            {
               if (r[i].type == 0)
               {
                  var message_id = r[i].target_id;
                  if (!this.displayed_news_unread_message.includes(message_id))
                  {
                     $('#show-user-info').addClass('has-news');

                     this.displayed_news_unread_message.push(message_id);
                     $( "#news-panel" ).after( "<div id='news-message-"+message_id+"' class='news-post' message-id='"+message_id+"'>"+htmlentities(r[i].subject)+"</div>" )

                     $("#news-message-"+message_id).click(function()
                     {
                        /* Display if */
                        var message = parseInt($(this).attr('message-id'));

                        MusicianCafeGetMessage(message, function(data)
                        {
                           var html = '<h2><a href="#">'+htmlentities(data.sender_info.name)+"</a> "+_('vous a ecrit : ')+'</h2>'
                                      +'<h4>'+htmlentities(data.subject)+'</h4>'
                                      +'<div class="news-post" id="news-display-msg-content"></div>';

                           $('#news-popup').html(html);
                           $('#news-display-msg-content').html(data.message);
                           $('#news-popup').enhanceWithin();

                           $('#news-popup').popup();
                           $('#news-popup').popup('open');

                           $('#show-user-info').removeClass('has-news');

                        }, function(){});
                     });
                  }
               }
               else if (r[i].type == 1)
               {
                  var shared_sample_id = r[i].target_id;
                  if (!this.displayed_news_shared_sample.includes(shared_sample_id))
                  {
                     $('#show-user-info').addClass('has-news');

                     this.displayed_news_shared_sample.push(shared_sample_id);

                     $( "#news-panel" ).after( "<div id='news-shared-sample-"+shared_sample_id+"' class='news-post' shared-id='"+shared_sample_id+"'>"+htmlentities(r[i].subject)+"</div>" )

                     $("#news-shared-sample-"+shared_sample_id).click(function()
                     {
                        /* Remove alert */
                        $('#show-user-info').removeClass('has-news');

                        /* Display if */
                        var shared_sample_id = parseInt($(this).attr('shared-id'));
                        MusicianCafeGetSharedSample(shared_sample_id, function(sample_info, user_info, message)
                        {
                           var remove = function()
                           {
                              $('#news-shared-sample-'+shared_sample_id).remove();
                           }
                           $("[data-role=panel]").panel("close");
                           historyNavigation.NavigateNoHistory('DisplaySamplePage', 'LoadDisplaySampleScreen', [sample_info, false, true, user_info, message, remove, remove, shared_sample_id]);
                        }, function()
                        {})
                     })
                  }
               }
               else if (r[i].type == 2)
               {
                  var shared_partition_id = r[i].target_id;
                  if (!this.displayed_news_shared_partition.includes(shared_partition_id))
                  {
                     $('#show-user-info').addClass('has-news');

                     this.displayed_news_shared_partition.push(shared_partition_id);

                     $( "#news-panel" ).after( "<div id='news-shared-partition-"+shared_partition_id+"' class='news-post' shared-id='"+shared_partition_id+"'>"+htmlentities(r[i].subject)+"</div>" )

                     $("#news-shared-partition-"+shared_partition_id).click(function()
                     {
                        /* Remove alert */
                        $('#show-user-info').removeClass('has-news');

                        /* Display if */
                        var shared_partition_id = parseInt($(this).attr('shared-id'));
                        MusicianCafeGetSharedPartition(shared_partition_id, function(partition_info, user_info, message)
                        {
                           var remove = function()
                           {
                              $('#news-shared-sample-'+shared_sample_id).remove();
                           }
                           $("[data-role=panel]").panel("close");
                           historyNavigation.NavigateNoHistory('SelectPartitionScrollingPage', 'LoadSelectPartitionScrollingScreen', [partition_info, true, user_info, message, remove, remove, shared_partition_id]);
                        }, function()
                        {})
                     })
                  }
               }
            }
         }
         else
         {
            $('#show-user-info').removeClass('has-news');
         }
      }.bind(this), function(){});
   },

   isLogged: function()
   {
      return this.is_logged;
   },

   getId: function()
   {
      return this.info.id;
   },

   getEMail: function()
   {
      return this.email;
   },

   getPassword: function()
   {
      return this.password;
   },

   getInfo: function()
   {
      return this.info;
   },

   getEMailIsConfirmed: function()
   {
      return this.info.email_confirmed;
   },

   setInfo: function(info)
   {
      this.info = info;
      this.login(this.email, this.password, this.info);
   },

   setEMail: function(email)
   {
      this.email = email;
      this.info.email = email;
      this.login(this.email, this.password, this.info);
   }
};

var LoginPage =
{
   hashPassword: function(p)
   {
      return SHA256('5uf58uBeRyRxhZd8BCXjva08onob77'+'_'+p)
   },

   checkEMail: function()
   {
      historyNavigation.SetPageWithoutNavigation('checkEMail');

      var html = '<p>'+_('Si vous avez recu un email de confirmation, vous pouvez cliquer sur le lien. Ensuite, vous pouvez vous deconnecter du site et vous reconnecter pour que les changements prennent effet.')+'</p>'
                +'<p>'+_('Vous pouvez egalement copier-coller le lien ci-dessous')+'</p>'
                +'<input type="text" name="code-check" id="code-check" value="">'
                +'<button id="do-confirm" class="ui-btn">'+_('Confirmer')+'</button>'
                +'<hr/>'
                +'<p>'+_('Vous pouvez egalement demander un nouveau lien de confirmation en cliquant sur le bouton ci-dessous : ')+'</p>'
                +'<input type="text" name="email" id="email" value="">'
                +'<button id="send-new-confirmation" class="ui-btn">'+_('Envoyer un code de confirmation')+'</button>'
                +'<hr/>'
                +'<button id="cancel-reset-password" class="ui-btn">'+_('Annuler')+'</button>';

      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();

      $('#email').val(logInfo.getEMail());

      $('#cancel-reset-password').click( function()
      {
         mainPage.LoadMainScreen();
      }.bind(this));

      $('#do-confirm').click( function()
      {
         MusicianCafeConfirmEMail($('#code-check').val(), function(user_info)
         {
            alert(_('Votre EMail a correctement ete valide !\nVous avez maintenant acces a toutes les fonctionalites !'));
            logInfo.setInfo(user_info);
            mainPage.LoadMainScreen();
         }.bind(this), function(status)
         {
            if (status == 7)
            {
               alert(_('Le code entre n\'est pas valide !'));
            }
            else
            {
               alert(_('Une erreur est survenue !'));
            }
         }.bind(this));
      }.bind(this));

      $('#send-new-confirmation').click( function()
      {
         var email = $('#email').val()

         /* Check email */
         if (!validateEmail(email))
         {
            alert(_('L\'adresse mail encodee a un format invalide. Veuillez verifier !'));
            return;
         }

         MusicianCafeRequestEMailConfirmation(email, function()
         {
            alert(_('Un EMail de verification vous a ete renvoye !'));

            logInfo.setEMail(email);
            mainPage.LoadMainScreen();
         }.bind(this), function(status)
         {
            if (status == 5)
            {
               alert(_('L\'adresse mail est deja utilisee !'));
            }
            else
            {
               alert(_('Une erreur est survenue !'));
            }
         }.bind(this))
      }.bind(this));
   },

   InitRegister: function(email, password)
   {
      historyNavigation.SetPageWithoutNavigation('Register');

      var html = '<label for="name">'+_("Nom")+'</label>'
                +'<input type="text" name="name" id="name" value="">'
                +'<label for="email">'+_("Adresse Mail")+'</label>'
                +'<input type="text" name="email" id="email" value="">'
                +'<label for="password-1">'+_("Mot de passe")+'</label>'
                +'<input type="password" name="password-1" id="password-1" value="">'
                +'<label for="password-2">'+_("Mot de passe (repeter)")+'</label>'
                +'<input type="password" name="password-2" id="password-2" value="">'
                +'<button id="do-register" class="ui-btn">'+_('S\'enregistrer')+'</button>'
                +'<button id="cancel-reset-password" class="ui-btn">'+_('Annuler')+'</button>'
                +'<p>'+_('Ce site est protégé par reCAPTCHA et Google<br/><a href="https://policies.google.com/privacy">Politique de confidentialité</a> et <a href="https://policies.google.com/terms">Conditions d\'utilisation</a>.')+'</p>'

      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();

      $('#email').val(email)
      $('#password-1').val(password)

      $('#do-register').click( function()
      {
         /* Retrieve fields */
         var email = $('#email').val();
         var password_1 = $('#password-1').val();
         var password_2 = $('#password-2').val();
         var name = $('#name').val();
         var hashed_password = this.hashPassword(password_1);

         /* Check email */
         if (!validateEmail(email))
         {
            alert(_('L\'adresse mail encodee a un format invalide. Veuillez verifier !'));
            return;
         }

         /* Check condition on name */
         if((name.length <= 0) ||
            (!name.match("^[a-zA-Z0-9_-]*$")))
         {
            alert(_('Le nom d\'utilisateur ne peut contenir que des caracteres alpha-numeriques, ou un tiret'));
            return;
         }

         /* Check conditions on password */
         if (password_1.length < 8)
         {
            alert(_('Le mot de passe doit contenir au moins 8 caracteres'));
            return;
         }
         if (password_1 != password_2)
         {
            alert(_('Les mots de passe ne correspondent pas'));
            return;
         }

         /* Retrieve captcha */
         window.onGreCaptchaValidated = function(token)
         {
            grecaptcha.reset();

            MusicianCafeRegister(email, hashed_password, name, token, function(r)
            {
               alert(_('Vous etes correctement enregistre.\nUn email a ete envoye a l\'adresse specifiee.\nVeuillez cliquer sur le lien de confirmation de votre adresse mail pour avoir acces a toutes les fonctions du site.'));

               /* Save login stuff */
               logInfo.login(email, this.hashPassword(password_1), r);

               /* Switch to logged page */
               this.LoginPerformed();

            }.bind(this), function(status)
            {
               if (status == 5)
               {
                  alert(_('L\'adresse mail est deja utilisee !'));
               }
               else if (status == 6)
               {
                  alert(_('Le nom d\'utilisateur est deja utilisee !'));
               }
               else
               {
                  alert(_('Une erreur est survenue !'));
               }
               this.InitLoginScreen($('#email').val());
            }.bind(this));
         }.bind(this);
         grecaptcha.execute();
      }.bind(this));

      $('#cancel-reset-password').click( function()
      {
         this.InitLoginScreen($('#email').val());
      }.bind(this));
   },

   InitResetPassword: function(email)
   {
      historyNavigation.SetPageWithoutNavigation('ResetPassword');

      var html = '<label for="email">'+_("Adresse Mail")+'</label>'
                +'<input type="text" name="email" id="email" value="">'
                +'<button id="do-reset-password" class="ui-btn">'+_('Demander un nouveau mot de passe')+'</button>'
                +'<button id="cancel-reset-password" class="ui-btn">'+_('Annuler')+'</button>'
                +'<p>'+_('Ce site est protégé par reCAPTCHA et Google<br/><a href="https://policies.google.com/privacy">Politique de confidentialité</a> et <a href="https://policies.google.com/terms">Conditions d\'utilisation</a>.')+'</p>'

      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();

      $('#email').val(email)

      $('#do-reset-password').click( function()
      {
         /* Retrieve fields */
         var email = $('#email').val();
         if (!validateEmail(email))
         {
            alert(_('L\'adresse mail encodee a un format invalide. Veuillez verifier !'));
            return;
         }

         window.onGreCaptchaValidated = function(token)
         {
            grecaptcha.reset();

            MusicianCafeResetPassword(email, token, function()
            {
               alert(_('Un email a ete envoye a l\'adresse specifiee. Veuillez verifier vos mails'));
               this.InitLoginScreen($('#email').val());
            }.bind(this), function()
            {
               alert(_('Une erreur est survenue !'));
               this.InitLoginScreen($('#email').val());
            }.bind(this))
         }.bind(this);
         grecaptcha.execute();
      }.bind(this));

      $('#cancel-reset-password').click( function()
      {
         this.InitLoginScreen($('#email').val());
      }.bind(this));
   },

   InitChangePasswordPage: function(email, password)
   {
      historyNavigation.SetPageWithoutNavigation('ChangePassword');

      var html = '<label for="email">'+_("Adresse Mail")+'</label>'
                +'<input type="text" name="email" id="email" value="">'
                +'<label for="password">'+_("Mot de passe actuel")+'</label>'
                +'<input type="password" name="password" id="password" value="">'
                +'<label for="new-password-1">'+_("Nouveau mot de passe")+'</label>'
                +'<input type="password" name="new-password-1" id="new-password-1" value="">'
                +'<label for="new-password-2">'+_("Nouveau mot de passe (repeter)")+'</label>'
                +'<input type="password" name="new-password-2" id="new-password-2" value="">'
                +'<button id="do-change-password" class="ui-btn">'+_('Changer le mot de passe')+'</button>'
                +'<button id="cancel-change-password" class="ui-btn">'+_('Annuler')+'</button>';

      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();

      $('#email').val(email)
      $('#password').val(password)

      $('#do-change-password').click( function()
      {
         /* Retrieve fields */
         var email = $('#email').val();
         var password = $('#password').val();
         var new_password_1 = $('#new-password-1').val();
         var new_password_2 = $('#new-password-2').val();

         /* Check conditions on password */
         if (new_password_1.length < 8)
         {
            alert(_('Le mot de passe doit contenir au moins 8 caracteres')); return;
         }
         if (new_password_1 != new_password_2)
         {
            alert(_('Les mots de passe ne correspondent pas')); return;
         }

         /* Try to change it */
         MusicianCafeChangePassword(email, this.hashPassword(password), this.hashPassword(new_password_1), function(r)
         {
            alert(_('Le mot de passe a correctement ete change'));

            /* Save login stuff */
            logInfo.login(email, this.hashPassword(new_password_1), r);

            /* Switch to logged page */
            this.LoginPerformed();

         }.bind(this), function()
         {
            alert(_('Le nom d\'utilisateur ou le mot de passe est invalide !'));
         })
      }.bind(this));

      $('#cancel-change-password').click( function()
      {
         this.InitLoginScreen($('#email').val());
      }.bind(this));
   },

   InitLoginScreen: function(email)
   {
      historyNavigation.SetPageWithoutNavigation('LoginScreen');

      /* Set title */
      $('#title').text('Accueil')

      /* Set content */
      var html = '<label for="email">'+_("Adresse Mail")+'</label>'
                +'<input type="text" name="email" id="email" value="">'
                +'<label for="password">'+_("Mot de passe")+'</label>'
                +'<input type="password" name="password" id="password" value="">'
                +'<button id="connect" class="ui-btn">'+_('Connexion')+'</button>'
                +'<hr/>'
                +'<button id="change-password" class="ui-btn">'+_('Changer le mot de passe')+'</button>'
                +'<button id="forgot-password" class="ui-btn">'+_('Mot de passe oublie')+'</button>'
                +'<hr/>'
                +'<button id="register" class="ui-btn">'+_('S\'enregistrer')+'</button>';

      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();

      $('#email').val(email)

      /* Set handlers */
      $('#connect').click( function()
      {
         var email_val = $('#email').val();
         var password_val = this.hashPassword($('#password').val());
         MusicianCafeLogin(email_val, password_val, function(r)
         {
            /* Save login stuff */
            logInfo.login(email_val, password_val, r);

            /* Switch to logged page */
            this.LoginPerformed();
         }.bind(this), function()
         {
            alert(_('Le nom d\'utilisateur ou le mot de passe est invalide !'));
         })
      }.bind(this));

      $('#change-password').click( function()
      {
         this.InitChangePasswordPage($('#email').val(), $('#password').val());
      }.bind(this));

      $('#forgot-password').click( function()
      {
         this.InitResetPassword($('#email').val());
      }.bind(this));

      $('#register').click( function()
      {
         this.InitRegister($('#email').val(), $('#password').val());
      }.bind(this));
   },

   LoginPerformed: function()
   {
      /* Update info */
      MusicianCafeGetLoggedUserInfo(function(info)
      {
         /* Update log info */
         logInfo.setInfo(info);

         /* Check if email is confirmed */
         if (!logInfo.getInfo().email_confirmed)
         {
            this.checkEMail();
            return;
         }

         /* Load screen */
         if (false)
         {
            displayScorePage.LoadDisplayScoreScreen({
                                                        "id": 33,
                                                        "name": "essai MXL",
                                                        "has_mxl": false,
                                                        "composer_id": 11,
                                                        "composer_name": "Chopin",
                                                        "piece_id": 172,
                                                        "piece_name": "Essai",
                                                        "album_id": -1,
                                                        "album_name": "",
                                                        "user_id": 12,
                                                        "user_name": "Brice-2",
                                                        "is_own": true,
                                                        "is_favorite": false
                                                      }, '1;2;3;4;5', false);
         }
         else
         {
            mainPage.LoadMainScreen();
         }
      }.bind(this),
      function()
      {
         /* Silently fail, even if it will probably fail later... */
         mainPage.LoadMainScreen();
      }.bind(this));
   },

   LoadLoginScreen: function()
   {
      /* Check if we are already logged */
      if (logInfo.is_logged)
      {
         this.LoginPerformed();
         return;
      }

      /* Init screen */
      this.InitLoginScreen('');
   }
}
