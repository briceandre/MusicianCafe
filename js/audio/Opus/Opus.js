"use strict";

function Opus(sample_id, on_init_callback, on_end_fetch_callback)
{
   /* Perform initialisation */
   var initialised = false;
   var file_cache = new OpusFileCache(sample_id, OPUS_RAW_BUFFER_SIZE);
   var worker = false;
   if (window.music_play_debug)
   {
      worker = new Worker('/js/audio/Opus/worker/OpusDecodingWorker.js?version='+window.music_play_js_version);
   }
   else
   {
      worker = new Worker('/js/compressed/OpusDecodingWorker-min.js?version='+window.music_play_js_version);
   }
   var in_command = false;
   var local_data = [];

   /* set handlers */
   worker.onmessage = function(e) 
   {
      if (e.data.type == 'data_decoded')
      {
         if (!initialised)
         {
            initialised = true;
            on_init_callback(e.data.bitrate)
         }
         local_data.push(e.data.samples)
      }
      else if (e.data.type == 'data_result')
      {
         in_command = false;
         on_end_fetch_callback(local_data);
      }
   }
   
   this.restart = function()
   {
      file_cache.restart()
      worker.postMessage({type: 'reset'});
      in_command = false;
   }
   
   this.Exit = function()
   {
      worker.terminate();
      worker = false;
   }
   
   this.RequestData = function()
   {
      if (in_command)
      {
         return;
      }

      /* Reset reception buffer */
      local_data = [];

      in_command = true;
      file_cache.getNext(function(stream)
      {
         if (worker)
         {
            worker.postMessage({type: 'data', data: stream});
         }
      }.bind(this))
   }
   
   this.RequestData();
}

Opus.CanBeUsed = function()
{
   const supported = (() =>
   {
      try {
          if (typeof WebAssembly === "object"
              && typeof WebAssembly.instantiate === "function") {
              const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
              if (module instanceof WebAssembly.Module)
                  return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
          }
      } catch (e) {
      }
      return false;
  })();
   return supported;
}
