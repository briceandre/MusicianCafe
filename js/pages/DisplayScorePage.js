"use strict";

function initPDF(_canvas_id, is_first, pdf_data, pages_order, _mxl_info)
{
   this.mxl_info = _mxl_info;
   this.pdfDoc = null;
   this.pageNum = parseInt(pages_order[0]);
   this.pageRendering = false;
   this.pageNumPending = null;
   this.scale = 1;
   this.canvas_id = _canvas_id;
   this.canvas = document.getElementById(this.canvas_id);

   if (!is_first)
   {
      if (pages_order.length < 2) return;
      this.pageNum = parseInt(pages_order[1]);
   }

   this.updateSize = function()
   {
      $('#'+this.canvas_id).parent().find('.pdf-cursor').remove();
      $('#'+this.canvas_id).parent().find('.pdf-cursor-mask').remove();

      if (this.mxl_info)
      {
         var system_id = 0;
         var page = this.mxl_info.pages[this.last_rendered_page-1];

         /* Compute zooms */
         var height_zoom = 10*this.canvas.getBoundingClientRect().height/page.image_size.height;
         var width_zoom = 10*this.canvas.getBoundingClientRect().width/page.image_size.width;

         var full_x_min = false;
         var full_x_max = false;
         var full_y_min = false;
         var full_y_max = false;

         /* Append entries */
         for (const system of page.systems)
         {
            system_id++;

            /* Compute measure ymin ymax*/
            var ymin = false;
            var ymax = false;
            for (const measure of system.measures)
            {
               var lmin = measure.positions[0].origin.y;
               var lmax = measure.positions[measure.positions.length-1].origin.y+measure.positions[measure.positions.length-1].size.height;
               if ((!ymin) || (lmin < ymin)) ymin = lmin;
               if ((!ymax) || (lmax > ymax)) ymax = lmax;
            }

            var measure_id = 0;
            for (const measure of system.measures)
            {
               measure_id++;

               /* compute position */
               var left = measure.positions[0].origin.x;
               var width = measure.positions[0].size.width;
               var right = left+width;

               /* Insert element */
               $('#'+this.canvas_id).parent().append('<div measure-id="'+measure.number+'" id="pdf-cursor-measure-'+measure.number+'" class="pdf-cursor" style="top:'+(ymin*height_zoom)+'px;left:'+(left*width_zoom)+'px;height:'+((ymax-ymin)*height_zoom)+'px;width:'+(width*width_zoom)+'px"></div>')

               /* update full mask */
               if ((!full_x_min) || (left < full_x_min)) full_x_min = left;
               if ((!full_x_max) || (right > full_x_max)) full_x_max = right;

               if ((!full_y_min) || (ymin < full_y_min)) full_y_min = ymin;
               if ((!full_y_max) || (ymax > full_y_max)) full_y_max = ymax;
            }
         }

         /* Set hanlders */
         $('#'+this.canvas_id).parent().find('.pdf-cursor').click(function(e)
         {
            var measure_id = parseInt($(e.target).attr('measure-id'));
            $('#pdf-cursor-measure-'+measure_id).addClass('next');
            displayScorePage.music_xml_player.moveToMeasure(measure_id);
         })

         /* Set full maxk */
         $('#'+this.canvas_id).parent().append('<div class="pdf-cursor-mask" style="top:'+(full_y_min*height_zoom)+'px;left:'+(full_x_min*width_zoom)+'px;height:'+((full_y_max-full_y_min)*height_zoom)+'px;width:'+((full_x_max-full_x_min)*width_zoom)+'px"></div>')
      }
   }

   this.renderPage = function(num)
   {
      this.last_rendered_page = num;

      this.pageRendering = true;
      this.pdfDoc.getPage(num).then(function(page)
      {
         var scale = 1.5;
         var viewport = page.getViewport({scale: $(this.canvas).width() / page.getViewport({scale: 1.0}).width});
         var container = document.getElementById(this.canvas_id);
         container.innerHTML = '';
         page.getOperatorList().then(function (opList)
         {
            var svgGfx = new window['pdfjs-dist/build/pdf'].SVGGraphics(page.commonObjs, page.objs);
            return svgGfx.getSVG(opList, viewport);
         }.bind(this)).then(function (svg)
         {
            container.appendChild(svg);
            this.pageRendering = false;

            this.updateSize();
         }.bind(this));
      }.bind(this));
   }

   this.queueRenderPage = function(num)
   {
      if (this.pageRendering)
      {
         this.pageNumPending = num;
      }
      else
      {
         this.renderPage(num);
      }
   }

   this.onPage = function(num)
   {
      if (this.pageNum != num)
      {
         this.pageNum = num;
         this.queueRenderPage(this.pageNum);
      }
   }

   window['pdfjs-dist/build/pdf'].getDocument({data: pdf_data}).promise.then(function(pdfDoc_)
   {
      this.pdfDoc = pdfDoc_;
      this.renderPage(this.pageNum);
   }.bind(this));

   return this;
}

