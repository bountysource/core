FROM ruby:2.7.0

RUN apt-get update -qq && apt-get install -y nodejs postgresql-client

RUN mkdir -p /app
WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . ./

EXPOSE 3000

CMD ["rails", "s", "-b", "0.0.0.0"]
