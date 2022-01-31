"use strict";

var MusicXML = 
{
   osmd: false,
   div: false,
   transpose: false,
   transpose_direction: "",
   instruments_to_keep: false,

   convertToPDF: function(data, transpose, transpose_direction, instruments_to_keep, callback)
   {
      this.init(data, transpose, transpose_direction, instruments_to_keep, function(pdf, nb_pages, info)
      {
         this.cleanup();
         callback(pdf, nb_pages, info);
      }.bind(this))
   },
      
   init: function(data, transpose, transpose_direction, instruments_to_keep, callback)
   {
      /* Just to be sure */
      this.cleanup();
      
      /* Set transposition */
      this.transpose = transpose;
      this.transpose_direction = transpose_direction;
      this.instruments_to_keep = instruments_to_keep;
      
      /* load the div in the document */
      if (!this.div)
      {
         this.div = $('<div id="music-xml-utility-div" style="width: 1200px; visibility: hidden"></div>').appendTo('body');
      }
      
      /* Ensure it is empty */
      this.div.empty();
      
      /* Create the osmd stuff */
      this.osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay('music-xml-utility-div');
      
      /* Set options */
      this.osmd.setOptions(
      {
         backend: "canvas",
         pageFormat: "A4 P",
         onXML: this.onTranspose.bind(this)
      });
      
      /* Load the data */
      this.osmd.load(data).then(function()
      {
         /* Render the partition */
         this.osmd.render();

         /* Generate PDF */
         var doc = new PDFDocument({'autoFirstPage': false});
         var stream = doc.pipe(blobStream());
         
         /* Parse all pages 1032 */
         var pages_info = [];
         var nb_pages = 0;
         for (const page of this.osmd.drawer.graphicalMusicSheet.MusicPages)
         {
            /* Extract image */
            nb_pages++;
            var canvas = $('#osmdCanvasPage'+nb_pages+' canvas')[0]
            var image = canvas.toDataURL("image/png");

            /* Append to PDF */
            doc.addPage({'size': 'A4'})
            doc.image(image, 0, 0, {fit:[595.28, 841.89],align:'center',valign:'center'})

            /* Extract display info */
            var page_systems = [];
            for (const system of page.musicSystems)
            {
               var measures = [];
               for (const measure of system.graphicalMeasures)
               {
                  var locations = [];
                  for (const m of measure)
                  {
                     locations.push({'origin': {'x': m.boundingBox.absolutePosition.x,
                                                'y': m.boundingBox.absolutePosition.y},
                                     'size': {'height': m.boundingBox.size.height,
                                              'width': m.boundingBox.size.width},
                                     'border': {'top': m.boundingBox.borderTop,
                                                'bottom': m.boundingBox.borderBottom,
                                                'left': m.boundingBox.borderLeft,
                                                'right': m.boundingBox.borderRight}})
                  }
                  measures.push({'number': measure[0].measureNumber,
                                 'positions': locations});
               }
               page_systems.push({'measures': measures,
                                  'origin': {'x': system.boundingBox.absolutePosition.x,
                                             'y': system.boundingBox.absolutePosition.y},
                                  'size': {'height': system.boundingBox.size.height,
                                           'width': system.boundingBox.size.width},
                                  'border': {'top': system.boundingBox.borderTop,
                                             'bottom': system.boundingBox.borderBottom,
                                             'left': system.boundingBox.borderLeft,
                                             'right': system.boundingBox.borderRight}})
            }
            pages_info.push({'systems': page_systems,
                             'origin': {'x': page.boundingBox.absolutePosition.x,
                                        'y': page.boundingBox.absolutePosition.y},
                             'size': {'height': page.boundingBox.size.height,
                                      'width': page.boundingBox.size.width},
                             'border': {'top': page.boundingBox.borderTop,
                                        'bottom': page.boundingBox.borderBottom,
                                        'left': page.boundingBox.borderLeft,
                                        'right': page.boundingBox.borderRight},
                             'image_size': {'height': canvas.getBoundingClientRect().height,
                                            'width': canvas.getBoundingClientRect().width}});
         }
         
         var partition_info = {'version': 1,
                               'pages': pages_info,
                               'transpose': this.transpose,
                               'transpose_direction': this.transpose_direction, 
                               'instruments_to_keep': this.instruments_to_keep}

         /* Cleanup doc */
         doc.end();
         stream.on('finish', function()
         {
            var blob = stream.toBlob('application/pdf');
            
            var fileReader = new FileReader();
            fileReader.onload = function(event)
            {
               /* Extract binary stuff */
               var origPdfBytes = String.fromCharCode.apply(null, new Uint8Array(event.target.result));
               
               /* compress the info */
               var zip = new JSZip();
               zip.file("info.json", JSON.stringify(partition_info));
               zip.generateAsync({type:"base64", compression: "DEFLATE"}).then(function (base64)
               {
                  /* Trigger the callback */
                  callback(origPdfBytes, nb_pages, base64);
               });
            }.bind(this);
            fileReader.readAsArrayBuffer(blob);
          }.bind(this));
      }.bind(this));
   },
   
   onTranspose: function(xml)
   {
      /* Filter the instruments that we keep */
      if (this.instruments_to_keep)
      {
         /* Parse XML */  
         var parser = new DOMParser();
         var xmlDoc = parser.parseFromString(xml, "text/xml");

         /* Extract root */
         var root = xmlDoc.getElementsByTagName('score-partwise')[0];

         /* Extract parts list */
         var parts_list = root.getElementsByTagName('part-list')[0];
         var parts = parts_list.getElementsByTagName('score-part');

         /* Extract parts elements */
         var parts_elements = root.getElementsByTagName('part');

         /* Parse each of them */
         for (var i = parts.length-1; i >= 0; i--)
         {
            /* Check if we shall remove is*/
            if (!this.instruments_to_keep.includes(i+1))
            {
               /* retrieve the internal ID and remove it from parts list */
               var part_id = parts[i].id
               parts_list.removeChild(parts[i]);

               /* Remove from parts elements */
               for (var j = 0; j < parts_elements.length; j++)
               {
                  if (parts_elements[j].id == part_id)
                  {
                     root.removeChild(parts_elements[j]);
                  }
               }
            }
         }

         /* Reserialise the xml */
         var serializer = new XMLSerializer();
         xml = serializer.serializeToString(xmlDoc);
      }

      /* Check if we shall transpose */
      if (this.transpose)
      {
         return osmd_transpose.transpose_xml({'transpose_key': this.transpose, 'transpose_direction': this.transpose_direction}, xml);
      }
      else
      {
         return xml;
      }
   },
   
   extractXML: function(mxl, _callback)
   {
      var callback = _callback;
      
      /* Unzip */
      var z = new JSZip();
      z.loadAsync(mxl)
      .then(function(zip)
      {
         /* Read manifest */
         zip.file("META-INF/container.xml").async("string").then(function(data)
         {
            /* Retrieve main file */  
            var main_file = (new DOMParser()).parseFromString(data, "text/xml").getElementsByTagName('rootfile')[0].getAttribute('full-path') ;

            /* Extract it */
            zip.file(main_file).async("string").then(function(data)
            {
               callback(data);
            });
         });
      });
    
   },
   
   getAvailableInstruments: function(mxl, _callback)
   {
      var callback = _callback;
      
      /* Extract XML */
      this.extractXML(mxl, function(xml)
      {
         var result = [];

         var parser = new DOMParser();
         var xmlDoc = parser.parseFromString(xml, "text/xml");

         /* Extract parts list */
         var parts = xmlDoc.getElementsByTagName('score-part');
         for (var i = 0; i < parts.length; i++)
         {
            result.push(parts[i].getElementsByTagName('instrument-name')[0].childNodes[0].nodeValue);
         }
         callback(result);
      }.bind(this))
   },
   
   cleanup: function()
   {
      if (this.osmd)
      {
         this.osmd.clear();
         this.osmd = false;
      }
      if (this.div)
      {
         this.div.remove();
         this.div = false;
      }
   }
}