var Metronome =
{
   last_time: 0,
   max_send_pulse_time: 1,
   freq_high: 1000,
   freq_low: 700,
   serie: 0,
   is_enabled: false,

   onCallback: function()
   {
      if (this.is_enabled)
      {
         /* Retrieve info from GUI */
         var is_enabled = $('#metronome-enabled').is(":checked");
         var speed = $('#metronome-speed').val();
         var measure = parseInt($('#metronome-measure option:selected').val());

         var now = this.audioCtx.currentTime

         /* Check if enabled */
         if (is_enabled)
         {
            /* Send all next pulses */
            while (true)
            {
               /* Compute time of next tick */
               var next_tick = this.last_time + (60.0/parseFloat(speed));
               if (next_tick < now)
               {
                  next_tick = now;
               }

               /* Check if we shall send it */
               if (next_tick < (now+this.max_send_pulse_time))
               {
                  var freq = this.freq_low;
                  this.serie++;
                  if (this.serie >= measure)
                  {
                     this.serie = 0;
                     if (measure > 0)
                     {
                        freq = this.freq_high;
                     }
                  }

                  this.tick.frequency.setValueAtTime(freq, next_tick);

                  /* configure it */
                  this.tickVolume.gain.cancelScheduledValues(next_tick);
                  this.tickVolume.gain.setValueAtTime(0, next_tick);

                  // Audible click sound.
                  this.tickVolume.gain.linearRampToValueAtTime(1, next_tick + .001);
                  this.tickVolume.gain.linearRampToValueAtTime(0, next_tick + .001 + .01);

                  /* Update internal state */
                  this.last_time = next_tick;
               }
               else
               {
                  /* Stop execution */
                  return;
               }
            }
         }
      }
   },

   init: function()
   {
      setInterval(this.onCallback.bind(this), 100);

      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.tick = this.audioCtx.createOscillator();
      this.tickVolume = this.audioCtx.createGain();

      this.tick.type = 'sine';
      this.tick.frequency.value = this.freq_high;
      this.tickVolume.gain.value = 0;

      this.tick.connect(this.tickVolume);
      this.tickVolume.connect(this.audioCtx.destination);
      this.tick.start(0);
   }
}
Metronome.init();

