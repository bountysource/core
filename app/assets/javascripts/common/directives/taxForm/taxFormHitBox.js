angular.module('directives')
.directive('taxFormHitBox', function() {
  return {
    restrict: "A",
    link: function(scope, elem) {
      // make the label for checkboxes on the fw9 form clickable
      // requires left and right attrs on the element using the directive 
      // the tax-form-hit-box attr value is the "width,height" of the clickable area
      var hit_box_dims = elem.attr('tax-form-hit-box');

      if(!hit_box_dims) {
        console.log("Need width,height settings for hit-box directive on '" + elem.attr("name") + "'");
        return;
      }

      var [hit_box_width,hit_box_height] = hit_box_dims.split(',')

      var bg = document.createElement('div');

      var styleStr = 'position:absolute; z-index: 2; ' + 
                     'left: ' + (elem.attr("left") * scope.formZoom)  + 'px; ' + 
                     'top:' + (elem.attr("top") * scope.formZoom) + 'px; ' + 
                     'width:' + (parseInt(hit_box_width) * scope.formZoom) + 'px;' + 
                     'height:' + (parseInt(hit_box_height) * scope.formZoom) + "px";

      bg.setAttribute('style', styleStr);
      elem.parent().append(bg);

      angular.element(bg).on('click', function() { elem[0].click(); })
    }
  }
});

