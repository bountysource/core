// Set the style attribute for all the input fields. Most importantly the absolute position to overlay the field on the pdf.
// The value of the tax-form-style attribute is a scoped variable holding the zoom level of the pdf (between 1.5 and 2 is usable - 1.75 matches the layout).
// Possibly rename to tax-form-size or similar
// The directive relies on the left, top, width and height attributes of the element - z-index is optional for fields which need to override the default

angular.module('directives')
  .directive('taxFormStyle', function() {
    function resizeField(elem, zoom) {
      var style = {
        "position": "absolute",
        "z-index": 10
      };

      if(elem.attr('z-index') != null)
          style["z-index"] = elem.attr('z-index')

      if(elem.attr('left') != null)
        style["left"] = elem.attr('left') * zoom + "px";
      
      if(elem.attr('top') != null)
        style["top"] = elem.attr('top') * zoom + "px";
      
      if(elem.attr('width') != null)
        style["width"] = elem.attr('width') * zoom + "px";
      
      if(elem.attr('height') != null)
        style["height"] = elem.attr('height') * zoom + "px";

      var styleStr = Object.keys(style).map(function(key){ return key + ":" + style[key]; }).join('; ');

      elem.attr('style', styleStr);
    }

    return {
      restrict: "A",
      link: function(scope, elem, attrs) {
        var zoomLevel = 1;

        if (scope["formZoom"] > 0)
          zoomLevel = scope["formZoom"];

        resizeField(elem, zoomLevel)
      }
    }
  });

