"use strict";

/* Class used to store the navigation history */
var NavigationHistory =
{
   history: [],
   
   appendPage: function(page, xpath)
   {
      this.history.push({page: page, xpath: xpath});
   },
   
   removePage: function()
   {
      this.history.pop();
   },
   
   resetHistory: function()
   {
      this.history = [];
   },
   
   hasPreviousPage: function()
   {
      return this.history.length > 1;
   },
   
   getCurrentPage: function()
   {
      return this.history[this.history.length-1].page;
   },

   getCurrentXPath: function()
   {
      return this.history[this.history.length-1].xpath;
   }
};
