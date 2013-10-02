'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/press', {
        templateUrl: 'pages/press/index.html',
        controller: 'PressController'
      });
  }).controller('PressController', function($scope) {

    $scope.articles = [
      { date: '9/17/13', source: 'Opensource.com', title: 'Bountysource CEO talks open source crowdfunding and bounties for developers', href: 'http://opensource.com/business/13/9/bountysource-CEO-interview', author: 'Ginny Skalski' },
      { date: '8/1/13', source: "NetworkWorld's Linux Tycoon", title: 'Open source gets its own crowd-funding site, with bounties included', author: 'Bryan Lunduke', href: 'http://www.networkworld.com/community/node/83569' },
      { date: '7/26/13', source: 'Crowdsourcing.org', title: 'Inside Bountysource, a crowdfunding and challenge site for open-source software', author: 'Eric Blattberg', href: 'http://www.crowdsourcing.org/editorial/inside-bountysource-a-crowdfunding-and-challenge-site-for-open-source-software/27343' },
      { date: '7/24/13', source: 'The Frank Peters Show', title: 'Video: Warren Konkel, Bountysource', author: 'Frank Peters', href: 'http://thefrankpetersshow.com/2013/warren-konkel-bountysource/' },
      { date: '7/19/13', source: 'Venture Village', title: 'Video: Europe’s Business Angel of the Year Dušan Stojanović talks his “super angel” fund, Swedish startup successes and clones', author: 'Michelle Kuepper', href: 'http://venturevillage.eu/video-dusan-stojanovic' },
      { date: '7/18/13', source: 'VentureDeal', title: 'Bountysource Receives Seed Venture Capital Funding', href: 'http://www.venturedeal.com/News/2013/7/18/Bountysource-Receives-Seed-Venture-Capital-Funding' },
      { date: '7/17/13', source: 'Xconomy', title: 'Bountysource Obtains $1,100,000 Seed Funding Round', href: 'http://www.xconomy.com/san-francisco/2013/07/17/bountysource-obtains-1100000-seed-funding-round/' },
      { date: '7/16/13', source: 'Informilo', title: "Europe's Angel of The Year Scores Two New Investments, Lots of Exits", author: 'Jennifer L. Schenker', href: 'http://www.informilo.com/20130715/europes-angel-year-scores-two-new-investments-lots-exits-847' },
      { date: '7/18/13', source: 'Crowdfund Insider', title: 'Bountysource to Crowdfund Open-Source Software', author: 'JD Alois', href: 'http://www.crowdfundinsider.com/2013/07/19075-bountysource-to-crowdfund-open-source-software/' },
      { date: '7/18/13', source: 'Crowdsourcing.org', title: 'Bountysource Raises $1.1 Million for the First Crowdfunding Platform for Open-Source Software Projects', author: 'Benjamin Fossel', href: 'http://www.crowdsourcing.org/document/bountysource-raises-11-million-for-the-first-crowdfunding-platform-for-open-source-software-projects-/27169' },
      { date: '7/17/13', source: 'FinSMEs', title: 'Bountysource raises $1.1 million in seed funding', href: 'http://www.finsmes.com/2013/07/bountysource-raises-1-1m-seed-funding.html' },
      { date: '7/16/13', source: 'Wallstreet Journal', title: 'Bountysource Raises $1.1 Million for the First Crowdfunding Platform for Open-Source Software Projects', href: 'http://online.wsj.com/article/PR-CO-20130716-905630.html?mod=googlenews_wsj' },
      { date: '7/16/13', source: 'Broadway World Geeks', title: 'Bountysource Raises $1.1 Million for the First Crowdfunding Platform for Open-Source Software Projects', href: 'http://geeks.broadwayworld.com/article/Bountysource-Raises-11-Million-for-the-First-Crowdfunding-Platform-for-Open-Source-Software-Projects-20130716' },
      { date: '7/16/13', source: 'Yahoo! Finance', title: 'Bountysource Raises $1.1 Million for the First Crowdfunding Platform for Open-Source Software Projects', href: 'http://finance.yahoo.com/news/bountysource-raises-1-1-million-130000440.html' },
      { date: '7/16/13', source: 'Consumer Electronics Net', title: 'Bountysource Raises $1.1 Million for the First Crowdfunding Platform for Open-Source Software Projects', href: 'http://www.consumerelectronicsnet.com/article/Bountysource-Raises-11-Million-for-the-First-Crowdfunding-Platform-for-Open-Source-Software-Projects--2707978' },
      { date: '7/16/13', source: 'So-Co-IT', title: 'Bountysource Raises $1.1 Million for the First Crowdfunding Platform for Open-Source Software Projects', href: 'http://www.so-co-it.com/post/278779/bountysource-raises-1-1-million-for-the-first-crowdfunding-platform-for-open-source-software-projects.html/' },
      { date: '7/16/13', source: 'i4U', title: 'Bountysource Raises $1.1 Million for the First Crowdfunding Platform for Open-Source Software Projects', href: 'http://www.i4u.com/2013/07/google-inc/platform-software-crowdfunding-first-raises-million-11-bountysource-pr' },
      { date: '7/16/13', source: 'Congoo', title: 'Bountysource Raises $1.1 Million for the First Crowdfunding Platform for Open-Source Software Projects', href: 'http://www.congoo.com/news/2013July16/Bountysource-Raises-Million-Crowdfunding-Platform' }
    ];

  });
