"use strict";

var LoadSamplePage =
{
   worker: false,
   shall_export: false,

   InitLoadSampleScreen: function()
   {
      /* Register leaving function */
      historyNavigation.registerOnLeave(function()
      {
         this.shall_export = false;
         if (this.worker)
         {
            this.worker.terminate();
            this.worker = false;
         }
      }.bind(this))

      $('#title').text('Chargement d\'un enregitrement');

      /* Set content */
      var html = '';
      html += '<input id="file-name" type="file" name="files[]" multiple="" class="ui-input-text ui-body-c">'
             +'<input id="slider" name="slider" data-highlight="true" min="0" max="100" value="78" type="range">';

      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();

      /* Mask progress bar */
      $('#slider').closest('.ui-slider').hide();

      /* Set handlers */
      $('#file-name').change(function(e)
      {
         var original_filename = $(e.target).val().replace(/.*(\/|\\)/, '');
         
         $('#file-name').attr('disabled', 'disabled');
         $('#slider').closest('.ui-slider').show();

         $('#slider').parent().find('input').hide();
         $('#slider').parent().find('input').css('margin-left','-9999px'); // Fix for some FF versions
         $('#slider').parent().find('.ui-slider-track').css('margin','0 15px 0 15px');
         $('#slider').parent().find('.ui-slider-handle').hide();

         $('#slider').val(0);
         $('#slider').slider("refresh");

         this.worker = new Worker('/js/compressed/EmsWorkerProxy.js');
         this.shall_export = true;

         var f =  $('#file-name').prop('files')[0]
         var fr = new FileReader();
         fr.addEventListener('loadend', function()
         {
            console.log('file uploaded');
            if (this.shall_export)
            {
               var args = [
                  f.name,
                  'encoded.opus'
               ];
               var inData = {};
               inData[f.name] = new Uint8Array(fr.result);

               var outData = {
                  'encoded.opus': {
                     'MIME': 'audio/ogg'
                  }
               };

               console.log('Will start conversion');
               this.worker.postMessage({
                  command: 'encode',
                  args: args,
                  outData: outData,
                  fileData: inData
               });
            }
         }.bind(this));
         fr.readAsArrayBuffer(f);
         console.log('Will start file upload');

         this.worker.onmessage = function(e)
         {
            console.log('worker message');
            if (this.shall_export)
            {
               console.log('worker message treated');
               console.log(e.data)
               // If the message is a progress message
               if (e.data && e.data.reply === 'progress')
               {
                  var vals = e.data.values;
                  if (vals[1])
                  {
                     $('#slider').val(vals[0] / vals[1] * 100);
                     $('#slider').slider("refresh");
                  }
               }
               else if (e.data && e.data.reply === 'done')
               {
                  console.log('will export data to DB');
                  //$prog.val(100);
                  for (var fileName in e.data.values)
                  {
                     console.log('data of file : '+fileName)
                     console.log(e.data.values[fileName].blob)

                     var reader = new FileReader();
                     reader.onload = function() {
                         var dataUrl = reader.result;
                         var base64 = dataUrl.split(',')[1];

                        var name = prompt("Veuillez entrer le nom de l'échantillon : ", original_filename);
                        if (name)
                        {
                            MusicianCafeUploadSample(this.piece_id,
                                                  name,
                                                  base64,
                                                  function()
                           {
                              historyNavigation.GoBack();
                           },
                           function()
                           {
                              alert("Une erreur est survenue pendant l'enregistrement !")
                           })
                        }
                     }.bind(this);
                     reader.readAsDataURL(e.data.values[fileName].blob);
                  }

                  this.worker.terminate();
                  this.worker = false;

                  $('#file-name').removeAttr('disabled');
                  $('#slider').closest('.ui-slider').hide();
               }
               else if (e.data && e.data.reply === 'err')
               {
                  this.worker.terminate();
                  this.worker = false;

                  $('#file-name').removeAttr('disabled');
                  $('#slider').closest('.ui-slider').hide();

                  alert(_('Le format du fichier n\'est pas supporte !'));
               }
            }
         }.bind(this);

      }.bind(this));
   },

   LoadLoadSampleScreen: function(piece_id, piece_name, composer_id, composer_name)
   {
      this.piece_id = piece_id;
      this.piece_name = piece_name;
      this.composer_id = composer_id;
      this.composer_name = composer_name;

      this.InitLoadSampleScreen();
   }
}
