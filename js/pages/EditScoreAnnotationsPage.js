"use strict";

var EditScoreAnnotationsPage =
{
   InitScoreAnnotationScreen: function()
   {
      /* Set title */
      $('#title').text('Annotation de la partition')

      /* Set content */
      var html = '<p>TODO</p>';
      
      /* Insert html */
      $('#main_page_content').html(html);
      $('#main_page_content').enhanceWithin();
   },

   LoadScoreAnnotationScreen: function()
   {
      /* Init screen */
      this.InitScoreAnnotationScreen();
   }
}
