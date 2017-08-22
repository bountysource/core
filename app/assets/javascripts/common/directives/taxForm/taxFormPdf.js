angular.module('directives')
.directive('taxFormPdf', function() {
  var zoomLevel = 1;

  function removePdfsFrom(elem) {
    var canvas = elem.find('canvas');

    for(var i = 0; i < canvas.length; i++) {
      canvas.remove();
    }
  }

  function loadPdf(scope, elem, load_file) {
    removePdfsFrom(elem)

    PDFJS.getDocument(load_file).then(function(pdfDoc){
      function render(page, page_num){
        var viewport = page.getViewport(zoomLevel);
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        
        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        elem.append(canvas);

        page.render(renderContext);
      }

      for(var num = 1; num <= pdfDoc.numPages; num++) {
          pdfDoc.getPage(num).then(render, num);
      }
    })
  }

  

  return {
    restrict: "A",
    link: function(scope, elem, attrs) {
      var script = document.createElement('script');
      script.src = '/assets/pdfjs/build/pdf.js';
      var loaded = false;
      
      if(attrs.taxFormPdfZoom && scope[attrs.taxFormPdfZoom] > 0)
        zoomLevel = scope[attrs.taxFormPdfZoom];

      scope.$watch(elem.attr('tax-form-pdf'), function(newVal, oldVal) {
        if(loaded && newVal != oldVal)
          loadPdf(scope, elem, newVal);
      });

      script.addEventListener('load', function() {
        loaded = true;
        loadPdf(scope, elem, scope[elem.attr('tax-form-pdf')]);
      });

      elem.append(script);
    },
  };

});