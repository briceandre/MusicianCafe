"use strict";

function AudioPlayer(sample_id, _on_end_callback, _on_progress_callback)
{
   var context = new (window.AudioContext || window.webkitAudioContext)();
   var sampling_rate = 44100;
   
   var has_started_soundcard = false;
   var has_received_first_sample = false;
   var has_reached_start_pos = false;
   var shall_play = false;
   var current_played_time = false;
   
   var is_first_start = true;
   var on_end_callback = _on_end_callback;
   var on_progress_callback = _on_progress_callback;
   
   var frequency_shift = 1;
   var speed = 1;
   
   var start_pos = 0;
   
   var opus_file = new Opus(sample_id, 
   function(_sampling_rate)
   {
      /* Configure sampling rate */
      sampling_rate = _sampling_rate;
   },
   function(data)
   {
      has_received_first_sample = true;
      phase_vocoder.pushData(data)
   });
         
   var phase_vocoder = new PhaseVocoder(VOCODER_FRAME_SIZE, VOCODER_BUFFER_SIZE, function(data)
   {
      opus_file.RequestData()
   }, OPUS_FETCH_BUFFER_LIMIT)

   this.start = function(_start_pos)
   {
      has_received_first_sample = false;
      has_started_soundcard = true;
      shall_play = true;

      start_pos = _start_pos;
      
      if (is_first_start)
      {
         is_first_start = false;
      }
      else
      {
         opus_file.restart();
         phase_vocoder.reset();
      }
      checkStartNextSample();
   }
   
   this.resume = function()
   {
      shall_play = true;
      current_played_time = false;
      has_received_first_sample = false;
   }
   
   this.stop = function()
   {
      shall_play = false;
   }
   
   this.setSpeed = function(_speed)
   {
      speed = _speed;
      phase_vocoder.setAlpha(speed*frequency_shift)
   }
   
   this.setPitch = function(pitch)
   {
      frequency_shift = Math.pow(2, pitch/12);
      phase_vocoder.setAlpha(speed*frequency_shift)
   }
   
   var startNextSample = function(time)
   {
      var source = context.createBufferSource();
      var myArrayBuffer = context.createBuffer(1, INJECTED_SOUND_DURATION*sampling_rate*frequency_shift, sampling_rate*frequency_shift);

      if (shall_play)
      {
         if (false && !has_reached_start_pos)
         {
            while (Math.floor(phase_vocoder.getInputNbSamples()/sampling_rate) < start_pos)
            {
               var has_data = phase_vocoder.process(myArrayBuffer);
               if (!has_data)
               {
                  return;
               }
            }
            has_reached_start_pos = true;
         }
         
         on_progress_callback(Math.floor(phase_vocoder.getInputNbSamples()/sampling_rate));
         
         var has_data = phase_vocoder.process(myArrayBuffer);
         if (has_received_first_sample && (!has_data))
         {
            shall_play = false;
            on_end_callback();
         }
      }
      else
      {
         /* Fill output buffer with zero */
         var ol = myArrayBuffer.getChannelData(0);
         for (var sampleCounter = 0; sampleCounter < myArrayBuffer.length; sampleCounter++)
         {
            ol[sampleCounter] = 0;
         }
      }

      source.buffer = myArrayBuffer;

      /* Note that context may have been destroyed in race conditions with exit -> avoid a js error... */
      if (context.destination)
      {
         source.connect(context.destination);
         source.start(time);
      }
      
      current_played_time = time
      if (!has_reached_start_pos)
      {
         has_reached_start_pos = true;
      }
   }
   
   var checkStartNextSample = function()
   {
      if (has_started_soundcard)
      {
         var current_time = context.currentTime
         if (!current_played_time)
         {
            startNextSample(current_time)
         }
         else if (current_time >= current_played_time) 
         {
            startNextSample(current_played_time+INJECTED_SOUND_DURATION)
         }
      }
   }
   
   var interval = setInterval(function()
   {
      checkStartNextSample();
   }, INJECTED_SOUND_REFRESH_PERIOD_MS);
   
   this.cleanup = function()
   {
      clearInterval(interval); interval = false;
      opus_file.Exit(); opus_file = false;
      context.close(); context = false;
   }
   
}