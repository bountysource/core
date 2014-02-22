angular-bootstrap-colorpicker
=============================

This version contains a native AngularJS directive based on bootstrap-colorpicker jQuery library.<br />
No dependency on jQuery or jQuery plugin is required.<br />

<a href="http://web.hostdmk.net/github/colorpicker_v3/" target="_blank">Demo page (Bootstrap v3.x.x)</a>

Previous releases:
  - <a href="https://github.com/buberdds/angular-bootstrap-colorpicker/tree/2.0">branch 2.0</a> (Bootstrap v2.x.x)
  - <a href="https://github.com/buberdds/angular-bootstrap-colorpicker/tree/1.0.0">branch 1.0</a> if you need a functionality from the original plugin or IE&lt;9 support

Installation
===============================
Copy css/colorpicker.css and js/bootstrap-colorpicker-module.js.
Add a dependency to your app, for instance:
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers', 'colorpicker.module'])

Examples:
===============================

Hex format
```html
<input colorpicker class="span2" type="text" ng-model="your_model" />
```
or
```html
<input colorpicker="hex" class="span2" type="text" ng-model="your_model" />
```

RGB format
```html
<input colorpicker="rgb" class="span2" type="text" ng-model="your_model" />
```

RBGA format
```html
<input colorpicker="rgba" class="span2" type="text" ng-model="your_model" />
```

As non input element
```html
<div colorpicker class="span2" ng-model="your_model"></div>
```

Position of the color picker (top, right, bottom, left).
```html
<input colorpicker colorpicker-position="right" class="span2" type="text" ng-model="your_model" />
```

The color picker in a fixed element
```html
<input colorpicker colorpicker-fixed-position="true" class="span2" type="text" ng-model="your_model" />
```

When using fixed positioning, you can also put the picker into the parent element (this allows more styling control)
```html
<input colorpicker colorpicker-fixed-position="true" colorpicker-parent="true" class="span2" type="text" ng-model="your_model" />
```