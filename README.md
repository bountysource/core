# Bountysource
[![Visit our IRC channel](https://kiwiirc.com/buttons/irc.freenode.net/Bountysource.png)](https://kiwiirc.com/client/irc.freenode.net/?nick=Bountyuser|?#Bountysource)


[![Build Status](https://travis-ci.org/bountysource/frontend.png?branch=master)](https://travis-ci.org/bountysource/frontend)
[![Coverage Status](https://coveralls.io/repos/bountysource/frontend/badge.png)](https://coveralls.io/r/bountysource/frontend)

This repository contains the javascripts, stylesheets and images that power www.bountysource.com.  

Our frontend is built using:

- angular.js (javascript framework)
- twitter-bootstrap (stylesheet framework)
- grunt (compiling)
- bower (web components)
- jshint (javascript syntax checking)
- karma (testing)

Please use our [issue tracker](https://github.com/bountysource/frontend/issues) to report any bugs or request new features.  Or, if you're a developer, send us a pull request!

# We :heart: Pull Requests!
Seriously, we really do.  It doesn't matter whether you're fixing a typo or overhauling a major area of the code base.  You will be showered in :thumbsup: :thumbsup: :thumbsup:

## Quickstart Developer Guide
Fork our repository on GitHub, clone it locally, install components and modules, and start the server.

```bash
git clone git@github.com:YOUR_GITHUB_LOGIN/frontend.git bountysource
cd bountysource
sudo npm install -g bower grunt-cli    # recommended
npm install       # installs required node.js modules into node_modules/*
bower install     # installs web components into app/components/*
grunt server      # runs grunt server on http://localhost:9000/
grunt test:travis # checks if your changed didn't break anything
```

## Staging vs. Production
We have two APIs available:
- https://api.bountysource.com/ - This is our production API and should be used for real transactions.  This is the API endpoint that powers www.bountysource.com.
- https://staging-api.bountysource.com/ - This is our test API and should be used for all testing purposes.  Our staging environment often contains code that hasn't been fully tested.  Paypal and Google Wallet are in "sandbox" mode which means financial transactions aren't real.  User data has been anonymized (emails, passwords, etc).
