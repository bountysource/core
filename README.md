# Bountysource
[![Bountysource](https://www.bountysource.com/badge/team?team_id=1&style=bounties_posted)](https://www.bountysource.com/teams/bountysource/bounties?utm_source=Bountysource&utm_medium=shield&utm_campaign=bounties_posted) [![Build Status](https://travis-ci.org/bountysource/core.svg?branch=master)](https://travis-ci.org/bountysource/core) [![IRC Network](https://img.shields.io/badge/irc-%23bountysource-blue.svg "IRC Freenode")](https://webchat.freenode.net/?channels=bountysource)

If you want to make Bountysource.com better, you've come to the right place.

## Bountysource needs your help!

Bountysource is run by volunteers, so development activity can be sporadic (to put it nicely).

### "How can I help?"

#### ...with money

* [Contribute to our Bountysource Salt campaign](https://salt.bountysource.com/teams/bountysource)
* [Post bounties on Issues](https://www.bountysource.com/teams/bountysource/issues?tracker_ids=47) that matter to you

#### ...with code

* Start by reading our Wiki's [How to Contribute](https://github.com/bountysource/core/wiki/How-to-Contribute)

* There are a number of high priority issues that would help the core team, such as:


* Looking for some easier tasks to get started?


# Developer Resources

* [Top Feature Requests](https://www.bountysource.com/teams/bountysource/issues)
* [API Docs](http://bountysource.github.io/)

## Local Development Environment (OS X)
```
# dependencies
brew install rbenv
brew install mysql
brew install postgresql

# checkout latest code
git clone git@github.com:bountysource/core.git bountysource-core
cd bountysource-core

# make sure you're running ruby 2.7.0 (if not, mess with rbenv)
ruby -v

# install Gemfile
gem install bundler
bundle install

# setup ENV
cp .env.dev .env
rake db:setup

# start server
./bin/rails s
open http://localhost:3000/
```

### Hostnames for local development
We need different hostnames, so by default we use these:
* http://localhost:3000/ - bountysource
* http://127.0.0.1:3000/ - salt
* http://0.0.0.0:3000/ - api

Alternatively, you can add entries to `/etc/hosts` and change the hostnames in your `.env` file:
```
127.0.0.1 www.bountysource.local api.bountysource.local salt.bountysource.local
```

### Running tests
```
RAILS_ENV=test rake db:create
./bin/rake
```

## Local Development Environment with Docker (deprecated)

For self-hosting, you will need [Docker](https://www.docker.com) and [Docker Compose](https://docs.docker.com/compose/).

The following was tested on Ubuntu 16.04 LTS. It'll likely work very similar on other Linux distros.

First tip, don't bother with the Docker or Docker Compose packages that your distro provides (too old, superseded).

Simply install from upstream. To install Docker, do

```console
curl -sSL https://get.docker.com | sh
```

To run Docker without superuser rights (`sudo`):

```console
sudo usermod -aG docker $USER
```

Then install Python virtualenv:

```console
sudo apt-get install python-virtualenv
```

Create a new virtualenv and install Docker Compose into that:

```console
virtualenv ~/docker-compose
source ~/docker-compose/bin/activate
pip install docker-compose
```

Here are the versions I get:

```console
(cpy361_6) oberstet@thinkpad-t430s:~/scm/oberstet/bountysource_core$ docker --version
Docker version 17.05.0-ce, build 89658be
(cpy361_6) oberstet@thinkpad-t430s:~/scm/oberstet/bountysource_core$ docker-compose --version
docker-compose version 1.13.0, build 1719ceb
```

Now pull and build all required Docker images:

```console
docker-compose -f docker-compose.yml build
```

Then start the Docker containers relevant for the service:

```console
docker-compose -f docker-compose.yml up -d
```

This should start 3 Docker containers (Bountysource, PostgreSQL and Sphinx):

```console
(cpy361_6) oberstet@thinkpad-t430s:~/scm/oberstet/bountysource_core$ docker ps
CONTAINER ID        IMAGE                           COMMAND                  CREATED             STATUS              PORTS                    NAMES
04599623589b        bountysourcecore_bountysource   "rails s"                11 minutes ago      Up 11 minutes       0.0.0.0:3000->3000/tcp   bountysource
27157a0c1ec0        leodido/sphinxsearch:2.2.9      "searchd.sh"             11 minutes ago      Up 11 minutes       9306/tcp, 9312/tcp       sphinx
45c0202dd08b        postgres                        "docker-entrypoint..."   11 minutes ago      Up 11 minutes       5432/tcp                 pgsql
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the Bountysource start page, something like [this](http://i.imgur.com/iAPoCf4.png).


### Running the unit tests

To run the unit tests:

```console
docker-compose -f docker-compose.yml -f tasks.yml up test
```

You should see something like this in the end:

```console
(cpy361_6) oberstet@thinkpad-t430s:~/scm/3rdparty/bountysource_core$ docker-compose -f docker-compose.yml -f tasks.yml up test
Starting pgsql ...
Starting pgsql ... done
Starting sphinx ...
Starting sphinx ... done
Starting bountysourcecore_test_1 ...
Starting bountysourcecore_test_1 ... done
Attaching to bountysourcecore_test_1
test_1          |

.. lots of output (snipped) ..

test_1          | Finished in 2 minutes 48.5 seconds (files took 7.23 seconds to load)
test_1          | 1239 examples, 0 failures, 13 pending
test_1          |
bountysourcecore_test_1 exited with code 0
```
