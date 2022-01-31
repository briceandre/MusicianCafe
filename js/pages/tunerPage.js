"use strict";

var tunerPage =
{
   InitTunerScreen: function()
   {
      /* Record instance */
      this.audio_context = false;
      this.src = false;
      
      historyNavigation.registerOnLeave(function()
      {
         if (this.src)
         {
            this.src.disconnect();
            this.src = false;
         }               
         if (this.src)
         {
            this.analyser.disconnect()
            this.analyser = false;
         }
         if (this.audio_context)
         {
            this.audio_context.close();
            this.audio_context = false;
         }
      }.bind(this))

      let instance = this;
      
      /* Set title */
      $('#title').text('Accordeur')
      
      var html = '<div>'
                +'   <div id="tunerGauge" class="gauge" style="margin: 0 auto;--gauge-value:0;width:200px;height:200px;">'
                +'      <div class="ticks">'
                +'          <div class="tithe" style="--gauge-tithe-tick:1;"></div>'
                +'          <div class="tithe" style="--gauge-tithe-tick:2;"></div>'
                +'          <div class="tithe" style="--gauge-tithe-tick:3;"></div>'
                +'          <div class="tithe" style="--gauge-tithe-tick:4;"></div>'
                +'          <div class="tithe" style="--gauge-tithe-tick:6;"></div>'
                +'          <div class="tithe" style="--gauge-tithe-tick:7;"></div>'
                +'          <div class="tithe" style="--gauge-tithe-tick:8;"></div>'
                +'          <div class="tithe" style="--gauge-tithe-tick:9;"></div>'
                +'          <div class="min"></div>'
                +'          <div class="mid"></div>'
                +'          <div class="max"></div>'
                +'      </div>'
                +'      <div class="tick-circle"></div>'
                +'      <div class="needle">'
                +'          <div class="needle-head"></div>'
                +'      </div>'
                +'      <div class="labels">'
                +'          <div class="value-label"></div>'
                +'      </div>'
                +'   </div>'
                +'</div>';
      
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();

      let AudioContext = (window.AudioContext|| window.webkitAudioContext);

      this.audio_context = new AudioContext();
      instance.analyser = this.audio_context.createAnalyser();
      instance.analyser.fftSize = 4096;
      let buf = new Uint8Array(instance.analyser.frequencyBinCount);

      let notes = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"]

      // We use an equal-tempered scale with La4 at 440Hz.
      let do0 = 16.35;

      let draw = () => 
      {
         if (!instance.audio_context)
         {
            return;
         }

         instance.analyser.getByteTimeDomainData(buf);
         
         let min = 99999;
         let sum = 0.0;
         let minlag = 0;
         for (let i = 1; i < buf.length/2; i++)
         {
            let corr = 0;
            for (let j = 0; j < buf.length/2; j++)
            {
               corr += (buf[j] - buf[j+i]) * (buf[j] - buf[j+i]) 
            }
            sum += corr;

            let ncorr = corr / (sum / i);

            if (ncorr < 0.1 && ncorr <= min) 
            {
               min = ncorr;
            }
            if (minlag == 0 && ncorr > min)
            {
               minlag = i - 1;
            }
         }

         if (minlag !== 0) 
         {
            let freq = this.audio_context.sampleRate/minlag;

            let ratioToDo0 = 12 * Math.log2(freq/do0);

            let note = notes[Math.round(ratioToDo0) % 12];
            let octave = Math.floor(Math.round(ratioToDo0)/12);
            let cents = Math.floor(ratioToDo0 * 100) - (Math.round(ratioToDo0) * 100);

            
            document.getElementById('tunerGauge').style.setProperty('--gauge-display-value', cents+50);
            document.getElementById('tunerGauge').style.setProperty('--gauge-value', cents+50);
            $(".value-label").html(note+octave)

            function getColor(value)
            {
               if (value < 0)
               {
                  value = -value;
               }
               value = 1-(value / 50);
               var hue=((value)*120).toString(10);
               return ["hsl(",hue,",100%,50%)"].join("");
            }
            document.getElementById('tunerGauge').style.backgroundColor=getColor(cents);
         }

         setTimeout(draw, 250);
      }

      navigator.mediaDevices.getUserMedia({audio: true}).then((s) =>
      {
         instance.src = this.audio_context.createMediaStreamSource(s)
         instance.src.connect(instance.analyser)
         setTimeout(draw, 250);
      }).catch((err) => {})
   },

   LoadTunerScreen: function()
   {
      /* Init screen */
      this.InitTunerScreen();
   }
}
