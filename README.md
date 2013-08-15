# Bountysource
[![Build Status](https://travis-ci.org/slicebo123/frontend.png)](https://travis-ci.org/slicebo123/frontend)
This repository contains the javascripts, stylesheets and images that power www.bountysource.com.  Our frontend is built using:

- angular.js (javascript framework)
- twitter-bootstrap (stylesheet framework)
- grunt (compiling)
- bower (web components)
- jshint (javascript syntax checking)
- karma (testing)

Please use our [issue tracker](https://github.com/bountysource/frontend/issues) to report any bugs or request new features.  Or, if you're a developer, send us a pull request!

# We :heart: Pull Requests!
Seriously, we really do.  It doesn't matter whether you're fixing a typo or overhauling a major area of the code base.  You will be showered in :thumbsup: :thumbsup: :thumbsup:

# Quickstart Developer Guide
Fork our repository on GitHub, clone it locally, install components and modules, and start the server.

```bash
git clone git@github.com:YOUR_GITHUB_LOGIN/frontend.git bountysource
cd bountysource
sudo npm install -g bower grunt-cli    # recommended
npm install    # installs required node.js modules into node_modules/*
bower install  # installs web components into app/components/*
grunt server   # runs grunt server on http://localhost:9000/
```

