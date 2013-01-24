with (scope('GoogleAnalytics')) {
  initializer(function() {
    window._gaq = window._gaq || [];
    var pluginUrl = '//www.google-analytics.com/plugins/ga/inpage_linkid.js';
    _gaq.push(['_require', 'inpage_linkid', pluginUrl]);
    _gaq.push(['_setAccount', document.location.host.substring(0, 6) === 'www-qa' ? 'UA-37552129-1' : 'UA-36879724-1']);

    // only load the script if on Prod or QA.
    if (document.location.host.match(/bountysource\.com$/)) {
      (function () {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      })();
    }
  });
}