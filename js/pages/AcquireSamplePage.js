"use strict";

function ManageComposerPiece(_composer_id, _piece_id, _album_id, _for_moderation, _onPieceChange, _onRefresh)
{
   var original_piece = _piece_id;

   var composer_id = _composer_id;
   var composer_name = false;
   var composer_is_global = false;
   var piece_id = _piece_id;
   var piece_name = false;
   var piece_is_global = false;
   var album_id = _album_id;
   var album_name = false;
   var album_is_global = false;
   var for_moderation = _for_moderation;
   var onPieceChange = _onPieceChange;
   var onRefresh = _onRefresh;

   function InitSelection()
   {
      function OnHasData()
      {
         var html = '<h1>'+_('Compositeur :')+'</h1>'
         if (((!composer_is_global) || logInfo.getInfo().site_moderator) && (!for_moderation))
         {
            html += '<input type="text" name="change-composer-name-id" id="change-composer-name-id" value="'+htmlentities(composer_name)+'">'
                    +'<button id="validate-new-composer-name" class="ui-btn">'+_('Renommer')+'</button>'
         }
         else
         {
            html += '<input type="text" value="'+htmlentities(composer_name)+'" style="pointer-events: none;">'
         }
         if ((!composer_is_global) && for_moderation)
         {
            html += '<button id="mutualise-composer" class="ui-btn">'+_('Rendre public')+'</button>'
         }
         html += '<button id="change-composer" class="ui-btn">'+_('Selectionner un autre compositeur')+'</button>'

         if (album_id && (album_id >= 0))
         {
            html += '<h1>'+_('Album')+'</h1>'
            if (((!album_is_global) || logInfo.getInfo().site_moderator) && (!for_moderation))
            {
               html += '<input type="text" name="change-album-name-id" id="change-album-name-id" value="'+htmlentities(album_name)+'">'
                      +'<button id="validate-new-album-name" class="ui-btn">'+_('Renommer')+'</button>'
            }
            else
            {
               html += '<input type="text" value="'+htmlentities(album_name)+'" style="pointer-events: none;">'
            }
            if (composer_is_global && (!album_is_global) && for_moderation)
            {
               html += '<button id="mutualise-album" class="ui-btn">'+_('Rendre public')+'</button>'
            }
         }

         if (piece_id)
         {
            html += '<h1>'+_('Piece')+'</h1>'
            if (((!piece_is_global) || logInfo.getInfo().site_moderator) && (!for_moderation))
            {
               html += '<input type="text" name="change-piece-name-id" id="change-piece-name-id" value="'+htmlentities(piece_name)+'">'
                      +'<button id="validate-new-piece-name" class="ui-btn">'+_('Renommer')+'</button>'
            }
            else
            {
               html += '<input type="text" value="'+htmlentities(piece_name)+'" style="pointer-events: none;">'
            }
            if (composer_is_global && (!piece_is_global) && for_moderation)
            {
               html += '<button id="mutualise-piece" class="ui-btn">'+_('Rendre public')+'</button>'
            }

            if ((!for_moderation) || composer_is_global)
            {
               html += '<button id="change-piece" class="ui-btn">'+_('Selectionner une autre piece')+'</button>'
            }

            html += "<hr/>";
            if ((!for_moderation) || (composer_is_global && piece_is_global))
            {
               html += '<button id="validate-change-piece" class="ui-btn">'+_('Valider le changement')+'</button>'
            }
            html += '<button id="cancel-change-piece" class="ui-btn">'+_('Annuler le changement')+'</button>'
         }
         else
         {
            if ((!for_moderation) || composer_is_global)
            {
               html += '<h1>'+_('Piece')+'</h1>'
               html += '<button id="change-piece" class="ui-btn">'+_('Selectionner une piece')+'</button>'
            }
         }

         $('#popup').html(html);
         $('#popup').enhanceWithin();

         $('#popup').popup();
         $('#popup').popup('open');

         $('#validate-change-piece').click(function()
         {
            if (original_piece != piece_id)
            {
               onPieceChange(composer_id, composer_name, piece_id, piece_name, album_id, album_name);
            }
            $('#popup').popup('close');
         })
         $('#cancel-change-piece').click(function()
         {
            $('#popup').popup('close');
         })

         $('#validate-new-composer-name').click(function()
         {
            console.log('Will change name 1')
            var new_name = $('#change-composer-name-id').val();
            if (composer_is_global && (!for_moderation))
            {
               if (!confirm(_('Le compositeur est global pour tous les membres du site !\nVoulez-vous vraiment changer son nom ?')))
               {
                  return;
               }
            }
            console.log('Will change name 2 : '+new_name)

            MusicianCafeRenameComposer(composer_id, new_name, function()
            {
               console.log('Will change name 3 : OK')
               $('#popup').popup('close');
               onRefresh(InitSelection);
            }.bind(this), function()
            {
               alert(_('Une erreur est survenue !'));
            })
         })

         $('#mutualise-composer').click(function()
         {
            if (confirm(_('Voulez vous vraiment confirmer le compositeur ')+composer_name+' ?\n'+_('Notez que cette operation s\'appliquera pour tous les utilisateurs du site !')))
            {
               MusicianCafeValidateComposer(composer_id, function()
               {
                  $('#popup').popup('close');
                  onRefresh(InitSelection);
               }, function()
               {
                  alert(_('Une erreur est survenue !'));
               })
            }
         })

         $('#change-composer').click(function()
         {
            MusicianCafeGetComposers(function(composers)
            {
               /* Format popup html */
               var html = '<h1>'+_('Selection d\'un compositeur')+'</h1>'
                         +'<p>'+_('Veuillez selectionner le compositeur :')+'</p>'
               composers.forEach(function(k)
               {
                  if ((k.id != composer_id) &&
                      ((!for_moderation) || (k.is_global)))
                  {
                     html += '<button composer_id="'+k.id+'" is_global="'+(k.is_global?1:0)+'" composer_name="'+btoa(k.name)+'" class="ui-btn new-composer-link">'+htmlentities(k.name)+'</button>';
                  }
               });
               html += '<hr/><button id="cancel-change-composer" class="ui-btn">'+_('Annuler')+'</button>'

               $('#popup').html(html);
               $('#popup').enhanceWithin();

               $('#popup').popup();
               $('#popup').popup('open');

               $('.new-composer-link').click(function()
               {
                  var to_composer = parseInt($(this).attr('composer_id'));
                  if (to_composer != composer_id)
                  {
                     composer_id = to_composer;
                     composer_name = atob($(this).attr('composer_name'));
                     composer_is_global = parseInt($(this).attr('is_global')) > 0;
                     piece_id = false;
                     piece_name = false;
                     piece_is_global = false;
                     album_id = false;
                     album_name = false;
                     album_is_global = false;
                  }
                  onRefresh(InitSelection);
               })

               $('#cancel-change-composer').click(function()
               {
                  $('#popup').popup('close');
                  InitSelection();
               })
            }.bind(this), function()
            {
               alert('SOAP FAILED')
            })
         })

         $('#validate-new-piece-name').click(function()
         {
            console.log('Will change name 1')
            var new_name = $('#change-piece-name-id').val();
            if (piece_is_global && (!for_moderation))
            {
               if (!confirm(_('La piece est globale pour tous les membres du site !\nVoulez-vous vraiment changer son nom ?')))
               {
                  return;
               }
            }
            console.log('Will change name 2 : '+new_name)

            MusicianCafeRenamePiece(piece_id, new_name, function()
            {
               console.log('Will change name 3 : OK')
               $('#popup').popup('close');
               onRefresh(InitSelection);
            }.bind(this), function()
            {
               alert(_('Une erreur est survenue !'));
            })
         })

         $('#mutualise-piece').click(function()
         {
            if (confirm(_('Voulez vous vraiment confirmer la piece ')+piece_name+' ?\n'+_('Notez que cette operation s\'appliquera pour tous les utilisateurs du site !')))
            {
               MusicianCafeValidatePiece(piece_id, function()
               {
                  $('#popup').popup('close');
                  onRefresh(InitSelection);
               }, function()
               {
                  alert(_('Une erreur est survenue !'));
               })
            }
         })

         $('#change-piece').click(function()
         {
            MusicianCafeGetPiecesAndAlbumsByComposer(composer_id, function(pieces, albums)
            {
               /* Format popup html */
               var html = '<h1>'+_('Selection d\'une piece')+'</h1>'
                         +'<p>'+_('Veuillez selectionner la piece :')+'</p>'
               pieces.forEach(function(k)
               {
                  if ((k.id != piece_id) &&
                      ((!for_moderation) || (k.is_global)))
                  {
                     html += '<button album_id="'+k.album_id+'" piece_id="'+k.id+'" is_global="'+(k.is_global?1:0)+'" piece_name="'+btoa(k.name)+'" class="ui-btn new-piece-link">'+htmlentities(k.name)+'</button>';
                  }
               });
               html += '<hr/><p>'+_('Veuillez selectionner l\'album')+'</p>'
               albums.forEach(function(k)
               {
                  if ((k.id != album_id) &&
                      ((!for_moderation) || (k.is_global)))
                  {
                     html += '<button album_id="'+k.id+'" is_global="'+(k.is_global?1:0)+'" class="ui-btn new-album-link">'+htmlentities(k.name)+'</button>';
                  }
               });
               html += '<hr/><button id="cancel-change-piece" class="ui-btn">'+_('Annuler')+'</button>'

               $('#popup').html(html);
               $('#popup').enhanceWithin();

               $('#popup').popup();
               $('#popup').popup('open');

               $('.new-album-link').click(function()
               {
                  var selected_album =  parseInt($(this).attr('album_id'));

                  /* Retrieve all pieces of the album */
                  MusicianCafeGetPiecesByAlbum(selected_album, function(pieces)
                  {
                     /* Format popup html */
                     var html = '<h1>'+_('Selection d\'une piece')+'</h1>'
                               +'<p>'+_('Veuillez selectionner la piece :')+'</p>'
                     pieces.forEach(function(k)
                     {
                        if ((k.id != piece_id) &&
                            ((!for_moderation) || (k.is_global)))
                        {
                           html += '<button piece_id="'+k.id+'" is_global="'+(k.is_global?1:0)+'" piece_name="'+btoa(k.name)+'" class="ui-btn new-piece-link">'+htmlentities(k.name)+'</button>';
                        }
                     });
                     html += '<hr/><button id="cancel-change-piece" class="ui-btn">'+_('Annuler')+'</button>'

                     $('#popup').html(html);
                     $('#popup').enhanceWithin();

                     $('#popup').popup();
                     $('#popup').popup('open');

                     $('.new-piece-link').click(function()
                     {
                        var to_piece = parseInt($(this).attr('piece_id'));
                        if (to_piece != piece_id)
                        {
                           piece_id = to_piece;
                           piece_name = atob($(this).attr('piece_name'));
                           piece_is_global = parseInt($(this).attr('is_global')) > 0;
                           album_id = selected_album;
                           album_name = false;
                           album_is_global = false;
                        }
                        onRefresh(InitSelection);
                     })

                     $('#cancel-change-piece').click(function()
                     {
                        $('#popup').popup('close');
                        InitSelection();
                     })
                  }, function()
                  {
                     alert('SOAP FAILED')
                  })
               })

               $('.new-piece-link').click(function()
               {
                  var to_piece = parseInt($(this).attr('piece_id'));
                  if (to_piece != piece_id)
                  {
                     piece_id = to_piece;
                     piece_name = atob($(this).attr('piece_name'));
                     piece_is_global = parseInt($(this).attr('is_global')) > 0;
                     album_id = parseInt($(this).attr('album_id'));
                     album_name = false;
                     album_is_global = false;
                  }
                  onRefresh(InitSelection);
               })

               $('#cancel-change-piece').click(function()
               {
                  $('#popup').popup('close');
                  InitSelection();
               })
            }.bind(this), function()
            {
               alert('SOAP FAILED')
            })
         })

         $('#validate-new-album-name').click(function()
         {
            console.log('Will change name 1')
            var new_name = $('#change-album-name-id').val();
            if (album_is_global && (!for_moderation))
            {
               if (!confirm(_('L\'album est global pour tous les membres du site !\nVoulez-vous vraiment changer son nom ?')))
               {
                  return;
               }
            }
            console.log('Will change name 2 : '+new_name)

            MusicianCafeRenameAlbum(album_id, new_name, function()
            {
               console.log('Will change name 3 : OK')
               $('#popup').popup('close');
               onRefresh(InitSelection);
            }.bind(this), function()
            {
               alert(_('Une erreur est survenue !'));
            })
         })

         $('#mutualise-album').click(function()
         {
            if (confirm(_('Voulez vous vraiment confirmer l\'album ')+album_name+' ?\n'+_('Notez que cette operation s\'appliquera pour tous les utilisateurs du site !')))
            {
               MusicianCafeValidateAlbum(album_id, function()
               {
                  $('#popup').popup('close');
                  onRefresh(InitSelection);
               }, function()
               {
                  alert(_('Une erreur est survenue !'));
               })
            }
         })
      }

      /* Retrieve composer info */
      MusicianCafeGetComposerInfo(composer_id, function(composer_info)
      {
         composer_name = composer_info.name;
         composer_is_global = composer_info.is_global;

         if (piece_id)
         {
            MusicianCafeGetPieceInfo(piece_id, function(piece_info)
            {
               piece_name = piece_info.name;
               piece_is_global = piece_info.is_global;

               if (album_id && (album_id >= 0))
               {
                  MusicianCafeGetAlbumInfo(album_id, function(album_info)
                  {
                     album_name = album_info.name;
                     album_is_global = album_info.is_global;

                     OnHasData();
                  }, function()
                  {
                     alert(_('Une erreur est survenue !'));
                  })
               }
               else
               {
                  OnHasData();
               }
            },
            function()
            {
               alert(_('Une erreur est survenue !'));
            })
         }
         else
         {
            OnHasData();
         }
      },
      function()
      {
         alert(_('Une erreur est survenue !'));
      })
   }

   $('#piece-id').click(InitSelection)
}

