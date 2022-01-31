"use strict";

var selectOwnPage =
{
   samples: [],
   composers: false,

   InitselectOwnScreen: function()
   {
      /* set title */
      if (this.type == this.display_type.Shared)
      {
         $('#title').text(_('Partages'));
      }
      else if (this.type == this.display_type.Favorite)
      {
         $('#title').text(_('Mes favoris'));
      }
      else if (this.type == this.display_type.Moderation)
      {
         $('#title').text(_('Enregistrements sous moderation'));
      }
      else
      {
         $('#title').text(_('Mes enregistrements'));
      }

      /* Set content */
      var html = '<div data-role="collapsible-set" data-theme="c" data-content-theme="d">';
      if (this.samples.length > 0)
      {
         html += '<div data-role="collapsible" data-collapsed="false" data-collapsed-icon="microphone" data-expanded-icon="microphone"><h3>'+_('Enregistrements')+'</h3>';
         this.samples.forEach(function(k)
         {
            var display_name = htmlentities(k.name);
            if ((k.piece_name.length > 0) || (k.composer_name.length > 0))
            {
               display_name += ' (';
               if (k.piece_name.length > 0)
               {
                  display_name += htmlentities(k.piece_name);
               }
               if ((k.piece_name.length > 0) && (k.composer_name.length > 0))
               {
                  display_name += ', '
               }
               if (k.composer_name.length > 0)
               {
                  display_name += htmlentities(k.composer_name);
               }
               display_name += ')';
            }
            
            html += '<button sample_info="'+utoa(JSON.stringify(k))+'" class="ui-btn sample-link">'+display_name+'</button>';
         }.bind(this));
         html += '</div>';
      }
      if (this.partitions.length > 0)
      {
         html += '<div data-role="collapsible" data-collapsed="false" data-collapsed-icon="music" data-expanded-icon="music"><h3>'+_('Partitions')+'</h3>';
         this.partitions.forEach(function(k)
         {
            var display_name = htmlentities(k.name);
            if ((k.piece_name.length > 0) || (k.composer_name.length > 0))
            {
               display_name += ' (';
               if (k.piece_name.length > 0)
               {
                  display_name += htmlentities(k.piece_name);
               }
               if ((k.piece_name.length > 0) && (k.composer_name.length > 0))
               {
                  display_name += ', '
               }
               if (k.composer_name.length > 0)
               {
                  display_name += htmlentities(k.composer_name);
               }
               display_name += ')';
            }
            
            html += '<button partition_info="'+utoa(JSON.stringify(k))+'" class="ui-btn partition-link">'+display_name+'</button>';
         }.bind(this));
         html += '</div>';
      }
      
      html += '</div>';

      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();

      /* Set handlers */
      $('.sample-link').click(function(e)
      {
         historyNavigation.Navigate('DisplaySamplePage', 'LoadDisplaySampleScreen', [JSON.parse(atou($(e.target).attr('sample_info'))), this.type == this.display_type.Moderation]);
      }.bind(this))

      $('.partition-link').click(function(e)
      {
         historyNavigation.Navigate('SelectPartitionScrollingPage', 'LoadSelectPartitionScrollingScreen', [JSON.parse(atou($(e.target).attr('partition_info')))]);
      }.bind(this))
   },

   display_type: Object.freeze({"Own":1, "Shared":2, "Favorite":3, "Moderation": 4}),

   LoadselectOwnScreen: function(type)
   {
      /* Retrieve all own samples */
      this.samples = false;
      this.partitions = false;
      this.type = type;

      var func = MusicianCafeGetSamples;
      if (this.type == this.display_type.Shared)
      {
         func = MusicianCafeGetSharedSamplesAndPartitions;
      }
      else if (this.type == this.display_type.Favorite)
      {
         func = MusicianCafeGetFavoriteSamplesAndPartitions;
      }
      else if (this.type == this.display_type.Moderation)
      {
         func = MusicianCafeGetSamplesForModeration;
      }

      func(function(samples, partitions)
      {
         this.samples = samples;
         if (partitions) this.partitions = partitions;
         else this.partitions = [];
         this.InitselectOwnScreen();
      }.bind(this), function()
      {
         alert('SOAP FAILED')
      })
   }
}
