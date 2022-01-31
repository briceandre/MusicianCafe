"use strict";

function OpusFileCache(_sample_id, block_size)
{
   var sample_id = _sample_id;
   var _block_size = block_size;

   var content = [];
   var next_id = 0;

   var current_fetched_offset = 0;

   this.restart = function()
   {
      next_id = 0
   }

   this.getNext = function(callback)
   {
      /* Check if we already have it */
      if (next_id < content.length)
      {
         var l = next_id;
         next_id++;
         callback(content[l]);
         return;
      }
      
      /* Request content of file */
      MusicianCafeGetSampleStream(sample_id, function(clbk)
      {
         /* Now links can only be used once --> If needed we should request a new one !! */
         MusicianCafeGetSampleLink(sample_id, function(url)
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
      }.bind(this), function (stream)
      {
         /* Split stream */
         for (var i = 0, j = stream.length; i < j; i += block_size)
         {
            content.push(stream.slice(i, i+block_size));
         }

         /* Send first one */
         next_id = 1;
         callback(content[0]);
      }, function(){})
   }
}

