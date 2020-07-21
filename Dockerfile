FROM ruby:2.7.0

RUN apt-get update -qq && apt-get install -y nodejs postgresql-client

# Install apt based dependencies required to run Rails as
# well as RubyGems. As the Ruby image itself is based on a
# Debian image, we use apt-get to install those.
# ---
# Also, let's enable backports and install sphinxsearch
# so we get searchd, needed to generate Sphinx config.
# RUN echo "deb http://ftp.debian.org/debian jessie-backports main" \
#    > /etc/apt/sources.list.d/backports.list; \
#    apt-get update && apt-get install -y \
#    build-essential \
#    sphinxsearch

RUN mkdir -p /app
WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . ./

EXPOSE 3000

CMD ["rails", "s", "-b", "0.0.0.0"]
