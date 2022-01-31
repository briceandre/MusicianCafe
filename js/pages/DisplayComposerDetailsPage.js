"use strict";

var DisplayComposerDetailsPage =
{
    pieces: false,

   InitDisplayComposerDetailsScreen: function()
   {
      if (this.type == this.display_type.Album)
      {
         $('#title').text(_('Album : ')+this.album_name);
      }
      else
      {
         $('#title').text(_('Compositeur : ')+this.composer_name);
      }

      /* Set content */
      var can_edit = logInfo.getInfo().site_moderator;
      if (!can_edit)
      {
         this.pieces.forEach(function(k)
         {
            if (!k.is_global)
            {
               can_edit = true;
            }
         });
         this.albums.forEach(function(k)
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

      var html = '<div data-role="collapsible-set" data-theme="c" data-content-theme="d">';
      if (this.pieces.length > 0)
      {
         html += '<div data-role="collapsible" data-collapsed="false" data-collapsed-icon="file-o" data-expanded-icon="file-o"><h3>'+_('Morceaux')+'</h3>';
         this.pieces.forEach(function(k)
         {
            html += '<div class="flex-table">'
                   +'  <div class="flex-width">'
                   +'    <a href="#" class="piece-link" data-role="button" piece_id="'+k.id+'" piece_name="'+btoa(k.name)+'" composer_name="'+btoa(k.composer_name)+'" >'+htmlentities(k.name)+'</a>'
                   +'  </div>'
                   +'  <div class="fixed-width">'
            if (logInfo.getInfo().site_moderator || !k.is_global)
            {
               html += '<a href="#" class="edit-piece-link" data-role="button" data-icon="ui-icon-edit" piece_id="'+k.id+'" piece_name="'+btoa(k.name)+'" composer_name="'+btoa(k.composer_name)+'" is_global="'+(k.is_global?1:0)+'"></a>';
            }
            html +='  </div>'
                   +'</div>'
         }.bind(this));
         html += '</div>';
      }
      if (this.albums.length > 0)
      {
         html += '<div data-role="collapsible" data-collapsed="false" data-collapsed-icon="files-o" data-expanded-icon="files-o"><h3>'+_('Albums')+'</h3>';
         this.albums.forEach(function(k)
         {
            html += '<div class="flex-table">'
               +'  <div class="flex-width">'
               +'    <a href="#" class="album-link" data-role="button" album_id="'+k.id+'" album_name="'+btoa(k.name)+'" composer_name="'+btoa(k.composer_name)+'">'+htmlentities(k.name)+'</a>'
               +'  </div>'
               +'  <div class="fixed-width">'
            if (logInfo.getInfo().site_moderator || !k.is_global)
            {
               html += '<a href="#" class="edit-album-link" data-role="button" data-icon="ui-icon-edit" album_id="'+k.id+'" album_name="'+btoa(k.name)+'" composer_name="'+btoa(k.composer_name)+'" is_global="'+(k.is_global?1:0)+'"></a>';
            }
            html +='  </div>'
                   +'</div>'
         }.bind(this));
         html += '</div>';
      }


      html += '<div data-role="collapsible" data-collapsed="false" data-collapsed-icon="gear" data-expanded-icon="gear"><h3>'+_('Edition')+'</h3>';
      html += '<button id="add-piece" class="ui-btn">'+(_('Ajouter un morceau'))+'</button>'
      if (this.type == this.display_type.Normal)
      {
         html += '<button id="add-album" class="ui-btn">'+(_('Ajouter un album'))+'</button>'
      }
      html += '</div>';

      html += '</div>';

      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();

      var scope = this;
      $('.edit-piece-link').click(function(e)
      {
         var piece_id = parseInt($(this).attr('piece_id'));
         var piece_name = atob($(this).attr('piece_name'));
         var composer_name = atob($(this).attr('composer_name'));
         var is_global = parseInt($(this).attr('is_global')) > 0;

         var can_have_accept = false;
         var can_have_merge = false;
         var can_rename = false;
         var can_change_album = false;
         if (!is_global)
         {
            if (logInfo.getInfo().site_moderator)
            {
               can_have_accept = true;
               can_have_merge = true;
               can_rename = true;
               can_change_album = true;
            }
            else
            {
               can_have_merge = true;
               can_rename = true;
               can_change_album = true;
            }
         }
         else
         {
            if (logInfo.getInfo().site_moderator)
            {
               can_have_merge = true;
               can_rename = true;
               can_change_album = true;
            }
         }

         var html = '<h1>'+htmlentities(piece_name)+'</h1>';
         if (can_rename)
         {
            html += '<label for="new-piece-name-id">'+_('Veuillez entrer le nouveau nom du morceau :')+'</label>'
                   +'<input type="text" name="new-piece-name-id" id="new-piece-name-id" value="'+htmlentities(piece_name)+'">'
                   +'<button id="validate-new-piece-name" class="ui-btn">'+_('Renommer')+'</button>'
         }
         if (can_have_merge)
         {
            html += '<hr/>'
                   +'<button id="merge-piece" class="ui-btn">'+_('Fusionner')+'</button>'
         }
         if (can_have_accept)
         {
            html += '<hr/>'
                   +'<button id="accept-piece" class="ui-btn">'+_('Rendre global')+'</button>'
         }
         if (can_change_album)
         {
            html += '<hr/>'
                   +'<button id="change-album" class="ui-btn">'+_('Changer l\'album')+'</button>'
         }
         html += '<hr/>'
                +'<button id="cancel-edit-piece" class="ui-btn">'+_('Retour')+'</button>'

         $('#popup').html(html);
         $('#popup').enhanceWithin();

         $('#popup').popup();
         $('#popup').popup('open');

         $('#validate-new-piece-name').click(function()
         {
            var new_name = $('#new-piece-name-id').val();
            if (is_global)
            {
               if (!confirm(_('Le morceau est global pour tous les membres du site !\nVoulez-vous vraiment changer son nom ?')))
               {
                  return;
               }
            }

            MusicianCafeRenamePiece(piece_id, new_name, function()
            {
               $('#popup').popup('close');
               this.LoadDisplayComposerDetailsScreen(this.composer_id, this.composer_name, this.type, this.album_id, this.album_name);
            }.bind(this), function(status)
            {
               alert(_('Une erreur est survenue !'));
            })
         }.bind(scope))

         $('#merge-piece').click(function()
         {
            /* Format popup html */
            var html = '<h1>'+_('Fusion de pieces')+'</h1>'
                      +'<p>'+_('Veuillez selectionner le morceau avec lequel effectuer la fusion ')+htmlentities(piece_name)+' : '+'</p>'
            this.pieces.forEach(function(k)
            {
               if ((k.id != piece_id) &&
                   ((!is_global) || (k.is_global)))
               {
                  html += '<button piece_id="'+k.id+'"  class="ui-btn new-piece-link">'+htmlentities(k.name)+'</button>';
               }
            }.bind(this));
            html += '<hr/><button id="cancel-change-piece" class="ui-btn">'+_('Annuler')+'</button>'

            $('#popup').html(html);
            $('#popup').enhanceWithin();

            $('#popup').popup();
            $('#popup').popup('open');

            $('.new-piece-link').click(function()
            {
               var to_piece = parseInt($(this).attr('piece_id'));
               MusicianCafeMergePieces(piece_id, to_piece, function()
               {
                  $('#popup').popup('close');
                  this.LoadDisplayComposerDetailsScreen(this.composer_id, this.composer_name, this.type, this.album_id, this.album_name);
               }.bind(scope), function()
               {
                  alert(_('Une erreur est survenue !'));
               })
            })

            $('#cancel-change-piece').click(function()
            {
               $('#popup').popup('close');
            }.bind(scope))
         }.bind(scope))


         $('#accept-piece').click(function()
         {
            if (confirm(_('Voulez vous vraiment confirmer le morceau ')+piece_name+' ?\n'+_('Notez que cette operation s\'appliquera pour tous les utilisateurs du site !')))
            {
               MusicianCafeValidatePiece(piece_id, function()
               {
                  $('#popup').popup('close');
                  this.LoadDisplayComposerDetailsScreen(this.composer_id, this.composer_name, this.type, this.album_id, this.album_name);
               }.bind(scope), function()
               {
                  alert(_('Une erreur est survenue !'));
               })
            }
         }.bind(scope))

         $('#change-album').click(function()
         {
            /* Retrieve all possible albums of composer */
            MusicianCafeGetAlbumsByComposer(this.composer_id, function(albums)
            {
               /* Format popup html */
               var html = '<h1>'+_('Selection du nouvel album')+'</h1>'
                         +'<p>'+_('Veuillez selectionner l\'album auquel associer le morceau ')+htmlentities(piece_name)+' : '+'</p>'
               this.albums.forEach(function(k)
               {
                  if ((k.id != this.album_id) &&
                      ((!is_global) || (k.is_global)))
                  {
                     html += '<button album_id="'+k.id+'"  class="ui-btn change-album-link">'+htmlentities(k.name)+'</button>';
                  }
               }.bind(this));
               html += '<hr/><button id="dissociate-from-album" class="ui-btn">'+_('Dissocier de l\'abum courant')+'</button>'
               html += '<hr/><button id="cancel-change-album" class="ui-btn">'+_('Annuler')+'</button>'

               $('#popup').html(html);
               $('#popup').enhanceWithin();

               $('#popup').popup();
               $('#popup').popup('open');

               $('.change-album-link').click(function()
               {
                  var to_album = parseInt($(this).attr('album_id'));

                  MusicianCafeChangePieceAlbum(piece_id, to_album, function()
                  {
                     $('#popup').popup('close');
                     this.LoadDisplayComposerDetailsScreen(this.composer_id, this.composer_name, this.type, this.album_id, this.album_name);
                  }.bind(scope), function()
                  {
                     alert(_('Une erreur est survenue !'));
                  })
               })

               $('#dissociate-from-album').click(function()
               {
                  MusicianCafeChangePieceAlbum(piece_id, -1, function()
                  {
                     $('#popup').popup('close');
                     this.LoadDisplayComposerDetailsScreen(this.composer_id, this.composer_name, this.type, this.album_id, this.album_name);
                  }.bind(scope), function()
                  {
                     alert(_('Une erreur est survenue !'));
                  })
               })

               $('#cancel-change-album').click(function()
               {
                  $('#popup').popup('close');
               }.bind(scope))

            }.bind(this), function()
            {
               alert(_('Une erreur est survenue !'));
            })
         }.bind(scope))

         $('#cancel-edit-piece').click(function()
         {
            $('#popup').popup('close');
         })
      });

      $('.edit-album-link').click(function(e)
      {
         var album_id = parseInt($(this).attr('album_id'));
         var album_name = atob($(this).attr('album_name'));
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

         var html = '<h1>'+htmlentities(album_name)+'</h1>';
         if (can_rename)
         {
            html += '<label for="new-album-name-id">'+_('Veuillez entrer le nouveau nom de l\'album :')+'</label>'
                   +'<input type="text" name="new-album-name-id" id="new-album-name-id" value="'+htmlentities(album_name)+'">'
                   +'<button id="validate-new-album-name" class="ui-btn">'+_('Renommer')+'</button>'
         }
         if (can_have_merge)
         {
            html += '<hr/>'
                   +'<button id="merge-album" class="ui-btn">'+_('Fusionner')+'</button>'
         }
         if (can_have_accept)
         {
            html += '<hr/>'
                   +'<button id="accept-album" class="ui-btn">'+_('Rendre golbal')+'</button>'
         }
         html += '<hr/>'
                +'<button id="cancel-edit-album" class="ui-btn">'+_('Retour')+'</button>'

         $('#popup').html(html);
         $('#popup').enhanceWithin();

         $('#popup').popup();
         $('#popup').popup('open');

         $('#validate-new-album-name').click(function()
         {
            var new_name = $('#new-album-name-id').val();
            if (is_global)
            {
               if (!confirm(_('L\'album est global pour tous les membres du site !\nVoulez-vous vraiment changer son nom ?')))
               {
                  return;
               }
            }

            MusicianCafeRenameAlbum(album_id, new_name, function()
            {
               $('#popup').popup('close');
               this.LoadDisplayComposerDetailsScreen(this.composer_id, this.composer_name, this.type, this.album_id, this.album_name);
            }.bind(this), function(status)
            {
               alert(_('Une erreur est survenue !'));
            })
         }.bind(scope))

         $('#merge-album').click(function()
         {
            /* Format popup html */
            var html = '<h1>'+_('Fusion d\'albums')+'</h1>'
                      +'<p>'+_('Veuillez selectionner l\'album avec lequel effectuer la fusion de l\'album ')+htmlentities(album_name)+' : '+'</p>'
            this.albums.forEach(function(k)
            {
               if ((k.id != album_id) &&
                   ((!is_global) || (k.is_global)))
               {
                  html += '<button album_id="'+k.id+'"  class="ui-btn new-album-link">'+htmlentities(k.name)+'</button>';
               }
            }.bind(this));
            html += '<hr/><button id="cancel-change-album" class="ui-btn">'+_('Annuler')+'</button>'

            $('#popup').html(html);
            $('#popup').enhanceWithin();

            $('#popup').popup();
            $('#popup').popup('open');

            $('.new-album-link').click(function()
            {
               var to_album = parseInt($(this).attr('album_id'));
               MusicianCafeMergeAlbums(album_id, to_album, function()
               {
                  $('#popup').popup('close');
                  this.LoadDisplayComposerDetailsScreen(this.composer_id, this.composer_name, this.type, this.album_id, this.album_name);
               }.bind(scope), function()
               {
                  alert(_('Une erreur est survenue !'));
               })
            })

            $('#cancel-change-album').click(function()
            {
               $('#popup').popup('close');
            }.bind(scope))
         }.bind(scope))


         $('#accept-album').click(function()
         {
            if (confirm(_('Voulez vous vraiment confirmer l\'album ')+album_name+' ?\n'+_('Notez que cette operation s\'appliquera pour tous les utilisateurs du site !')))
            {
               MusicianCafeValidateAlbum(album_id, function()
               {
                  $('#popup').popup('close');
                  this.LoadDisplayComposerDetailsScreen(this.composer_id, this.composer_name, this.type, this.album_id, this.album_name);
               }.bind(scope), function()
               {
                  alert(_('Une erreur est survenue !'));
               })
            }
         }.bind(scope))

         $('#cancel-edit-album').click(function()
         {
            $('#popup').popup('close');
         })
      });

      $('.piece-link').click(function(e)
     {
        historyNavigation.Navigate('DisplayPieceDetailsPage', 'LoadDisplayPieceDetailsScreen', [parseInt($(e.target).attr('piece_id')), atob($(e.target).attr('piece_name')), this.composer_id, atob($(e.target).attr('composer_name')), this.album_id, this.album_name]);
     }.bind(this))

      $('.album-link').click(function(e)
      {
         var album_id = parseInt($(e.target).attr('album_id'));
         var album_name = atob($(e.target).attr('album_name'));

         historyNavigation.Navigate('DisplayComposerDetailsPage', 'LoadDisplayComposerDetailsScreen', [this.composer_id, this.composer_name, this.display_type.Album, album_id, album_name]);
      }.bind(this))

      $('#add-piece').click(function()
      {
         var name = prompt(_('Veuillez entrer le nom du morceau : '));
         if (name)
         {
            MusicianCafeAddPiece(name, this.composer_id, function(piece_info)
            {
               if (this.album_id >= 0)
               {
                  MusicianCafeChangePieceAlbum(piece_info.id, this.album_id, function()
                  {
                     historyNavigation.Navigate('DisplayPieceDetailsPage', 'LoadDisplayPieceDetailsScreen', [piece_info.id, piece_info.name, this.composer_id, piece_info.composer_name, this.album_id, this.album_name]);
                  }.bind(this), function()
                  {
                     alert(_('Une erreur est survenue !'));
                  }.bind(this))
               }
               else
               {
                  historyNavigation.Navigate('DisplayPieceDetailsPage', 'LoadDisplayPieceDetailsScreen', [piece_info.id, piece_info.name, this.composer_id, piece_info.composer_name, this.album_id, this.album_name]);
               }
            }.bind(this), function(status)
            {
               if (status == 11)
               {
                  alert(_("Vous n'etes pas autorise a realiser cette operation !"));
               }
               else if (status == 3)
               {
                  alert(_("Le morceau existe deja !"));
               }
               else
               {
                  alert(_('Une erreur est survenue !'));
               }
            })
         }
      }.bind(this))

      $('#add-album').click(function()
      {
         var name = prompt(_('Veuillez entrer le nom de l\'album : '));
         if (name)
         {
            MusicianCafeAddAlbum(name, this.composer_id, function(album_info)
            {
               historyNavigation.Navigate('DisplayComposerDetailsPage', 'LoadDisplayComposerDetailsScreen', [this.composer_id, this.composer_name, this.display_type.Album, album_info.id, album_info.name]);
            }.bind(this), function(status)
            {
               if (status == 11)
               {
                  alert(_("Vous n'etes pas autorise a realiser cette operation !"));
               }
               else if (status == 3)
               {
                  alert(_("L'album existe deja !"));
               }
               else
               {
                  alert(_('Une erreur est survenue !'));
               }
            })
         }
      }.bind(this))
   },

   display_type: Object.freeze({"Normal":1, "Album": 2}),

   LoadDisplayComposerDetailsScreen: function(composer_id, composer_name, type, album_id, album_name)
   {
      this.composer_id = composer_id;
      this.composer_name = composer_name;
      this.type = (typeof type !== 'undefined') ? type : this.display_type.Normal;
      this.album_id = (typeof album_id !== 'undefined') ? album_id : -1;
      this.album_name = album_name;
      this.pieces = false;
      this.albums = false;

      if (type == this.display_type.Album)
      {
         MusicianCafeGetPiecesByAlbum(this.album_id, function(pieces)
         {
            this.pieces = pieces;
            this.albums = [];
            this.InitDisplayComposerDetailsScreen();
         }.bind(this), function()
         {
            alert('SOAP FAILED')
         })
      }
      else
      {
         MusicianCafeGetPiecesAndAlbumsByComposer(this.composer_id, function(pieces, albums)
         {
            this.pieces = pieces;
            this.albums = albums;
            this.InitDisplayComposerDetailsScreen();
         }.bind(this), function()
         {
            alert('SOAP FAILED')
         })
      }
   }
}