var AcquireSamplePage =
{
   rec: false,

   InitAcquireSampleScreen: function()
   {
      /* Register leaving function */
      historyNavigation.registerOnLeave(function()
      {
         if (this.rec)
         {
            this.rec.close()
            this.rec = false;
         }
      }.bind(this))

      $('#title').text(_('Nouvel enregistrement'));

      /* Spawn recorder */
      this.rec = new Recorder({encoderPath: '/js/audio/opus-recorder/encoderWorker.min.js'});

      this.rec.ondataavailable  = function(d)
      {
         /* Format string */
         var data = '';
         for (var i = 0; i < d.length; i++)
         {
            data += String.fromCharCode(d[i]);
         }

         /* Check size */
         var info = logInfo.getInfo();
         var size_in_MB = Math.floor((data.length+(1024*1024)-1)/(1024*1024));

         if (size_in_MB > info.max_sample_size_MB)
         {
            if (!confirm(_('Votre enregistrement fait ')+size_in_MB+_('MB.\nOr, vous etes limite a une taille d\'enregistrement de ')+info.max_sample_size_MB+_('MB.\nVoulez-tronquer votre enregistrement ?\nNotez que si vous cliquee sur non, l\'enregistrement sera perdu')))
            {
               /* Set GUI */
               $('#start-record').closest('.ui-btn').show();
               $('#stop-record').closest('.ui-btn').hide();
               return;
            }

            data = data.slice(0, info.max_sample_size_MB*1024*1024);
         }

         console.log(data);
         var name = $('#sample-name-id').val();

         MusicianCafeUploadSample(this.piece_id,
                               name,
                               btoa(data),
                               function()
         {
            alert(_("Votre echantillon a correctement ete enregistre"));

            /* Set GUI */
            $('#start-record').closest('.ui-btn').show();
            $('#stop-record').closest('.ui-btn').hide();
         },
         function(status)
         {
            if (status == 9)
            {
               alert(_("Vous avez atteint votre quota d\'enregistrement !\nL\'enregistrement n\'a pas pu etre sauve !"))
            }
            else if (status == 10)
            {
               alert(_("Votre enregistrement est trop long !\nL\'enregistrement n\'a pas pu etre sauve !"))
            }
            else
            {
               alert(_("Une erreur est survenue pendant l'enregistrement !"))
            }

            /* Set GUI */
            $('#start-record').closest('.ui-btn').show();
            $('#stop-record').closest('.ui-btn').hide();
         })
      }.bind(this);

      /* Set content */
      var html = '';
      html += '<label for="sample-name-id">'+_("Nom de l'enregistrement")+'</label>'
             +'<input type="text" name="sample-name-id" id="sample-name-id" value="">'
             +'<button id="start-record" class="ui-btn">'+_('Enregistrer')+'</button>'
             +'<button id="stop-record" class="ui-btn">'+(_('Stop'))+'</button>';

      html += '<div data-role="popup" id="popup" data-theme="a" class="ui-corner-all"></div>';

      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();

      /* Set handlers */
      $('#start-record').click(function(e)
      {
         /* Check that a piece has been chosen, as well as a name */
         var name = $('#sample-name-id').val();
         if (name.length <= 0)
         {
            alert(_('Veuillez entrer le nom de l\'enregistrement avant de poursuivre !'));
            return;
         }

         if ((!this.piece_id) || (this.piece_id <= 0))
         {
            alert(_('Veuillez choisir une piece avant de poursuivre !'));
            return;
         }

         /* Update user info */
         MusicianCafeGetLoggedUserInfo(function(info)
         {
            /* Update log info */
            logInfo.setInfo(info);

            /* Check that we have still place to download */
            if (info.storage_limit_MB < info.current_storage_MB)
            {
               if (info.email_confirmed)
               {
                  alert(_('Vous ne pouvez pas effectuer d\'enregistrement tant que votre adresse mail n\'est pas enregistre !'));
               }
               else
               {
                  alert(_('Vous ne disposez plus de suffisamment d\'espace personnel pour enregistrer un nouveau sample\nVeuillez liberer de l\'espace pour continuer !'));
               }
            }
            else
            {
               alert(_('Vous pouvez telecharger des echantillons de maximum ')+info.max_sample_size_MB+_('MB. Ceci devrait correspondre a un enregistrement d\'a peu pres ')+(info.max_sample_size_MB*2)+_(' minutes !'));

               this.rec.start()

               /* Set GUI */
               $('#start-record').closest('.ui-btn').hide();
               $('#stop-record').closest('.ui-btn').show();
            }
         }.bind(this), function()
         {
            alert(_('Le serveur ne peut pas etre contacte !\nL\'enregistrement n\'est pas possible !'));
         }.bind(this));
      }.bind(this));
      $('#stop-record').click(function(e)
      {
         this.rec.stop()

         /* Set GUI */
         $('#start-record').closest('.ui-btn').hide();
         $('#stop-record').closest('.ui-btn').hide();
      }.bind(this));

      /* Set GUI */
      $('#start-record').closest('.ui-btn').show();
      $('#stop-record').closest('.ui-btn').hide();
   },

   LoadAcquireSampleScreen: function(piece_id, piece_name, composer_id, composer_name, album_id, album_name)
   {
      this.piece_id = piece_id;
      this.piece_name = piece_name;
      this.composer_id = composer_id;
      this.composer_name = composer_name;
      this.album_id = album_id;
      this.album_name = album_name;

      this.InitAcquireSampleScreen();
   }
}
