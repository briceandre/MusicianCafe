"use strict";

var SelectByComposer =
{
   composers: false,

   InitSelectByComposerScreen: function()
   {
      /* set title */
      $('#title').text(_('Compositeurs'));

      /* Set content */
      var can_edit = logInfo.getInfo().site_moderator;
      if (!can_edit)
      {
         this.composers.forEach(function(k)
         {
            if (!k.is_global)
            {
               can_edit = true;
            }
         });
      }

      var standalone_button_width = 100;
      if (can_edit)
      {
         standalone_button_width = 80;
      }

      var html = '';
      this.composers.forEach(function(k)
      {
         html += '<div class="flex-table">'
            +'  <div class="flex-width">'
            +'    <a href="#" class="composer-link" data-role="button" composer_id="'+k.id+'" composer_name="'+btoa(k.name)+'">'+htmlentities(k.name)+'</a>'
            +'  </div>'
            +'  <div class="fixed-width">'
         if (logInfo.getInfo().site_moderator || !k.is_global)
         {
            html += '<a href="#" class="edit-composer-link" data-role="button" data-icon="ui-icon-edit" composer_id="'+k.id+'" composer_name="'+btoa(k.name)+'" is_global="'+(k.is_global?1:0)+'"></a>';
         }
         html +='  </div>'
                +'</div>'
      }.bind(this));

      html += '<hr/>'
           +'<button id="add-composer" class="ui-btn">'+_('Ajouter un compositeur')+'</button>'
           +'<div data-role="popup" id="popup" data-theme="a" class="ui-corner-all"></div>';

      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();

      /* Set handlers */
      var scope = this;
      $('.edit-composer-link').click(function(e)
      {
         var composer_id = parseInt($(this).attr('composer_id'));
         var composer_name = atob($(this).attr('composer_name'));
         var is_global = parseInt($(this).attr('is_global')) > 0;

         var can_have_accept = false;
         var can_have_merge = false;
         var can_rename = false;
         if (!is_global)
         {
            if (logInfo.getInfo().site_moderator)
            {
               can_have_accept = true;
               can_have_merge = true;
               can_rename = true;
            }
            else
            {
               can_have_merge = true;
               can_rename = true;
            }
         }
         else
         {
            if (logInfo.getInfo().site_moderator)
            {
               can_have_merge = true;
               can_rename = true;
            }
         }

         var html = '<h1>'+htmlentities(composer_name)+'</h1>';
         if (can_rename)
         {
            html += '<label for="new-composer-name-id">'+_('Veuillez entrer le nouveau nom du compositeur :')+'</label>'
                   +'<input type="text" name="new-composer-name-id" id="new-composer-name-id" value="'+htmlentities(composer_name)+'">'
                   +'<button id="validate-new-composer-name" class="ui-btn">'+_('Renommer')+'</button>'
         }
         if (can_have_merge)
         {
            html += '<hr/>'
                   +'<button id="merge-composer" class="ui-btn">'+_('Fusionner')+'</button>'
         }
         if (can_have_accept)
         {
            html += '<hr/>'
                   +'<button id="accept-composer" class="ui-btn">'+_('Rendre golbal')+'</button>'
         }
         html += '<hr/>'
                +'<button id="cancel-edit-composer" class="ui-btn">'+_('Retour')+'</button>'

         $('#popup').html(html);
         $('#popup').enhanceWithin();

         $('#popup').popup();
         $('#popup').popup('open');

         $('#validate-new-composer-name').click(function()
         {
            var new_name = $('#new-composer-name-id').val();
            if (is_global)
            {
               if (!confirm(_('Le compositeur est global pour tous les membres du site !\nVoulez-vous vraiment changer son nom ?')))
               {
                  return;
               }
            }

            MusicianCafeRenameComposer(composer_id, new_name, function()
            {
               $('#popup').popup('close');
               this.LoadSelectByComposerScreen();
            }.bind(this), function()
            {
               alert(_('Une erreur est survenue !'));
            })
         }.bind(scope))

         $('#merge-composer').click(function()
         {
            /* Format popup html */
            var html = '<h1>'+_('Fusion de compositeurs')+'</h1>'
                      +'<p>'+_('Veuillez selectionner le compositeur avec lequel effectuer la fusion du compositeur ')+htmlentities(composer_name)+' : '+'</p>'
            this.composers.forEach(function(k)
            {
               if ((k.id != composer_id) &&
                   ((!is_global) || (k.is_global)))
               {
                  html += '<button composer_id="'+k.id+'" composer_name="'+btoa(k.name)+'" class="ui-btn new-composer-link">'+htmlentities(k.name)+'</button>';
               }
            }.bind(this));
            html += '<hr/><button id="cancel-change-composer" class="ui-btn">'+_('Annuler')+'</button>'

            $('#popup').html(html);
            $('#popup').enhanceWithin();

            $('#popup').popup();
            $('#popup').popup('open');

            $('.new-composer-link').click(function()
            {
               var to_composer = parseInt($(this).attr('composer_id'));
               MusicianCafeMergeComposers(composer_id, to_composer, function()
               {
                  $('#popup').popup('close');
                  this.LoadSelectByComposerScreen();
               }.bind(scope), function()
               {
                  alert(_('Une erreur est survenue !'));
               })
            })

            $('#cancel-change-composer').click(function()
            {
               $('#popup').popup('close');
            }.bind(scope))
         }.bind(scope))


         $('#accept-composer').click(function()
         {
            if (confirm(_('Voulez vous vraiment confirmer le compositeur ')+composer_name+' ?\n'+_('Notez que cette operation s\'appliquera pour tous les utilisateurs du site !')))
            {
               MusicianCafeValidateComposer(composer_id, function()
               {
                  $('#popup').popup('close');
                  this.LoadSelectByComposerScreen();
               }.bind(scope), function()
               {
                  alert(_('Une erreur est survenue !'));
               })
            }
         }.bind(scope))

         $('#cancel-edit-composer').click(function()
         {
            $('#popup').popup('close');
         })
      });

      $('.composer-link').click(function(e)
      {
         historyNavigation.Navigate('DisplayComposerDetailsPage', 'LoadDisplayComposerDetailsScreen', [parseInt($(e.target).attr('composer_id')), atob($(e.target).attr('composer_name'))]);
      }.bind(this))

      $('#add-composer').click(function(e)
      {
         var name = prompt(_('Veuilez entrer le nom du compositeur : '));
         if (name)
         {
            MusicianCafeAddComposer(name, function(composer_info)
            {
               historyNavigation.Navigate('DisplayComposerDetailsPage', 'LoadDisplayComposerDetailsScreen', [composer_info.id, composer_info.name]);
            }.bind(this), function(status)
            {
               if (status == 11)
               {
                  alert(_("Vous n'etes pas autorise a realiser cette operation !"));
               }
               else if (status == 3)
               {
                  alert(_("Le compositeur existe deja !"));
               }
               else
               {
                  alert(_('Une erreur est survenue !'));
               }
            }.bind(this))
         }
      }.bind(this))
   },

   LoadSelectByComposerScreen: function()
   {
      /* Retrieve all own samples */
      this.composers = false;
      MusicianCafeGetComposers(function(composers)
      {
         this.composers = composers;
         this.InitSelectByComposerScreen();
      }.bind(this), function()
      {
         alert('SOAP FAILED')
      })
   }
}
