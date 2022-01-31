"use strict";

var LoadPartitionPage =
{
   worker: false,
   shall_export: true,

   IniTransformMusicXMLScreen: function(_mxl)
   {
      var mxl = _mxl;
      console.log(mxl)
      
      /* Load the available instruments */
      MusicXML.getAvailableInstruments(mxl, function(instruments)
      {
         /* Format the xml */
         var html = '<label for="score-name">Nom de la partition : </label><input type="text" id="score-name" name="score-name"/>'
                   +'<fieldset data-role="controlgroup">'
                   +'   <legend>Instruments:</legend>';
         var id = 0;
         instruments.forEach(function(instrument)
         {
           id++;
           html += '   <input type="checkbox" name="score-instrument-'+id+'" class="score-instrument" id="score-instrument-'+id+'" checked="true">'
                  +'   <label for="score-instrument-'+id+'">'+htmlentities(instrument)+'</label>'
         });
         html += '</fieldset>'
               +'<div class="ui-field-contain">'
               +'    <label for="score-select-tone">'+_('Tonalite')+'</label>'
               +'    <select name="score-select-tone" id="score-select-tone">'
               +'        <option value="">'+_('Pas de transposition')+'</option>'
               +'        <option value="Ab">'+_('Ab')+'</option>'
               +'        <option value="A">'+_('A')+'</option>'
               +'        <option value="A#">'+_('A#')+'</option>'
               +'        <option value="Bb">'+_('Bb')+'</option>'
               +'        <option value="B">'+_('B')+'</option>'
               +'        <option value="B#">'+_('B#')+'</option>'
               +'        <option value="Cb">'+_('Cb')+'</option>'
               +'        <option value="C">'+_('C')+'</option>'
               +'        <option value="C#">'+_('C#')+'</option>'
               +'        <option value="Db">'+_('Db')+'</option>'
               +'        <option value="D">'+_('D')+'</option>'
               +'        <option value="D#">'+_('D#')+'</option>'
               +'        <option value="Eb">'+_('Eb')+'</option>'
               +'        <option value="E">'+_('E')+'</option>'
               +'        <option value="E#">'+_('E#')+'</option>'
               +'        <option value="Fb">'+_('Fb')+'</option>'
               +'        <option value="F">'+_('F')+'</option>'
               +'        <option value="F#">'+_('F#')+'</option>'
               +'        <option value="Gb">'+_('Gb')+'</option>'
               +'        <option value="G">'+_('G')+'</option>'
               +'        <option value="G#">'+_('G#')+'</option>'
               +'    </select>'
               +'    <label for="score-select-tone-adjust">'+_('Direction')+'</label>'
               +'    <select name="score-select-tone-adjust" id="score-select-tone-adjust">'
               +'        <option value="none">'+_('Au plus pres')+'</option>'
               +'        <option value="down">'+_('Vers le bas')+'</option>'
               +'        <option value="up">'+_('Vers le haut')+'</option>'
               +'    </select>'
               +'</div>'
               +'<hr/>'
               +'<button id="do-load-score" class="ui-btn">'+_('Appliquer')+'</button>'

         /* Insert html */
         $('#main_page_content').html(html);
         $('#main_page_content').enhanceWithin();
         
         /* Change panel */
         $('#show-param-info').hide();
         
         /* Set handler */
         $('#do-load-score').click(function()
         {
            /* Check that score name has been entered */
            if ((!$('#score-name').val()) ||
                ($('#score-name').val().length <= 0))
            {
               alert(_('Veuillez encoder le nom de la partition !'));
               return;
            }

            /* Get new key */
            var tone = $( "#score-select-tone" ).val();
            var direction = $("#score-select-tone-adjust" ).val();

            if (tone == '') tone = false;

            /* Get instruments */
            var selected_instruments = [];
            var id = 0;
            instruments.forEach(function(instrument)
            {
               id++;
               if ($('#score-instrument-'+id).is(":checked"))
               {
                  selected_instruments.push(id);
               }
            });

            /* Check that we have at least one instrument */
            if (selected_instruments.length <= 0)
            {
               alert(_('Vous devez selectionner au moins un instrument !'));
               return;
            }

            /* Trigger generation of pdf */
            MusicXML.convertToPDF(mxl, tone, direction, selected_instruments, function(pdf, nb_pages, info)
            {
               /* Set scrolling stuff */
               var scrolling_name = _('Defaut');
               var scrolling_info = "1";
               for (var i = 2; i <= nb_pages; i++)
               {
                  scrolling_info += ';'+i;
               }
               
               if (this.original_partition)
               {
                  MusicianCafeAddPartitionVariant(this.original_partition,  $('#score-name').val(), btoa(pdf), scrolling_name, scrolling_info, info, function(r)
                  {
                     historyNavigation.Navigate('SelectPartitionScrollingPage', 'LoadSelectPartitionScrollingScreen', [r]);
                  }, function()
                  {
                     alert(_('Une erreur est survenue !'));
                  })
               }
               else
               {
                  MusicianCafeUploadPartition(this.piece_id, $('#score-name').val(), btoa(pdf), scrolling_name, scrolling_info, btoa(mxl), info, function(r)
                  {
                     historyNavigation.Navigate('SelectPartitionScrollingPage', 'LoadSelectPartitionScrollingScreen', [r]);
                  }, function()
                  {
                     alert(_('Une erreur est survenue !'));
                  })
               }
            }.bind(this))
         }.bind(this))
      }.bind(this));
   },
   
   InitLoadMusicXMLScreen: function()
   {
      $('#title').text(this.piece_name + 'Chargement d\'un fichier MusicXML');

      /* Set content */
      var html = '<label for="score-file">Fichier MusicXML : </label><input type="file" id="score-file" name="score-file"/>'
                +'<button class="ui-btn" id="upload-link">Ajouter</button>';

      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();

      /* Set handlers */
      $('#upload-link').click(function()
      {
         /* Check that a file has been selected */
         if (!$('#score-file').val())
         {
            alert(_('Veuillez sélectionner un fichier !'));
            return;
         }

         /* Download the file */
         var file = $('#score-file').prop('files')[0];

         var reader = new FileReader();
         reader.readAsArrayBuffer(file);

         var scope = this;

         reader.onload = readerEvent =>
         {
            /* Get content of file */
            var content = readerEvent.target.result;
            
            /* Convert to binary stuff */
            var binary = '';
            var bytes = new Uint8Array( content );
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++)
            {
               binary += String.fromCharCode( bytes[ i ] );
            }
            
            /* Perform the transformation */
            this.IniTransformMusicXMLScreen(binary);
         }
      }.bind(this))
   },
   
   InitLoadPartitionScreen: function()
   {
      $('#title').text(this.piece_name + 'Chargement d\'une partition');

      /* Set content */
      var html = '<label for="score-name">Nom de la partition : </label><input type="text" id="score-name" name="score-name"/>'
                +'<label for="score-file">Partition : </label><input type="file" id="score-file" name="score-file"/>'
                +'<button class="ui-btn" id="upload-link">Ajouter</button>';

      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();

      /* Set handlers */
      $('#upload-link').click(function()
      {
         /* Check that score name has been entered */
         if ((!$('#score-name').val()) ||
             ($('#score-name').val().length <= 0))
         {
            alert(_('Veuillez encoder le nom de la partition !'));
            return;
         }

         /* Check that a file has been selected */
         if (!$('#score-file').val())
         {
            alert(_('Veuillez sélectionner un fichier !'));
            return;
         }

         /* Download the file */
         var file = $('#score-file').prop('files')[0];

         var reader = new FileReader();
         reader.readAsArrayBuffer(file);

         var scope = this;

         reader.onload = readerEvent =>
         {
            /* Get content of file */
            var content = readerEvent.target.result;

            /* Parse pdf */
            window['pdfjs-dist/build/pdf'].getDocument({data: content}).promise.then(function(pdfDoc)
            {
               try
               {
                  /* Prepare the pages selection stuff */
                  var pages_scroll = '1';
                  for (var i = 2; i <= pdfDoc.numPages; i++)
                  {
                     pages_scroll += ';'+i;
                  }

                  /* Convert to binary stuff */
                  var binary = '';
                  var bytes = new Uint8Array( content );
                  var len = bytes.byteLength;
                  for (var i = 0; i < len; i++)
                  {
                     binary += String.fromCharCode( bytes[ i ] );
                  }

                  /* Upload new score */
                  MusicianCafeUploadPartition(scope.piece_id, $('#score-name').val(), btoa(binary), _('Defaut'), pages_scroll, null, null, function(r)
                  {
                     historyNavigation.Navigate('SelectPartitionScrollingPage', 'LoadSelectPartitionScrollingScreen', [r]);
                  }, function()
                  {
                     alert(_('Une erreur est survenue !'));
                  })
               }
               catch (error)
               {
                  console.error(error);
               }
            }).catch((error) =>
            {
               alert(_('Le fichier sélectionné n\'est pas un PDF valide !'))
            });
         }
      }.bind(this))
   },

   TransformMusicXMLScreen: function(piece_id, piece_name, composer_id, composer_name, album_id, album_name, mxl, original_partition)
   {
      this.piece_id = piece_id;
      this.piece_name = piece_name;
      this.composer_id = composer_id;
      this.composer_name = composer_name;
      this.album_id = album_id;
      this.album_name = album_name;
      this.original_partition = original_partition;

      /* Convert to binary stuff */
      var binary = '';
      var bytes = new Uint8Array( mxl );
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++)
      {
         binary += String.fromCharCode( bytes[ i ] );
      }

      this.IniTransformMusicXMLScreen(binary);
   },
   
   LoadLoadMusicXMLScreen: function(piece_id, piece_name, composer_id, composer_name, album_id, album_name)
   {
      this.piece_id = piece_id;
      this.piece_name = piece_name;
      this.composer_id = composer_id;
      this.composer_name = composer_name;
      this.album_id = album_id;
      this.album_name = album_name;
      this.original_partition = false;

      this.InitLoadMusicXMLScreen();
   },
   
   LoadLoadPartitionScreen: function(piece_id, piece_name, composer_id, composer_name, album_id, album_name)
   {
      this.piece_id = piece_id;
      this.piece_name = piece_name;
      this.composer_id = composer_id;
      this.composer_name = composer_name;
      this.album_id = album_id;
      this.album_name = album_name;
      this.original_partition = false;

      this.InitLoadPartitionScreen();
   }
}
