function SmartBuffer()
{
   var sub_buffer_collection = []
   var current_offset = 0;
   var current_total_offset = 0;
   
   this.GetTotalOffset = function() {return current_total_offset;}
   this.PushSubBuffer = function(b)
   {
      sub_buffer_collection.push(b)
   }
   
   this.HasAtLeast = function(nb_entries)
   {
      for (var i = 0; i < sub_buffer_collection.length; i++)
      {
         nb_entries = nb_entries - sub_buffer_collection[i].length;
         if (i == 0) nb_entries = nb_entries + current_offset;
         if (nb_entries <= 0) return true;
      }
      return false;
   }
   
   this.reset = function()
   {
      sub_buffer_collection = []
      current_offset = 0;
      current_total_offset = 0;
   }
   
   this.GetData = function(buffer, size)
   {
      var current_sub_buffer_index = 0;
      var current_pos_in_sub_buffer = current_offset;
      for (var i = 0; i < size; i++)
      {
         buffer[i] = sub_buffer_collection[current_sub_buffer_index][current_pos_in_sub_buffer];
         current_pos_in_sub_buffer++;
         if (current_pos_in_sub_buffer >= sub_buffer_collection[current_sub_buffer_index].length)
         {
            current_sub_buffer_index++;
            current_pos_in_sub_buffer = 0;
         }
      }
   }
   
   this.PopData = function(size)
   {
      current_offset += size;
      current_total_offset += size;
      while (current_offset >= sub_buffer_collection[0].length)
      {
         current_offset -= sub_buffer_collection[0].length
         sub_buffer_collection.shift()
      }
   }
}

function PhaseVocoder(frameSize, bufferSize, request_callback, remaining_before_request)
{
   var _frameSize = frameSize || 4096;
   var _pvL = new PhaseVocoderCodec(_frameSize, 44100); _pvL.init();
   var _position = 0;
   var _newAlpha = 1;

   var _midBufL = new CBuffer(Math.round(_frameSize * 2));
   
   var _request_callback = request_callback;
   var _remaining_before_request = remaining_before_request;
  
   var il = new SmartBuffer();
   
   var bufL = new Float32Array(_frameSize);

   this.reset = function()
   {
      il.reset()
   }
   
   this.pushData = function(left)
   {
      for (var i = 0; i < left.length; i++)
      {
         il.PushSubBuffer(left[i])
      }
   }
   
   this.setAlpha = function(newAlpha)
   {
      _newAlpha = newAlpha;
   }
   
   this.getInputNbSamples = function()
   {
      return il.GetTotalOffset();
   }
   
   this.process = function(outputAudioBuffer)
   {
      var result = true;
      
      var sampleCounter = 0;

      var ol = outputAudioBuffer.getChannelData(0);

      while (_midBufL.size > 0 && sampleCounter < outputAudioBuffer.length) 
      {
         var i = sampleCounter++;
         ol[i] = _midBufL.shift();
      }

      if (sampleCounter == outputAudioBuffer.length) return;

      do 
      {
         if ( !il.HasAtLeast(_frameSize))
         {
            /* Check if we have pushed something */
            if (sampleCounter == 0)
            {
               result = false;
            }
            
            /* Fill output buffer with zero */
            for (; sampleCounter < outputAudioBuffer.length; sampleCounter++)
            {
               ol[sampleCounter] = 0;
            }
         }
         else
         {
            il.GetData(bufL, _frameSize)
            
            if (_newAlpha != undefined && _newAlpha != _pvL.get_alpha())
            {
               _pvL.set_alpha(_newAlpha);
               _newAlpha = undefined;
            }
   
            /* LEFT */
            _pvL.process(bufL, _midBufL);
            for (var i=sampleCounter; _midBufL.size > 0 && i < outputAudioBuffer.length; i++)
            {
               ol[i] = _midBufL.shift();
            }
   
            sampleCounter += _pvL.get_synthesis_hop();
   
            var popped_data = _pvL.get_analysis_hop();
            _position += popped_data
            il.PopData(popped_data)
         }
      }
      while (sampleCounter < outputAudioBuffer.length);

      /* Check if we shall request more data */
      if ( !il.HasAtLeast(_remaining_before_request))
      {
         _request_callback();
      }
      
      return result;
   }
}