FROM ruby:2.7.0

# Install apt based dependencies required to run Rails as
# well as RubyGems. As the Ruby image itself is based on a
# Debian image, we use apt-get to install those.
# ---
# Also, let's enable backports and install sphinxsearch
# so we get searchd, needed to generate Sphinx config.
RUN apt-get update -qq && apt-get install -y nodejs postgresql-client

RUN mkdir -p /app
WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . ./

EXPOSE 3000

# The default command to run when the container starts.
CMD ["rails", "s", "-b", "0.0.0.0"]
