"use strict";

var DisplayPieceDetailsPage =
{
    pieces: false,

   InitDisplayPieceDetailsScreen: function()
   {
      $('#title').text(_('Morceau : ')+this.piece_name);

      /* Set content */
      var html = '<div data-role="collapsible-set" data-theme="c" data-content-theme="d">';
      
      if (this.samples.length > 0)
      {
         html += '<div data-role="collapsible" data-collapsed="false" data-collapsed-icon="microphone" data-expanded-icon="microphone"><h3>'+_('Enregistrements')+'</h3>';
         this.samples.forEach(function(k)
         {
            html += '<button sample_info="'+btoa(JSON.stringify(k))+'" class="ui-btn sample-link">'+htmlentities(k.name+' ('+k.piece_name+', '+k.composer_name+')')+'</button>';
         }.bind(this));
         html += '</div>';
      }
      
      if (this.partitions.length > 0)
      {
         html += '<div data-role="collapsible" data-collapsed="false" data-collapsed-icon="music" data-expanded-icon="music"><h3>'+_('Partitions')+'</h3>';
         this.partitions.forEach(function(k)
         {
            html += '<button partition_info="'+btoa(JSON.stringify(k))+'" class="ui-btn partition-link">'+htmlentities(k.name)+'</button>';
         })
         html += '</div>';
      }
      
      html += '<div data-role="collapsible" data-collapsed="false" data-collapsed-icon="gear" data-expanded-icon="gear"><h3>'+_('Edition')+'</h3>';
      html += ''
           +'<button id="add-sample" class="ui-btn">'+_('Effectuer un enregistrer')+'</button>'
           +'<button id="load-sample" class="ui-btn">'+_('Charger un enregistrement')+'</button>'
           +'<button id="load-score" class="ui-btn">'+_('Charger une partition PDF')+'</button>'
           +'<button id="load-musicxml" class="ui-btn">'+_('Charger une partition MusicXML')+'</button>'
      html += '</div>';
      
      html += '</div>';
           
      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();

      /* Set handlers */
      $('.sample-link').click(function(e)
      {
         historyNavigation.Navigate('DisplaySamplePage', 'LoadDisplaySampleScreen', [JSON.parse(atob($(e.target).attr('sample_info')))]);
      }.bind(this))

      $('.partition-link').click(function(e)
      {
         historyNavigation.Navigate('SelectPartitionScrollingPage', 'LoadSelectPartitionScrollingScreen', [JSON.parse(atob($(e.target).attr('partition_info')))]);
      }.bind(this))

      $('#add-sample').click(function(e)
      {
         historyNavigation.Navigate('AcquireSamplePage', 'LoadAcquireSampleScreen', [this.piece_id, this.piece_name, this.composer_id, this.composer_name, this.album_id, this.album_name]);
      }.bind(this));

      $('#load-sample').click(function(e)
      {
         historyNavigation.Navigate('LoadSamplePage', 'LoadLoadSampleScreen', [this.piece_id, this.piece_name, this.composer_id, this.composer_name]);
      }.bind(this));

      $('#load-score').click(function(e)
      {
         historyNavigation.Navigate('LoadPartitionPage', 'LoadLoadPartitionScreen', [this.piece_id, this.piece_name, this.composer_id, this.composer_name, this.album_id, this.album_name]);
      }.bind(this));

      $('#load-musicxml').click(function(e)
      {
         historyNavigation.Navigate('LoadPartitionPage', 'LoadLoadMusicXMLScreen', [this.piece_id, this.piece_name, this.composer_id, this.composer_name, this.album_id, this.album_name]);
      }.bind(this));
   },

   LoadDisplayPieceDetailsScreen: function(piece_id, piece_name, composer_id, composer_name, album_id, album_name)
   {
      this.piece_id = piece_id;
      this.piece_name = piece_name;
      this.composer_name = composer_name;
      this.composer_id = composer_id;
      this.album_id = album_id;
      this.album_name = album_name;
      this.samples = false;
      this.partitions = false;

      MusicianCafeGetSamplesAndPartitionsByPiece(this.piece_id, function(samples, partitions)
      {
         this.samples = samples;
         this.partitions = partitions;
         this.InitDisplayPieceDetailsScreen();
      }.bind(this), function()
      {
         alert('SOAP FAILED')
      })
   }
}
