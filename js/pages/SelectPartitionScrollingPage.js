"use strict";

var SelectPartitionScrollingPage =
{
   InitSelectPartitionScrollingScreen: function()
   {
      /* set title */
      if (this.for_share_accept)
      {
         $('#title').text(_('Proposition de partage'));
      }
      else
      {
         $('#title').text(_('Partition'));
      }

      /* Set content */
      var html = ''
      if (!this.for_share_accept)
      {
         html +=
               '<div class="ui-nodisc-icon ui-alt-icon" style="text-align: right">'
              +'     <a id="send-to-member" href="#" data-role="button" data-icon="ui-icon-mail" data-show-label="false" data-inline="true">Share</a>'
              +'    <a id="add-to-favourite" href="#" data-role="button" data-icon="ui-icon-heart" data-show-label="false" data-inline="true">Favorits</a>'
              +'</div>'
      }
      html +=
            '<div style="text-align:center">'
           +'   <h3>'+htmlentities(this.partition_info.composer_name)+(this.partition_info.composer_id>=0?(' <a id="go-to-composer" data-role="button" data-icon="ui-icon-arrow-r" data-show-label="false" data-inline="true">go</a>'):'')+'</h3>'
           +'   <h4>'+htmlentities(this.partition_info.piece_name)+(this.partition_info.composer_id>=0?(' <a id="go-to-piece" data-role="button" data-icon="ui-icon-arrow-r" data-show-label="false" data-inline="true">go</a>'):'')+'</h4>'

      if (this.partition_info.album_id >= 0)
      {
         html += '   <h4>'+htmlentities(this.partition_info.album_name)+' <a id="go-to-album" data-role="button" data-icon="ui-icon-arrow-r" data-show-label="false" data-inline="true">go</a></h4>'
      }
      html += '   <h4>'+htmlentities(this.partition_info.partition_name)+'</h4>'
             +'</div>'

             +'<hr/>'
             +'<h3>'+_('Options de defilement')+'</h3>'

             +'<label for="display-2-pages">'+_('Afficher sur 2 pages')+'</label>'
             +'<input type="checkbox" data-role="flipswitch" name="display-2-pages" id="display-2-pages">'

 	  this.scrollings.forEach(function(k)
	  {
		 html += '<button scrolling_info="'+utoa(JSON.stringify(k))+'" class="ui-btn scrolling-link">'+htmlentities(k.name)+'</button>';
	  }.bind(this));

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

      if (this.partition_info.user_id != logInfo.getId())
      {
         html += '<div style="text-align:right"><p>'+_('Poste par')+' <a href="#">'+htmlentities(this.partition_info.user_name)+'</a></div>';
      }

      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();

      /* Update display */
      if (this.partition_info.is_favorite) $('#add-to-favourite').addClass("toggled-on");
      $('#message_from_sender').html(this.sender_message);

      /* Set handlers */
      $('.scrolling-link').click(function(e)
      {
         var two_pages = $("#display-2-pages").is(":checked");
         var selected_scrolling = JSON.parse(atou($(e.target).attr('scrolling_info')));
         historyNavigation.Navigate('displayScorePage', 'LoadDisplayScoreScreen', [this.partition_info, selected_scrolling.pages, !two_pages]);
      }.bind(this))

      $('#go-to-composer').click(function()
      {
         historyNavigation.Navigate('DisplayComposerDetailsPage', 'LoadDisplayComposerDetailsScreen', [this.partition_info.composer_id, this.partition_info.composer_name]);
      }.bind(this))
      $('#go-to-piece').click(function()
      {
         historyNavigation.Navigate('DisplayPieceDetailsPage', 'LoadDisplayPieceDetailsScreen', [this.partition_info.piece_id, this.partition_info.piece_name, this.partition_info.composer_id, this.partition_info.composer_name, this.partition_info.album_id, this.partition_info.album_name]);
      }.bind(this))
      $('#go-to-album').click(function()
      {
         historyNavigation.Navigate('DisplayComposerDetailsPage', 'LoadDisplayComposerDetailsScreen', [this.partition_info.composer_id, this.partition_info.composer_name, DisplayComposerDetailsPage.display_type.Album, this.partition_info.album_id, this.partition_info.album_name]);
      }.bind(this))

      $( "#add-to-favourite" ).click(function()
      {
         var value = !$("#add-to-favourite").hasClass('toggled-on')
         MusicianCafeChangePartitionIsFavorite(this.partition_info.id, value, function(info)
         {
            this.partition_info = info;
            this.InitSelectPartitionScrollingScreen();
         }.bind(this), function()
         {
            alert(_('Une erreur est survenue !'));
         }.bind(this));
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
                  MusicianCafeSharePartitionWithMember(scope.partition_info.id, member_id, editor.getData(), function()
                  {
                     alert(_('La partition a bien ete envoyee a l\'utilisateur'));
                     $("[data-role=panel]").panel("close");
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
         MusicianCafeSetSharedPartitionAcceptation(this.share_id, true, function()
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
         MusicianCafeSetSharedPartitionAcceptation(this.share_id, false, function()
         {
            this.on_reject_callback();
            historyNavigation.GoBack();
         }.bind(this), function()
         {
            alert(_('Une erreur est survenue !'));
         })
      }.bind(this))

      /* Check if we are owner */
      if (this.partition_info.is_own)
      {
         html =
            '   <div class="ui-block-a" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
           +'      <label for="suppress">'+_('Supprimer')+'</label>'
           +'   </div></div>'
           +'   <div class="ui-block-b" style="height:100%;width:50%"><div class="ui-bar ui-bar-a" style="height:60px">'
           +'      <input type="checkbox" data-role="flipswitch" name="suppress" id="suppress">'
           +'   </div></div>'

         /* Insert html */
         $('#param-info').html(html);
         $('#param-info').enhanceWithin();

         /* Ensure visible */
         $('#show-param-info').show();
      }

      $('#suppress').on( "change", function( event, ui )
      {
         var value = $("#suppress").is(":checked");
         if (value)
         {
            if (confirm(_('Voulez-vous vraiment supprimer la partition ?')))
            {
               MusicianCafeSuppressPartition(this.partition_info.id, function()
               {
                  alert(_('La partition a correctement ete supprimee !'));
                  historyNavigation.GoBack();
               }.bind(this), function()
               {
                  $('#suppress').prop( "checked", false ).flipswitch( "refresh" );
                  alert(_('Une erreur est survenue !'));
               }.bind(this))
            }
            else
            {
               $('#suppress').prop( "checked", false ).flipswitch( "refresh" );
            }
         }
      }.bind(this))

   },

   LoadSelectPartitionScrollingScreen: function(partition_info, for_share_accept, sender_info, sender_message, on_accept_callback, on_reject_callback, share_id)
   {
      /* Retrieve all own samples */
      this.partition_info = partition_info;
      this.scrollings = false;
      this.for_share_accept = (typeof for_share_accept !== 'undefined') ? for_share_accept : false;

      this.sender_info = sender_info;
      this.sender_message = sender_message;
      this.on_accept_callback = on_accept_callback;
      this.on_reject_callback = on_reject_callback;
      this.share_id = share_id;

      MusicianCafeGetPartitionScrollings(this.partition_info.id, function(scrollings)
      {
         this.scrollings = scrollings;
         this.InitSelectPartitionScrollingScreen();
      }.bind(this), function()
      {
         alert('SOAP FAILED')
      })
   }
}
