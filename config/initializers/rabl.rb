# Override Rabl::Engine#collection for some extra fun things!
# Featuring: pagination, filtering, and ordering, all from query params.
# Pagination data is returned in the response on a 'Pagination' header.
module Rabl
  # configuration for pagination
  class Pagination
    attr_accessor :per_page, :max_per_page, :params_filter

    def initialize(options={})
      @per_page     = options[:per_page] || 30
      @max_per_page = options[:max_per_page] || 100

      # params filter, always exclude params added by Rails
      @params_filter = %w(page action controller)
      @params_filter += options[:params_filter].map(&:to_s) if options[:params_filter]
      @params_filter.uniq!
    end

    # create hash for response header.
    def self.append_header!(request, response, options)
      if options[:num_pages] > 1
        data = { page: options[:page], pages: options[:num_pages], per_page: options[:per_page], items: options[:num_items] }

        # remove Rails controller/action, and user defined keys from request params
        filtered_params = request.params.reject { |k,_| ([:page] + Rabl.configuration.pagination.params_filter).include? k }

        # add the base request URL
        data[:request_path] = "#{request.path}?#{filtered_params.to_param}"

        response.headers['Pagination'] = data.to_json
      end
    end

    # convert raw input to per_page number, bounded by configuration
    def self.bounded_per_page(val)
      per_page = (val || Rabl.configuration.pagination.per_page).to_i
      per_page = 1 if per_page <= 0
      per_page = Rabl.configuration.pagination.max_per_page if per_page > Rabl.configuration.pagination.max_per_page
      per_page
    end

    # convert raw input to page number
    def self.bounded_page(val, num_pages)
      page = val.to_i
      page = 1 if page <= 0
      page = num_pages if page > num_pages
      page
    end
  end

  class Filtering
    # apply filters from params to the specified data.
    def self.apply(data, filter_hash)
      # select only valid filters, for columns/methods that exist
      filter_hash.select! { |k,_| data.first.attributes.has_key? k }

      # this should be safe, as it's passed through the where method,
      # which does its own sanitizing.
      filter_hash.each do |col, val|
        query_hash = {}
        query_hash[col] = val
        data = data.where(query_hash)
      end

      data
    end
  end

  class Ordering
    def self.apply(data, order_hash)
      order_hash.select! { |_,direction| %w(asc desc).include? direction }
      order_string = order_hash.to_a.map { |a| a.join(' ') }.join(', ')
      # quick SQL-injection fix
      raise "INVALID ORDERING: #{order_string}" unless order_string =~ /^[a-z_]+(\.[a-z_]+)? (asc|desc)(, [a-z_]+(\.[a-z_]+)? (asc|desc))*$/
      data.reorder(order_string)
    end
  end

  # add pagination to Rabl configuration
  class Configuration
    attr_accessor :pagination

    def pagination=(options={})
      @pagination = Pagination.new options
    end
  end

  # add pagination to collections
  class Engine
    alias_method :original_collection, :collection

    def collection(data, options={})
      unless options.has_key?(:paginate)
        options[:paginate] = true
      end

      if data && params && response && data.respond_to?(:count)
        # apply filters
        if params[:filter]
          filter_hash = JSON.parse(params[:filter]) rescue {}
          data = Filtering.apply data, filter_hash
        end

        # apply ordering
        if params[:order]
          order_hash = JSON.parse(params[:order]) rescue {}
          data = Ordering.apply data, order_hash
        end

        # pagination
        if data.is_a?(ActiveRecord::Relation) && data.base_class.respond_to?(:collection_size_override)
          collection_size = data.base_class.collection_size_override
        else
          collection_size = data.count(:all)
        end

        per_page  = Pagination.bounded_per_page(params[:per_page])
        num_pages = (collection_size.to_f / per_page.to_f).ceil
        page      = Pagination.bounded_page(params[:page], num_pages)

        if options[:paginate] && data.is_a?(ActiveRecord::Relation) && num_pages > 1
          # set Pagination header
          Pagination.append_header!(request, response,
            num_items:  collection_size,
            num_pages:  num_pages,
            per_page:   per_page,
            page:       page
          )

          # pass it off to Rabl::Engine#collection
          original_collection data.limit(per_page).offset((page - 1) * per_page), options
        else
          original_collection data, options
        end
      else
        original_collection data, options
      end
    end
  end
end

# finally, configure dat Rabl
Rabl.configure do |config|
  config.include_json_root = false
  config.include_child_root = false
  config.enable_json_callbacks = false
  config.cache_sources = false
  #config.cache_sources = Rails.env != 'development'
  #config.cache_all_output = Rails.env != 'development'

  config.pagination = {
    per_page:       30,
    max_per_page:   250,
    params_filter:  [:access_token, :callback, :cache]
  }
end
