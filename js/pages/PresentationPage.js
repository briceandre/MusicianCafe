"use strict";

var PresentationPage =
{
   InitPresentationScreen: function()
   {
      /* Set title */
      $('#title').text('Accueil')

      /* Set content */
      var html = '<p>TODO</p>';

      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();
   },

   LoadPresentationScreen: function()
   {
      /* Init screen */
      this.InitPresentationScreen();
   }
}
