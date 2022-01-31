"use strict";

var mainPage =
{
   InitMainScreen: function()
   {
      /* Set title */
      $('#title').text('Accueil')

      /* Set content */
      var html = '<button id="favorite-link" class="ui-btn">'+_('Mes favoris')+'</button>'
                +'<button id="shared-link" class="ui-btn">'+_('Partages')+'</button>'
                +'<button id="by-composer-link" class="ui-btn">'+_('Par Compositeur')+'</button>'
                +'<hr/>'
                +'<button id="tuner-link" class="ui-btn">'+_('Accordeur')+'</button>';
      if (logInfo.getInfo().site_moderator)
      {
         html += '<hr/>'
              +'<button id="moderation-link" class="ui-btn">'+_('Enregistrements sous moderation')+'</button>'
      }

      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();

      /* Set handlers */
      $('#own-link').click( function(){historyNavigation.Navigate('selectOwnPage', 'LoadselectOwnScreen', [selectOwnPage.display_type.Own])});
      $('#favorite-link').click( function(){historyNavigation.Navigate('selectOwnPage', 'LoadselectOwnScreen', [selectOwnPage.display_type.Favorite])});
      $('#shared-link').click( function(){historyNavigation.Navigate('selectOwnPage', 'LoadselectOwnScreen', [selectOwnPage.display_type.Shared])});
      $('#moderation-link').click( function(){historyNavigation.Navigate('selectOwnPage', 'LoadselectOwnScreen', [selectOwnPage.display_type.Moderation])});
      $('#by-composer-link').click( function(){historyNavigation.Navigate('SelectByComposer', 'LoadSelectByComposerScreen', [])});
      $('#by-composer-link').click( function(){historyNavigation.Navigate('SelectByComposer', 'LoadSelectByComposerScreen', [])});
      $('#tuner-link').click(function(){historyNavigation.Navigate('tunerPage', 'LoadTunerScreen', [])});
   },

   LoadMainScreen: function()
   {
      /* Init screen */
      this.InitMainScreen();
   }
}
