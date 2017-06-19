angular.module('directives')
.directive('taxFormClearBg', function() {
  // Overlay a white rectangle to hide pdf background 
  // When the attr value is: 
  //   Undefined, it matches the position and size of foreground element the attribute is defined on.
  //   A single numeric value, it expands the size foreground element by that amount
  //   Four numeric values separated by commas it is treated as the (unscaled) left, top, width, and height
  return {
   restrict: "A",
    link: function(scope, elem) {
      var formZoom = 1;
      if (scope["formZoom"] > 0)
          formZoom = scope["formZoom"];

      var expand = elem.attr('tax-form-clear-bg') || "0";

      if(expand.indexOf(',') > 0)
        var [l,t,w,h] = expand.split(',').map(function(i){ return i * scope.formZoom; });
      else
        var [l,t,w,h] = [
          (elem.attr("left") * scope.formZoom - parseInt(expand)),
          (elem.attr("top") * scope.formZoom - parseInt(expand)), 
          (elem.attr("width") * scope.formZoom + parseInt(expand) * 2),
          (elem.attr("height") * scope.formZoom + parseInt(expand) * 2)];

      var bg = document.createElement('div');
      var styleStr = 'position:absolute; z-index: 0; background: #fff; ' + 
                     'left: ' + l + 'px; ' + 
                     'top:' + t + 'px; ' + 
                     'width:' + w + 'px;' + 
                     'height:' + h + "px";

      bg.setAttribute('style', styleStr);
      elem.parent().append(bg);
    }
  };
})


