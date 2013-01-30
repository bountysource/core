with (scope('GoogleAnalytics')) {
  initializer(function() {
    window._gaq = window._gaq || [];
    var pluginUrl = '//www.google-analytics.com/plugins/ga/inpage_linkid.js';
    _gaq.push(['_require', 'inpage_linkid', pluginUrl]);
    _gaq.push(['_setAccount', document.location.host === 'www.bountysource.com' ? 'UA-36879724-1' : 'UA-36879724-2']);

    // allow compressed utm in params    #somepage?utm=source:medium:term:content:campaign
    var utm = document.location.href.match(/utm=([^&]+)/);
    if (utm) {
      utm = utm[1].split(':');
      var src = 'utm_source='+utm[0]+'&utm_medium='+utm[1]+'&utm_term='+utm[2]+'&utm_content='+utm[3]+'&utm_campaign='+utm[4];
      console.log(src)
      _gaq.push(['_set', 'campaignParams', src ]);
    }

    var ga = document.createElement('script'); ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  });
}