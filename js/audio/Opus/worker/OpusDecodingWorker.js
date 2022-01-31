"use strict";

/* Extract arguments */
var parameters = {}
location.search.slice(1).split("&").forEach( function(key_value) { var kv = key_value.split("="); parameters[kv[0]] = kv[1]; })

var version = parameters['version'];

/* Import libraries */

/* ############### BEGIN IMPORT ################# */
self.importScripts('/js/audio/config.js?v='+version);
self.importScripts('/js/audio/Opus/stream-decoder/opus-stream-decoder.js?v='+version);
/* ###############  END IMPORT  ################# */

self.decoder = new OpusStreamDecoder({onDecode});

function Reset()
{
   self.current_sample_rate = false
   self.buffer_duration = OPUS_DECODING_SOUND_BUFFER_DURATION
   self.current_place_in_buffer = 0;
   self.nb_samples_in_buffer = 0;
   self.current_reception_left = false
   self.current_reception_right = false
}
Reset()

function FetchNextChunk(stream)
{
   var array = stream;

   /* Decode the stream */
   async function process()
   {
      /* Send in decoder */
      await self.decoder.ready;
      self.decoder.decode(array);
      
      /* Send notification for finish */
      postMessage({type: 'data_result'});
   }
   process()
}

function onDecode({left, right, samplesDecoded, sampleRate})
{
   /* Check if we shall reset buffer */
   if (self.current_sample_rate != sampleRate)
   {
      self.current_sample_rate = sampleRate;
      
      self.current_place_in_buffer = 0;
      self.nb_samples_in_buffer = self.current_sample_rate*self.buffer_duration
     
      self.current_reception_left = new Float32Array(self.nb_samples_in_buffer);
      self.current_reception_right = new Float32Array(self.nb_samples_in_buffer);
   }
 
   /* Fill buffer */
   for (var current_sample = 0; current_sample < left.length; current_sample++)
   {
      /* Push in buffer */
      self.current_reception_left[self.current_place_in_buffer] = left[current_sample];
      self.current_reception_right[self.current_place_in_buffer] = right[current_sample];
      
      self.current_place_in_buffer++;
      
      if (self.current_place_in_buffer >= self.nb_samples_in_buffer)
      {
         postMessage({type: 'data_decoded', 
                      samples : self.current_reception_left, 
                      bitrate: self.current_sample_rate});
         
         self.current_place_in_buffer = 0
      }
   }
}

onmessage = async (e) => 
{
   if (e.data.type == 'data')
   {
      FetchNextChunk(e.data.data);
   }
   else if (e.data.type == 'reset')
   {
      Reset()
   }
}
