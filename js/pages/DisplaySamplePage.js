"use strict";

function SelectFromFavouriteUsers(select_callback)
{
   MusicianCafeGetFavoriteMembers(function(members)
   {
      var html = '    <form>'
                +'        <div style="padding:10px 20px;">'
                +'<table data-role="table" data-mode="reflow" class="ui-responsive">'
                +'<thead>'
                +'  <tr>'
                +'    <th>'+_('Nom')+'</th>'
                +'    <th></th>'
                +'  </tr>'
                +'</thead>'
                +'<tbody>';
      members.forEach(function(k)
      {
         html += '  <tr>'
            +'    <td><a href="#" class="member-link" data-role="button" data-icon="navigation" member-id="'+k.id+'">'+htmlentities(k.name)+'</a></td>'
            +'    <td><a href="#" class="suppress-member-link" data-role="button" data-iconpos="notext"  data-icon="delete" member-id="'+k.id+'">'+_('supprimer')+'</a></td>'
              +'  </tr>'
      })

      html += '</tbody>'
             +'</table>'
             +'<button id="add-favorite-user" class="ui-btn ui-corner-all ui-shadow ui-btn-b">'+_("Ajouter")+'</button>'
             +'</div>'
             +'</form>';

      $('#popup').html(html);
      $('#popup').enhanceWithin();

      $('#popup').popup();
      $('#popup').popup('open');

      $('.member-link').click(function()
      {
         var id = parseInt($(this).attr('member-id'));
         select_callback(id);
      });

      $('.suppress-member-link').click(function()
      {
         var id = parseInt($(this).attr('member-id'));
         MusicianCafeChangeMemberIsFavorite(id, false, function()
         {
            SelectFromFavouriteUsers(select_callback);
         }, function()
         {
            alert(_('Une erreur est survenue !'));
         })
      });

      $('#add-favorite-user').click(function()
      {
         /* Request name */
         var name = prompt(_('Veuillez entrer le nom d\'utilisateur du membre a ajouter : '));
         if (name)
         {
            MusicianCafeSearchMember(name, function(info)
            {
               /* Check if we found member */
               if (!info)
               {
                  alert(_('L\'utilisateur n\'a pas ete trouve !'));
                  return
               }

               /* Append it now */
               MusicianCafeChangeMemberIsFavorite(info.id, true, function()
               {
                  SelectFromFavouriteUsers(select_callback);
               }, function()
               {
                  alert(_('Une erreur est survenue !'));
               })
            }, function()
            {
               alert(_('Une erreur est survenue !'));
            })
         }
         return false;
      });
  })
}

