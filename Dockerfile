FROM ruby:2.7.0

# Install apt based dependencies required to run Rails as
# well as RubyGems. As the Ruby image itself is based on a
# Debian image, we use apt-get to install those.
# ---
# Also, let's enable backports and install sphinxsearch
# so we get searchd, needed to generate Sphinx config.
RUN apt-get update -qq && apt-get install -y nodejs postgresql-client

# Configure the main working directory. This is the base
# directory used in any further RUN, COPY, and ENTRYPOINT
# commands.
RUN mkdir -p /app
WORKDIR /app

# Copy the Gemfile as well as the Gemfile.lock and install
# the RubyGems. This is a separate step so the dependencies
# will be cached unless changes to one of those two files
# are made.
COPY Gemfile Gemfile.lock ./
RUN bundle install

# Copy the main application.
COPY . ./

# Expose port 3000 to the Docker host, so we can access it
# from the outside.
EXPOSE 3000

# The default command to run when the container starts.
CMD ["rails", "s", "-b", "0.0.0.0"]