var displayScorePage =
{
   partition_info: false,
   scrolls: [],
   no_sleep: false,

   updatePage: function()
   {
      if (this.is_one_per_page)
      {
         this.page_1.onPage(parseInt(this.pages_order[this.current_page]));
      }
      else
      {
         if ((this.current_page % 2) == 0)
         {
            $('#page-1-canvas').addClass('selected').removeClass('unselected');
            $('#page-1-bg').addClass('selected').removeClass('unselected');

            $('#page-2-canvas').removeClass('selected').addClass('unselected');
            $('#page-2-bg').removeClass('selected').addClass('unselected');

            this.page_1.onPage(parseInt(this.pages_order[this.current_page]));

            if ((this.current_page+1) >= this.pages_order.length)
            {
               this.page_2.onPage(parseInt(this.pages_order[this.current_page-1]));
            }
            else
            {
               this.page_2.onPage(parseInt(this.pages_order[this.current_page+1]));
            }
         }
         else
         {
            $('#page-2-canvas').addClass('selected').removeClass('unselected');
            $('#page-2-bg').addClass('selected').removeClass('unselected');

            $('#page-1-canvas').removeClass('selected').addClass('unselected');
            $('#page-1-bg').removeClass('selected').addClass('unselected');

            if ((this.current_page+1) >= this.pages_order.length)
            {
               this.page_1.onPage(parseInt(this.pages_order[this.current_page-1]));
            }
            else
            {
               this.page_1.onPage(parseInt(this.pages_order[this.current_page+1]));
            }

            this.page_2.onPage(parseInt(this.pages_order[this.current_page]));
         }
      }
   },

   reconstructScore: function()
   {
      /* Compute page order */
      this.pages_order = this.pages.split(";");

      /* Compute html */
      var html = '';
      if (!this.is_one_per_page)
      {
         html += '<div class="ui-grid-a" style="height:100%;width:100%">'
                +'   <div class="ui-block-a" style="height:100%;width:50%"><div class="ui-bar ui-bar-a">'

      }
      html += '  <div class="column" style="position: relative;">'
             +'    <div id="page-1-canvas" class="pdf-canvas selected"></div>'
             +'    <div id="page-1-bg" class="selected"></div>'
             +'  </div>';
      if (!this.is_one_per_page)
      {
         html += '   </div></div>'
                +'   <div class="ui-block-b" style="height:100%;width:50%"><div class="ui-bar ui-bar-a">'
                +'     <div class="column" style="position: relative;">'
                +'       <div id="page-2-canvas" class="pdf-canvas unselected"></div>'
                +'       <div id="page-2-bg" class="unselected"></div>'
                +'     </div>'
                +'   </div></div>'
                +'</div>'
      }

      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();

      /* Init the pdf */
      this.page_1 = new initPDF('page-1-canvas', true, this.pdf, this.pages_order, this.mxl_info);
      if (!this.is_one_per_page)
      {
         this.page_2 = new initPDF('page-2-canvas', false, this.pdf, this.pages_order, this.mxl_info);
      }
      else
      {
         this.page_2 = false;
      }

      /* Init handers */
      $('#page-1-canvas').resize(function()
      {
         this.page_1.updateSize();
      });
      $('#page-2-canvas').resize(function()
      {
         this.page_2.updateSize();
      });

      /* Set data to change the pages */
      this.current_page = 0;
      this.total_nb_pages = this.pages_order.length-1;

      window.onPrevious = function()
      {
         if (this.current_page > 0) this.current_page--;
         this.updatePage()
      }.bind(this)

      window.onNext = function()
      {
         this.current_page++;
         if (this.current_page > this.total_nb_pages) this.current_page = this.total_nb_pages;
         this.updatePage()
      }.bind(this)

      if (this.is_one_per_page)
      {
         $('#page-1-bg').click(onNext);
      }
      else
      {
         $('#page-1-bg').click(window.onPrevious);
         $('#page-2-bg').click(window.onNext);
      }
   },

   InitShowScore: function()
   {
      /* Register leaving function */
      historyNavigation.registerOnLeave(function()
      {
         MusicXML.cleanup();
         if (this.music_xml_player)
         {
            this.music_xml_player.cleanup();
            this.music_xml_player = false;
         }
         if (this.no_sleep)
         {
            this.no_sleep.disable();
         }
         if (this.player)
         {
            this.player.cleanup();
            this.player = false;
         }
         if (this.rec)
         {
            this.rec.close()
            this.rec = false;
         }
      }.bind(this));

      /* Start no-sleep */
      if (!this.no_sleep)
      {
         this.no_sleep = new NoSleep();
      }
      this.no_sleep.enable();

      /* Set page to be on full screen */
      historyNavigation.SetPageWithoutNavigation('display-score-full-page');

      /* Reconstruct the score */
      this.reconstructScore();

      /* Prepare the side panel */
      var panel_html = '<div data-role="collapsible-set" data-theme="c" data-content-theme="d">'
                      +'   <div data-role="collapsible">'
                      +'     <h3>Enregistrements</h3>'
                      +'     <div id="side_panel_samples"></div>'
                      +'   </div>';
      if (this.mxl)
      {
         panel_html += '   <div data-role="collapsible">'
                      +'     <h3>Music-XML</h3>'
                      +'     <div id="side_panel_mxl"><p>Veuillez patienter pendant le chargement...</p></div>'
                      +'   </div>';
      }
      panel_html += '   <div data-role="collapsible">'
                   +'      <h3>Métronome</h3>'
                   +'      <div>'
                   +'         <div data-role="fieldcontain"><label for="metronome-enabled">Activer le métronome</label><input type="checkbox" name="metronome-enabled" id="metronome-enabled"/></div>'
                   +'         <div data-role="fieldcontain"><label for="metronome-speed">Vitesse</label><input type="range" data-role="spinbox" name="metronome-speed" id="metronome-speed" value="60" min="30" max="200" /></div>'
                   +'         <div data-role="fieldcontain"><label for="metronome-measure">Mesure</label><select id="metronome-measure"><option value="0">Jamais</option><option value="1">Toujours</option><option value="2">2/4</option><option value="3">3/4</option><option value="4">4/4</option></select></div>'
                   +'      </div>'
                   +'   </div>'
                   +'   <div data-role="collapsible">'
                   +'      <h3>Annotations</h3>'
                   +'      <button id="annotate-button" class="ui-btn">'+_('Changer l\'annotation')+'</button>'
                   +'   </div>'
                   +'</div>';

      $('#param-info').html(panel_html);
      $('#param-info').enhanceWithin();

      $('#show-param-info').show();

      /* Configure samples panel */
      {
         /* Define function to init the panel */
         var init_samples_panel = function()
         {
            /* Load all assoiated samples */
            MusicianCafeGetSamplesByPiece(this.partition_info.piece_id, function(samples)
            {
               /* save samples */
               this.samples = samples;

               /* Display panel */
               var html = '';
               if (this.samples.length > 0)
               {
                  html += '<h3>Sélection d\'un enregistrement :</h3>';
                  var i = 0
                  this.samples.forEach(function(s)
                  {
                     html += '<button class="ui-btn play-sample" sample_index="'+i+'">'+htmlentities(s.name)+'</button>';
                     i++;
                  })
               }
               html += '<h3>Nouvel Enregistrement :</h3>';
               html += '<button class="ui-btn create-sample">'+_('Lancer un nouvel enregistrement')+'</button>';

               $('#side_panel_samples').html(html);
               $('#param-info').enhanceWithin();

               $('.play-sample').click(function(e)
               {
                  /* Retrieve sample info */
                  var sample = this.samples[$(e.target).attr("sample_index")];
                  console.log(sample);

                  var UpdatePlayPos = function(pos)
                  {
                     $('#play-pos').val(pos);
                     $('#play-pos').slider("refresh");
                  }.bind(this);

                  var StartPlay = function()
                  {
                     if (!this.player)
                     {
                        this.player = new AudioPlayer(sample.id, function()
                        {
                           /* We need to wait some time because there may remain space in played buffer */
                           setTimeout(function()
                           {
                              if (this.player)
                              {
                                 this.player.cleanup();
                                 this.player = false;
                              }
                              UpdatePlayPos(0)
                              $('#play-pos').slider('enable');
                           }.bind(this), 1000)
                        }.bind(this), UpdatePlayPos.bind(this))
                     }

                     this.player.setSpeed(100/parseInt($('#play-speed').val()))
                     this.player.setPitch(parseInt($('#play-pitch').val()))

                     this.player.start(parseInt($('#play-pos').val()));

                     $('#play-pos').slider('disable');
                  }.bind(this);

                  var ResumePlay = function()
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
                        StartPlay();
                     }
                     else
                     {
                        this.player.resume();
                        this.no_sleep.enable();

                        $('#play-pos').slider('disable');
                     }
                  }.bind(this);

                  var StopPlay = function()
                  {
                     if (this.player)
                     {
                        this.player.stop();
                        this.no_sleep.disable();
                     }

                     this.has_changed_pos = false;

                     $('#play-pos').slider('enable');
                  }.bind(this);

                  var html = '<h3>'+htmlentities(sample.name)+'</h3>'
                             +'<div class="flex-table">'
                             +'<div class="fixed-width">'
                             +'   <div class="fixed-line-height-small">'
                             +'      <a id="resume-play" href="#" data-role="button" data-icon="ui-icon-play" data-show-label="false" data-inline="true">Display Main Page</a>'
                             +'      <a id="stop-play" href="#" data-role="button" data-icon="ui-icon-pause" data-show-label="false" data-inline="true">Display Main Page</a>'
                             +'   </div>'
                             +'   <div class="fixed-line-height-small">'
                             +'      <h4 style="text-align: center; height: 60px; width: 100%; vertical-align: middle; display: table-cell;">Vitesse</h4>'
                             +'   </div>'
                             +'   <div class="fixed-line-height-small">'
                             +'      <h4 style="text-align: center; height: 60px; width: 100%; vertical-align: middle; display: table-cell;">Pitch</h4>'
                             +'   </div>'
                             +'</div>'

                             +'<div class="fixed-width">'
                             +'   <div class="fixed-line-height-small">'
                             +'   &nbsp;</div>'
                             +'   <div class="fixed-line-height-small">'
                             +'   &nbsp;</div>'
                             +'   <div class="fixed-line-height-small">'
                             +'   &nbsp;</div>'
                             +'</div>'

                             +'<div class="flex-width">'
                             +'   <div class="fixed-line-height-small">'
                             +'      <input type="range" name="play-pos" id="play-pos" value="0" min="0" max="'+sample.duration+'">'
                             +'   </div>'
                             +'   <div class="fixed-line-height-small">'
                             +'      <input type="range" name="play-speed" id="play-speed" value="100" min="80" max="150" data-highlight="true">'
                             +'   </div>'
                             +'   <div class="fixed-line-height-small">'
                             +'      <input type="range" name="play-pitch" id="play-pitch" value="0" min="-12" max="12" data-highlight="true">'
                             +'   </div>'
                             +'</div>'
                             +'</div>'
                             +'<button class="ui-btn sample-play-go-back" sample_index="'+i+'">'+_('Retour')+'</button>'

                  $('#side_panel_samples').html(html);
                  $('#param-info').enhanceWithin();

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

                  $('#stop-play').click(StopPlay);

                  $('#start-play').click(StartPlay);

                  $('#resume-play').click(ResumePlay);

                  $("#play-pos").change(function()
                  {
                     this.has_changed_pos = true;
                  }.bind(this));

                  $(".sample-play-go-back").click(function()
                  {
                     /* Ensure we stop playback */
                     if (this.player)
                     {
                        this.player.cleanup();
                        this.player = false;
                     }

                     /* Refresh panel */
                     init_samples_panel();

                  }.bind(this));

               }.bind(this));

               $('.create-sample').click(function()
               {
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

                     MusicianCafeUploadSample(this.partition_info.piece_id,
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

                  var html = '';
                  html += '<h3>'+_('Nouvel enregitrement')+'</h3>'
                         +'<label for="sample-name-id">'+_("Nom de l'enregistrement")+'</label>'
                         +'<input type="text" name="sample-name-id" id="sample-name-id" value="">'
                         +'<button id="start-record" class="ui-btn">'+_('Enregistrer')+'</button>'
                         +'<button id="stop-record" class="ui-btn">'+(_('Stop'))+'</button>'
                         +'<button class="ui-btn sample-play-go-back" sample_index="'+i+'">'+_('Retour')+'</button>';

                  /* Insert html */
                  $('#side_panel_samples').html(html);
                  $('#param-info').enhanceWithin();

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

                  $(".sample-play-go-back").click(function()
                  {
                     /* Ensure we stop playback */
                     if (this.rec)
                     {
                        this.rec.close()
                        this.rec = false;
                     }

                     /* Refresh panel */
                     init_samples_panel();

                  }.bind(this));

                  /* Set GUI */
                  $('#start-record').closest('.ui-btn').show();
                  $('#stop-record').closest('.ui-btn').hide();
               }.bind(this));
            }.bind(this), function()
            {
               $('#side_panel_samples').html('<p>Une erreur est survenue</p>');
            }.bind(this));
         }.bind(this);

         /* Start init */
         init_samples_panel();
      }

      /* configure MXL panel */
      if (this.mxl)
      {
         /* Load MXL in player */
         this.music_xml_player = new MusicXMLPlayer(this.mxl, '/samples/');
         this.music_xml_player.waitReady().then(function()
         {
            /* update panel */
            var html = '<div class="ui-field-contain">'
                      +'   <a id="start-replay" href="#" data-role="button" data-icon="ui-icon-play" data-show-label="false" data-inline="true">Display Main Page</a>'
                      +'   <a id="pause-replay" href="#" data-role="button" data-icon="ui-icon-pause" data-show-label="false" data-inline="true">Display Main Page</a>'
                      +'   <a id="stop-replay" href="#" data-role="button" data-icon="ui-icon-stop" data-show-label="false" data-inline="true">Display Main Page</a>'
                      +'</div>'
                      +'<label for="replay-speed">Vitesse</label><input type="range" data-role="spinbox" name="replay-speed" id="replay-speed" value="60" min="30" max="250" />'
                      +'<div class="ui-field-contain">'
            var instrument_id = 0;
            this.music_xml_player.getInstruments().forEach(function(r)
            {
               r.id = instrument_id;

               instrument_id++;
               html += '    <label for="replay-instrument-voice-'+instrument_id+'">'+htmlentities(r.name)+'</label>'
                      +'    <select instrument_info="'+utoa(JSON.stringify(r))+'" class="on-change-replay-instrument" name="replay-instrument-voice-'+instrument_id+'" id="replay-instrument-voice-'+instrument_id+'">'

               var id = 0;
               MusicXMLPlayer.getAvailableInstruments().forEach(function(name)
               {
                  html += '<option value="'+id+'"'+(r.instrument_id==id?(' selected="true"'):'')+'>'+htmlentities(name)+'</option>'
                  id++;
               })

               html += '    </select>'
                      +'    <label for="replay-instrument-volumne-voice-'+instrument_id+'">'+_('(vol)')+'</label>'
                      +'    <input instrument_info="'+utoa(JSON.stringify(r))+'" class="on-change-replay-instrument-volume" type="range" name="replay-instrument-volumne-voice-'+instrument_id+'" id="replay-instrument-volumne-voice-'+instrument_id+'" step="1" value="100" min="0" max="100"/>'
            }.bind(this))
            html += '</div>'
                   +'<hr/>'
                   +'<button id="do-modify-score" class="ui-btn">'+_('Modifier la partition')+'</button>';

            /* Insert html */
            $('#side_panel_mxl').html(html);
            $('#param-info').enhanceWithin();

            /* Ensure visible */
            $('#show-param-info').show();

            $('#do-modify-score').click(function()
            {
               $("[data-role=panel]").panel("close");

               historyNavigation.Navigate('LoadPartitionPage', 'TransformMusicXMLScreen', [this.partition_info.piece_id, this.partition_info.piece_name, this.partition_info.composer_id, this.partition_info.composer_name, this.partition_info.album_id, this.partition_info.album_name, this.mxl, this.partition_info.id]);
            }.bind(this))

            $('#replay-speed').change(function()
            {
               this.music_xml_player.setTempo(parseInt($('#replay-speed').val()));
            }.bind(this));

            $('#start-replay').click(function()
            {
               this.music_xml_player.setTempo(parseInt($('#replay-speed').val()));
               this.music_xml_player.start(function(measure_id)
               {
                  var page_id_to_display = 0;
                  var measure_to_display = 1;

                  /* Determine the page and measure on which we are */
                  for (var page_id = 0; page_id < this.mxl_info.pages.length; page_id++)
                  {
                     var page = this.mxl_info.pages[page_id];
                     for (const system of page.systems)
                     {
                        for (const measure of system.measures)
                        {
                           /* If we are on a muti-rest measure, we will never have exact match ! */
                           if (measure.number <= measure_id)
                           {
                              page_id_to_display = page_id;
                              measure_to_display = measure.number;
                           }
                        }
                     }
                  }

                  /* Update page */
                  if (this.current_page != page_id_to_display)
                  {
                     this.current_page = page_id_to_display;
                     this.updatePage();
                  }

                  /* Display cursor on measure */
                  $('.pdf-cursor').removeClass('selected');
                  $('.pdf-cursor').removeClass('next');
                  $('#pdf-cursor-measure-'+measure_to_display).addClass('selected');
               }.bind(this),function()
               {
                  /* Remove all cursors */
                  $('.pdf-cursor').removeClass('selected');
               }.bind(this));
            }.bind(this))
            $('#pause-replay').click(function(){this.music_xml_player.pause()}.bind(this))
            $('#stop-replay').click(function(){this.music_xml_player.stop()}.bind(this))

            $('.on-change-replay-instrument').change(function(e)
            {
               var instrument_info = JSON.parse(atou($(e.target).attr('instrument_info')));
               this.music_xml_player.setReplayInstrument(instrument_info.id, parseInt($(e.target).val()))
            }.bind(this))

            $('.on-change-replay-instrument-volume').change(function(e, ui)
            {
               var instrument_info = JSON.parse(atou($(e.target).attr('instrument_info')));
               this.music_xml_player.setReplayVolume(instrument_info.id, parseInt($(e.target).val())/100)
            }.bind(this));
         }.bind(this));
      }

      /* Configure annotation stuff */
      $('#annotate-button').click(function()
      {
         historyNavigation.Navigate('EditScoreAnnotationsPage', 'LoadScoreAnnotationScreen', [partition_info])
      }.bind(this));

      /*  Enable metronome */
      Metronome.is_enabled = true;
   },

   LoadDisplayScoreScreen: function(partition_info, pages, is_one_per_page)
   {
      console.log(partition_info);
      console.log(pages);

      /* Save internal data */
      this.partition_info = partition_info;
      this.pages = pages;
      this.is_one_per_page = is_one_per_page;
      this.pdf = false;
      this.mxl = false;
      this.mxl_info = false;
      this.music_xml_player = false;
      this.samples = false;

      /* Retrieve pdf */
      MusicianCafeGetPartitionStream(this.partition_info.id, function(clbk)
      {
         /* Now links can only be used once --> If needed we should request a new one !! */
         MusicianCafeGetPartitionLink(this.partition_info.id, function(url)
         {
            clbk(url);
         }, function(status)
         {
            if (status == 8)
            {
               alert(_('Vous avez atteint votre limite journaliere de telechargement !'));
            }
            else
            {
               alert(_('Une erreur est survenue !'));
            }
         })
      }.bind(this), function(data)
      {
         this.pdf = data;

         /* Check if we retrieve musicXML stuff */
         if (this.partition_info.has_mxl)
         {
            MusicianCafeGetPartitionMXLData(this.partition_info.id, function(r)
            {
               this.mxl = r.MXL_data;
               var new_zip = new JSZip();
               new_zip.loadAsync(r.MXL_info)
               .then(function(zip_2)
               {
                  zip_2.file("info.json").async("string").then(function(data)
                  {
                     this.mxl_info = JSON.parse(data);
                     this.InitShowScore();
                  }.bind(this))
               }.bind(this));
            }.bind(this), function()
            {
               alert('SOAP FAILED')
            })
         }
         else
         {
            this.InitShowScore()
         }

      }.bind(this), function()
      {
         alert('SOAP FAILED')
      })
   }
}