var DisplaySamplePage =
{
   for_moderation: false,
   sample_info: false,
   player: false,
   no_sleep: false,
   has_changed_pos: false,

   UpdatePlayPos: function(pos)
   {
      $('#play-pos').val(pos);
      $('#play-pos').slider("refresh");
   },

   RefreshDisplay: function()
   {
      /* set title */
      if (this.for_share_accept)
      {
         $('#title').text(_('Proposition de partage'));
      }
      else
      {
         $('#title').text(_('Enregistrement'));
      }

      /* Check rights we have */
      var is_owner = this.sample_info.user_id == logInfo.getId();

      function help(title, msg, id, closing_tag)
      {
         var closing_tag = (typeof closing_tag === 'undefined') ? 'label' : closing_tag;
         return ' <a href="#'+id+'Info" data-rel="popup" data-transition="pop" data-role="button" data-icon="ui-icon-info" data-show-label="false" data-inline="true" title="'+htmlentities(title)+'">'+_('aide')+'</a></'+closing_tag+'>'
               +'<div data-role="popup" id="'+id+'Info" class="ui-content" data-theme="a" style="max-width:350px;">'
               +'<p>'+msg+'</p>'
               +'</div>';
      }

      /* Set content */
      var html = '';
      if (!(this.for_moderation || this.for_share_accept))
      {

         html += '<div class="ui-nodisc-icon ui-alt-icon" style="text-align: right">';
         if (false && is_owner && (this.sample_info.is_own))
         {
            html += '    <a id="display-on-home" href="#" data-role="button" data-icon="ui-icon-home" data-show-label="false" data-inline="true">Display Main Page</a>';
         }
         html +=
            '     <a id="send-to-member" href="#" data-role="button" data-icon="ui-icon-mail" data-show-label="false" data-inline="true">Share</a>'
            +'    <a id="add-to-favourite" href="#" data-role="button" data-icon="ui-icon-heart" data-show-label="false" data-inline="true">Favorits</a>'
            +'</div>'
      }

      html +=
          '<div style="text-align:center">'
         +'   <h3>'+htmlentities(this.sample_info.composer_name)+(this.sample_info.composer_id>=0?(' <a id="go-to-composer" data-role="button" data-icon="ui-icon-arrow-r" data-show-label="false" data-inline="true">go</a>'):'')+'</h3>'
         +'   <h4>'+htmlentities(this.sample_info.piece_name)+(this.sample_info.composer_id>=0?(' <a id="go-to-piece" data-role="button" data-icon="ui-icon-arrow-r" data-show-label="false" data-inline="true">go</a>'):'')+'</h4>'

      if (this.sample_info.album_id >= 0)
      {
         html += '   <h4>'+htmlentities(this.sample_info.album_name)+' <a id="go-to-album" data-role="button" data-icon="ui-icon-arrow-r" data-show-label="false" data-inline="true">go</a></h4>'
      }
      html +=
          '   <h4>'+htmlentities(this.sample_info.name)+' <a data-role="button" data-icon="ui-icon-arrow-r" data-show-label="false" data-inline="true" style="visibility: hidden; "></a></h4>'
         +'</div>'

      html += '<div class="flex-table">'
           +'<div class="fixed-width">'
           +'   <div class="fixed-line-height">'
           +'      <a id="resume-play" href="#" data-role="button" data-icon="ui-icon-play" data-show-label="false" data-inline="true">Display Main Page</a>'
           +'      <a id="stop-play" href="#" data-role="button" data-icon="ui-icon-pause" data-show-label="false" data-inline="true">Display Main Page</a>'
           +'   </div>'
           +'   <div class="fixed-line-height">'
           +'      <h4 style="text-align: center; height: 60px; width: 100%; vertical-align: middle; display: table-cell;">Vitesse</h4>'
           +'   </div>'
           +'   <div class="fixed-line-height">'
           +'      <h4 style="text-align: center; height: 60px; width: 100%; vertical-align: middle; display: table-cell;">Pitch</h4>'
           +'   </div>'
           +'</div>'

           +'<div class="fixed-width">'
           +'   <div class="fixed-line-height">'
           +'   &nbsp;</div>'
           +'   <div class="fixed-line-height">'
           +'   &nbsp;</div>'
           +'   <div class="fixed-line-height">'
           +'   &nbsp;</div>'
           +'</div>'

           +'<div class="flex-width">'
           +'   <div class="fixed-line-height">'
           +'      <input type="range" name="play-pos" id="play-pos" value="0" min="0" max="'+this.sample_info.duration+'">'
           +'   </div>'
           +'   <div class="fixed-line-height">'
           +'      <input type="range" name="play-speed" id="play-speed" value="100" min="80" max="150" data-highlight="true">'
           +'   </div>'
           +'   <div class="fixed-line-height">'
           +'      <input type="range" name="play-pitch" id="play-pitch" value="0" min="-12" max="12" data-highlight="true">'
           +'   </div>'
           +'</div>'
           +'</div>'


      if (!is_owner)
      {
         html += '<div style="text-align:right"><p>'+_('Poste par')+' <a href="#">'+htmlentities(this.sample_info.user_name)+'</a></div>';
      }

      /* Check for additional info under moderation */
      if (this.for_moderation)
      {
         /* Dispay category */
         html += '<hr/>'
              +'<div style="text-align:center"><h2>'+_('Categorie')+'</h2></div>'
              +'<button id="piece-id" name="piece-id" class="ui-btn">'+_('Veuillez choisir une piece...')+'</button>';

         /* Display moderation message */
         html += '<hr/>'
              +'<div style="text-align:center"><h2>'+_('Message de l\'auteur')+'</h2></div>'
              +'<div id="message_from_author" ></div>'

         /* Display approval/refuse of publication */
         html +=
             '<div class="ui-grid-a">'
            +'   <div class="ui-block-a" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
            +'      <button id="approve-common" name="approve-common" class="ui-btn">'+_('Approuver')+'</button>'
            +'   </div></div>'
            +'   <div class="ui-block-b" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
            +'      <button id="reject-common" name="reject-common" class="ui-btn">'+_('Rejeter')+'</button>'
            +'   </div></div>'
            +'</div>'

         /* Prepare for popup */
         html += '<div data-role="popup" id="popup" data-theme="a" class="ui-corner-all"></div>';

      }
      else if ((!this.for_share_accept) && logInfo.getInfo().site_moderator && this.sample_info.is_approved)
      {
         html += '<hr/>'
                +'<button id="remove-common" name="remove-common" class="ui-btn">'+_('Supprimer des enregistrements communs')+'</button>'
      }

      if (this.for_share_accept)
      {
         html += '<hr/>'
            +'<div style="text-align:center"><h2>'+_('Message')+'</h2></div>'
            +'<div><p>'+_('Propose par')+' <a href="#">'+htmlentities(this.sender_info.name)+'</a></div>'
            +'<div id="message_from_sender" ></div>'

         html +=
            '<div class="ui-grid-a">'
           +'   <div class="ui-block-a" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
           +'      <button id="accept-share" name="accept-share" class="ui-btn">'+_('Accepter')+'</button>'
           +'   </div></div>'
           +'   <div class="ui-block-b" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
           +'      <button id="reject-share" name="reject-share" class="ui-btn">'+_('Refuser')+'</button>'
           +'   </div></div>'
           +'</div>'
      }

      /* Insert html */
      $('#main_page_content').html(html);
      $('#message_from_author').html(this.sample_info.message_to_moderator);
      $('#message_from_sender').html(this.sender_message);
      $('#main_page_content').enhanceWithin();

      /* Set range stuff */
      $('#play-pos').slider('setLabel', function(val)
      {
         var minutes = Math.floor(val/60)
         var seconds = val - (60*minutes);

         if (minutes < 10) minutes = '0'+minutes;
         if (seconds < 10) seconds = '0'+seconds;
         return ''+minutes+':'+seconds;
      });
      $('#play-pos').slider('hideInput');

      $('#play-speed').slider('setLabel', function(val)
      {
         return 'vitesse : '+val+'%';
      });
      $('#play-speed').slider('hideInput');


      $('#play-pitch').slider('setLabel', function(val)
      {
         var prefix = "pitch : ";
         if (val == 0) return prefix+'0';
         else if (val < 0)
         {
            prefix += "-";
            val = -val;
         }
         return prefix+val+' &frac12; ton'+((val>1)?'s':'');
      });
      $('#play-pitch').slider('hideInput');

      /* Check for control panel */
      if ((!this.for_share_accept) && is_owner && (!this.for_moderation))
      {
         html = '<div style="text-align:center"><h2>'+_('Partage')+'</h2></div>'
               +'<div class="ui-grid-a"  data-theme="b">'

         /* Check if we propose to keep in perso repository*/
         if (this.sample_info.is_approved)
         {
            html +=
                '   <div class="ui-block-a" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
               +'      <label for="keep-in-own">'+_('Garder dans l\'espace personnel')+help(_('Garder dans l\'espace personnel'), _('Si vous decochez cette case, l\'entregistrement peut etre definitivement supprime du site si un moderateur le retire des fichiers partages.<br/>En gardant cette case cochee, le fichier restera cependant dans vos quotas d\'utilisation de stockage !'), 'keep-in-own')
               +'   </div></div>'
               +'   <div class="ui-block-b" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
               +'      <input type="checkbox" data-role="flipswitch" name="keep-in-own" id="keep-in-own">'
               +'   </div></div>'
         }

         /* Check if we propose to share */
         if (!this.sample_info.is_approved)
         {
            html +=
               '   <div class="ui-block-a" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
              +'      <label for="propose-share">'+_('Proposer au partage')+help(_('Proposer au partage'), _('Permet de proposer un fichier au partage entre les membres.<br/>La demande sera transmise a un moderateur pour approbation.<br/>Un fichier accepte en partage, et que vous ne gardez pas dans votre espace personnel n\'est plus pris en compte dans vos quotas d\'utilisation de stockage !'), 'propose-share')
              +'   </div></div>'
              +'   <div class="ui-block-b" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
              +'      <input type="checkbox" data-role="flipswitch" name="propose-share" id="propose-share">'
              +'   </div></div>'
         }

         /* Check if we can suppress */
         if ((!this.sample_info.is_common) && (!this.sample_info.is_approved))
         {
            html +=
               '   <div class="ui-block-a" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
              +'      <label for="suppress">'+_('Supprimer')+help(_('Supprimer'), _('Le fichier sera definitivement supprime du site'), 'suppress')
              +'   </div></div>'
              +'   <div class="ui-block-b" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
              +'      <input type="checkbox" data-role="flipswitch" name="suppress" id="suppress">'
              +'   </div></div>'
         }

         html += '</div>';

         /* Check if we can propose to user to change categories */
         if ((!this.sample_info.is_common) && (!this.sample_info.is_approved))
         {
            html += '<hr/>'
                   +'<div style="text-align:center"><h2>'+_('Categorie')+'</h2></div>'
                   +'<button id="piece-id" name="piece-id" class="ui-btn">'+_('Veuillez choisir une piece...')+'</button>';
         }

         html += '<div data-role="popup" id="popup" data-theme="a" class="ui-corner-all"></div>';

         /* Insert html */
         $('#param-info').html(html);
         $('#param-info').enhanceWithin();

         /* Ensure visible */
         $('#show-param-info').show();
      }

      /* Update interface */
      $('#keep-in-own').prop( "checked", this.sample_info.is_own ).flipswitch( "refresh" );
      $('#propose-share').prop( "checked", this.sample_info.is_common ).flipswitch( "refresh" );
      if (this.sample_info.show_on_welcome_page) $('#display-on-home').addClass("toggled-on");
      if (this.sample_info.is_favorite) $('#add-to-favourite').addClass("toggled-on");
      $('#message_from_sender').html(this.sender_message);

      if (this.sample_info.piece_id >= 0)
      {
         $('#piece-id').text(this.sample_info.composer_name+ ': '+this.sample_info.piece_name);
      }

      /* Set handlers */
      $('#go-to-composer').click(function()
      {
         historyNavigation.Navigate('DisplayComposerDetailsPage', 'LoadDisplayComposerDetailsScreen', [this.sample_info.composer_id, this.sample_info.composer_name]);
      }.bind(this))
      $('#go-to-piece').click(function()
      {
         historyNavigation.Navigate('DisplayPieceDetailsPage', 'LoadDisplayPieceDetailsScreen', [this.sample_info.piece_id, this.sample_info.piece_name, this.sample_info.composer_id, this.sample_info.composer_name, this.sample_info.album_id, this.sample_info.album_name]);
      }.bind(this))
      $('#go-to-album').click(function()
      {
         historyNavigation.Navigate('DisplayComposerDetailsPage', 'LoadDisplayComposerDetailsScreen', [this.sample_info.composer_id, this.sample_info.composer_name, DisplayComposerDetailsPage.display_type.Album, this.sample_info.album_id, this.sample_info.album_name]);
      }.bind(this))

      $('#suppress').on( "change", function( event, ui )
      {
         var value = $("#suppress").is(":checked");
         if (value)
         {
            if (confirm(_('Voulez-vous vraiment supprimer votre enregistrement ?')))
            {
               MusicianCafeSuppressSample(this.sample_info.id, function()
               {
                  alert(_('L\'enregistrement a correctement ete supprime !'));
                  historyNavigation.GoBack();
               }.bind(this), function()
               {
                  $('#suppress').prop( "checked", this.sample_info.is_common ).flipswitch( "refresh" );
                  alert(_('Une erreur est survenue !'));
               }.bind(this))
            }
            else
            {
               $('#suppress').prop( "checked", this.sample_info.is_common ).flipswitch( "refresh" );
            }
         }
      }.bind(this))

      $( "#keep-in-own" ).on( "change", function( event, ui )
      {
         var value = $("#keep-in-own").is(":checked");

         MusicianCafeChangeSampleIsOwn(this.sample_info.id, value, function(info)
         {
            this.sample_info = info;
            this.RefreshDisplay();
         }.bind(this), function()
         {
            alert(_('Une erreur est survenue !'));
         }.bind(this));
      }.bind(this));
      $( "#propose-share" ).on( "change", function( event, ui )
      {
         var value = $("#propose-share").is(":checked");
         if (value == this.sample_info.is_common) return;

         var scope = this;
         if (!value)
         {
            MusicianCafeChangeSampleIsCommon(this.sample_info.id, value, '', function(info)
            {
               this.sample_info = info;
               this.RefreshDisplay();
            }.bind(this), function()
            {
               $('#propose-share').prop( "checked", this.sample_info.is_common ).flipswitch( "refresh" );
               alert(_('Une erreur est survenue !'));
            }.bind(this));
         }
         else
         {
            if (!confirm(_('Attention : vous ne pouvez proposer au partage que les enregistrements libres de droits !\nVous devez donc avoir tous les droits sur l\'enregistrement, et actroyer le droit a MusicianCafe de le partager et de le diffuser avec toute la communaute !\nCliquez sur OK si vous souhaitez poursuivre : ')))
            {
               $('#propose-share').prop( "checked", scope.sample_info.is_common ).flipswitch( "refresh" );
               return;
            }

            var html = '<h2>'+_("Veuillez entrer votre message pour le moderateur : ")+'</h2>'
                      +'<div id="editor"></div>'
                      +'<div class="ui-grid-a">'
                      +'   <div class="ui-block-a" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
                      +'      <button id="do-send-to-moderation" class="ui-btn">'+_('Envoyer')+'</button>'
                      +'   </div></div>'
                      +'   <div class="ui-block-b" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
                      +'      <button id="do-cancel-send-to-moderation" class="ui-btn">'+_('Annuler')+'</button>'
                      +'   </div></div>'
                     +'</div>'

            $('#popup').html(html);
            $('#popup').enhanceWithin();

            var editor = false;
            ClassicEditor
              .create( document.querySelector( '#editor' ), {
                  toolbar: [ 'heading', '|', 'bold', 'italic', 'underline' ]
              } )
              .then( e => {
                 editor = e;
                 $('#popup').popup();
                 $('#popup').popup('open');

                 $('#do-send-to-moderation').click(function()
                 {
                    MusicianCafeChangeSampleIsCommon(scope.sample_info.id, true, editor.getData(), function(info)
                    {
                       scope.sample_info = info;
                       scope.RefreshDisplay();
                    }, function()
                    {
                       $('#propose-share').prop( "checked", scope.sample_info.is_common ).flipswitch( "refresh" );
                       alert(_('Une erreur est survenue !'));
                    });
                    $('#popup').popup('close');
                 })
                 $('#do-cancel-send-to-moderation').click(function()
                 {
                    $('#popup').popup('close');
                 })

              } )
              .catch( err => {
                 console.error( err.stack );
              });
         }
      }.bind(this));
      $( "#display-on-home" ).click(function()
      {
         var value = !$("#display-on-home").hasClass('toggled-on')
         MusicianCafeChangeSampleShowOnWelcomePage(this.sample_info.id, value, function(info)
         {
            this.sample_info = info;
            this.RefreshDisplay();
         }.bind(this), function()
         {
            alert(_('Une erreur est survenue !'));
         }.bind(this));
      }.bind(this));
      $( "#add-to-favourite" ).click(function()
      {
         var value = !$("#add-to-favourite").hasClass('toggled-on')
         MusicianCafeChangeSampleIsFavorite(this.sample_info.id, value, function(info)
         {
            this.sample_info = info;
            this.RefreshDisplay();
         }.bind(this), function()
         {
            alert(_('Une erreur est survenue !'));
         }.bind(this));
      }.bind(this));

      ManageComposerPiece(this.sample_info.composer_id, this.sample_info.piece_id, this.sample_info.album_id, this.for_moderation, function(composer_id, composer_name, piece_id, piece_name, album_id, album_name)
      {
         if (this.sample_info.piece_id != piece_id)
         {
            this.sample_info.piece_id = piece_id;
            this.sample_info.piece_name = piece_name;

            MusicianCafeChangeSamplePiece(this.sample_info.id, this.sample_info.piece_id, function(info)
            {
               this.sample_info = info;
               this.RefreshDisplay();
            }.bind(this), function()
            {
               alert(_('Une erreur est survenue !'));
            }.bind(this));
         }
      }.bind(this), function(_callback)
      {
         var callback = _callback;
         MusicianCafeGetSampleInfo(this.sample_info.id, function(sample_info)
         {
            this.LoadDisplaySampleScreen(sample_info, this.for_moderation, this.for_share_accept, this.sender_info, this.sender_message, this.on_accept_callback, this.on_reject_callback, this.share_id);
            callback();
         }.bind(this), function()
         {
            alert(_('Une erreur est survenue !'));
         }.bind(this));
      }.bind(this))

      $('#approve-common').click(function()
      {
         if (this.sample_info.piece_id < 0)
         {
            alert(_('Vous devez d\'abord associer l\'enregistrement a un compositeur et a une piece qui sont publics !'));
            return;
         }
         MusicianCafeGetPieceInfo(this.sample_info.piece_id, function(info)
         {
            if (!info.is_global)
            {
               alert(_('La piece associee au morceau n\'est pas partagee.\nPour continuer, vous devez soit accepter le partage de la piece, soit associer l\'enregistrement a une autre piece !'));
               return;
            }
            if (info.album_id && (info.album_id >= 0) && (!info.album_is_global))
            {
               alert(_('L\'album auquel la piece est associee n\'est pas public !\nVous devez soit rendre cet album public, soit dissocier la piece de cet album !'));
               return;
            }
            if (confirm(_('Seules les pieces libres de droit d\'auteur peuvent etre approuvees.\nAvez-vous bien verifie qu\'il ne s\'agit pas d\'une oeuvre copiee ?')))
            {
               MusicianCafeApproveSampleIsCommon(this.sample_info.id, function(info)
               {
                  historyNavigation.GoBack();
               }.bind(this), function()
               {
                  alert(_('Une erreur est survenue !'));
               }.bind(this));
            }
         }.bind(this), function()
         {
            alert(_('Une erreur est survenue !'));
         }.bind(this))
      }.bind(this));
      $('#reject-common').click(function()
      {
         var html = '<h2>'+_("Veuillez entrer votre message pour l\'auteur de l\'enregistrement : ")+'</h2>'
                   +'<div id="editor"></div>'
                   +'<div class="ui-grid-a">'
                   +'   <div class="ui-block-a" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
                   +'      <button id="do-reject-sample" class="ui-btn">'+_('Rejeter')+'</button>'
                   +'   </div></div>'
                   +'   <div class="ui-block-b" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
                   +'      <button id="do-cancel-reject-sample" class="ui-btn">'+_('Annuler')+'</button>'
                   +'   </div></div>'
                   +'</div>'

         $('#popup').html(html);
         $('#popup').enhanceWithin();

         var scope = this;

         var editor = false;
         ClassicEditor
          .create( document.querySelector( '#editor' ), {
              toolbar: [ 'heading', '|', 'bold', 'italic', 'underline' ]
          } )
          .then( e => {
             editor = e;
             $('#popup').popup();
             $('#popup').popup('open');

             $('#do-reject-sample').click(function()
             {
                MusicianCafeSuppressSampleFromCommon(scope.sample_info.id, editor.getData(), function()
                {
                   historyNavigation.GoBack();
                }, function()
                {
                   alert(_('Une erreur est survenue !'));
                });
                $('#popup').popup('close');
             })
             $('#do-cancel-reject-sample').click(function()
             {
                $('#popup').popup('close');
             })

          })
          .catch( err => {
             console.error( err.stack );
          });
      }.bind(this));
      $('#remove-common').click(function()
      {
         confirm(_('Voulez-vous vraiment supprimer l\'enregistrement commun ?\nNotez que cette operation supprimera l\'enregistrement pour tout le monde !'))
         {
            MusicianCafeSuppressSampleFromCommon(this.sample_info.id, 'Le partage de votre enregistrement "'+this.sample_info.name+'" a &eacute;t&eacute; supprim&eacute; !', function()
            {
               historyNavigation.GoBack();
            }.bind(this), function()
            {
               alert(_('Une erreur est survenue !'));
            }.bind(this));
         }
      }.bind(this));

      $('#play-speed').change(function(e, ui)
      {
         if (this.player)
         {
            this.player.setSpeed(100/parseInt($('#play-speed').val()))
         }
      }.bind(this));

      $('#play-pitch').change(function(e, ui)
      {
         if (this.player)
         {
            this.player.setPitch(parseInt($('#play-pitch').val()))
         }
      }.bind(this));


      $('#send-to-member').click(function()
      {
         SelectFromFavouriteUsers(function(member_id)
         {
            var html = '<h2>'+_("Veuillez entrer votre message : ")+'</h2>'
            +'<div id="editor"></div>'
            +'<div class="ui-grid-a">'
            +'   <div class="ui-block-a" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
            +'      <button id="do-confirm-share" class="ui-btn">'+_('Envoyer')+'</button>'
            +'   </div></div>'
            +'   <div class="ui-block-b" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
            +'      <button id="do-cancel-share" class="ui-btn">'+_('Annuler')+'</button>'
            +'   </div></div>'
            +'</div>'

            $('#popup').html(html);
            $('#popup').enhanceWithin();

            var scope = this;

            var editor = false;
            ClassicEditor
            .create( document.querySelector( '#editor' ), {
                toolbar: [ 'heading', '|', 'bold', 'italic', 'underline' ]
            } )
            .then( e => {
               editor = e;
               $('#popup').popup();
               $('#popup').popup('open');

               $('#do-confirm-share').click(function()
               {
                  MusicianCafeShareSampleWithMember(scope.sample_info.id, member_id, editor.getData(), function()
                  {
                     alert(_('L\'enregistrement a bien ete envoye a l\'utilisateur'));
                     $('#popup').popup('close');
                  }.bind(this), function()
                  {
                     alert(_('Une erreur est survenue !'));
                     $('#popup').popup('close');
                  })
               })
               $('#do-cancel-share').click(function()
               {
                  $('#popup').popup('close');
               })
            })
            .catch( err => {
               console.error( err.stack );
            });
         }.bind(this));
      }.bind(this))

      $('#accept-share').click(function()
      {
         MusicianCafeSetSharedSampleAcceptation(this.share_id, true, function()
         {
            this.on_accept_callback();
            historyNavigation.GoBack();
         }.bind(this), function()
         {
            alert(_('Une erreur est survenue !'));
         })
      }.bind(this))
      $('#reject-share').click(function()
      {
         MusicianCafeSetSharedSampleAcceptation(this.share_id, false, function()
         {
            this.on_reject_callback();
            historyNavigation.GoBack();
         }.bind(this), function()
         {
            alert(_('Une erreur est survenue !'));
         })
      }.bind(this))

      $('#stop-play').click(this.StopPlay.bind(this));

      $('#start-play').click(this.StartPlay.bind(this));

      $('#resume-play').click(this.ResumePlay.bind(this));

      $("#play-pos").change(function()
      {
         this.has_changed_pos = true;
      }.bind(this));
   },

   InitDisplaySampleScreen: function()
   {
      /* Register leaving function */
      historyNavigation.registerOnLeave(function()
      {
         $('#show-param-info').hide();
         $("[data-role=panel]").panel("close");
         if (this.player)
         {
            this.player.cleanup();
            this.player = false;
         }
      }.bind(this));

      this.RefreshDisplay();
   },

   StartPlay: function()
   {
      if (!this.player)
      {
         this.player = new AudioPlayer(this.sample_info.id, function()
         {
            /* We need to wait some time because there may remain space in played buffer */
            setTimeout(function()
            {
               if (this.player)
               {
                  this.player.cleanup();
                  this.player = false;
               }
               this.UpdatePlayPos(0)
               $('#play-pos').slider('enable');
            }.bind(this), 1000)
         }.bind(this), this.UpdatePlayPos.bind(this))
      }

      this.player.setSpeed(100/parseInt($('#play-speed').val()))
      this.player.setPitch(parseInt($('#play-pitch').val()))

      this.player.start(parseInt($('#play-pos').val()));

      $('#play-pos').slider('disable');

      if (!this.no_sleep)
      {
         this.no_sleep = new NoSleep();
      }
      this.no_sleep.enable();
   },

   ResumePlay: function()
   {
      if (this.has_changed_pos)
      {
         if (this.player)
         {
            this.player.cleanup();
            this.player = false;
         }
      }

      if (!this.player)
      {
         this.StartPlay();
      }
      else
      {
         this.player.resume();
         this.no_sleep.enable();

         $('#play-pos').slider('disable');
      }
   },

   StopPlay: function()
   {
      if (this.player)
      {
         this.player.stop();
         this.no_sleep.disable();
      }

      this.has_changed_pos = false;

      $('#play-pos').slider('enable');
   },

   LoadDisplaySampleScreen: function(sample_info, for_moderation, for_share_accept, sender_info, sender_message, on_accept_callback, on_reject_callback, share_id)
   {
      this.for_moderation = (typeof for_moderation !== 'undefined') ? for_moderation : false;
      this.for_share_accept = (typeof for_share_accept !== 'undefined') ? for_share_accept : false;

      this.sample_info = sample_info;

      this.sender_info = sender_info;
      this.sender_message = sender_message;
      this.on_accept_callback = on_accept_callback;
      this.on_reject_callback = on_reject_callback;
      this.share_id = share_id;

      this.InitDisplaySampleScreen();
   }
}
