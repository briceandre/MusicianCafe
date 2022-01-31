console.log('Worker : init 1 ')

self.importScripts('/js/audio/opus/opus-stream-decoder.js');

self.decoder = new OpusStreamDecoder({onDecode});

console.log('Worker : init 2 ')

self.current_sample_rate = false
self.buffer_duration = 2
self.current_place_in_buffer = 0;
self.nb_samples_in_buffer = 0;
self.current_reception_left = false
self.current_reception_right = false

function FetchNextChunk(stream)
{
   console.log('fetched')
   
   /* Convert strema in Uint8 buffer */
   var raw = atob(stream);
   var rawLength = raw.length;
   if (raw.length <= 0) return;

   var array = new Uint8Array(new ArrayBuffer(rawLength));
   for (var i = 0; i < rawLength; i++)
   {
     array[i] = raw.charCodeAt(i);
   }

   /* Decode the stream */
   async function process()
   {
      /* Send in decoder */
      await self.decoder.ready;
      self.decoder.decode(array);
      
      /* Send notification for finish */
      postMessage({type: 'end'});
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
      console.log('BAE : '+self.nb_samples_in_buffer+', '+self.current_sample_rate+', '+self.buffer_duration)
      
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
         console.log('Push '+self.current_place_in_buffer+', '+current_sample+', '+self.nb_samples_in_buffer)
         postMessage({type: 'data', 
                      left : self.current_reception_left, 
                      right: self.current_reception_right,
                      sampling_rate: self.current_sample_rate});
         
         self.current_place_in_buffer = 0
      }
   }
}

onmessage = async (e) => {
   console.log('Worker : received new request');

   FetchNextChunk(e.data);
}

console.log('Worker : init end ')
