module Api::V2::PaginationHelper

  include Api::V2::BaseHelper

  DEFAULT_PER_PAGE = 30
  MAX_PER_PAGE = 100

  class Error < StandardError ; end

  # Apply limit and offset from params
  def paginate!(collection)
    values = calculate_pagination_values(collection, params)

    # TODO this is kind of gross
    if request && response
      # if being called by a controller, not a helper test
      expose_pagination_header
      response.headers.merge! build_pagination_headers(request.path, values, request.query_parameters)
    end

    collection.limit(values[:per_page]).offset(values[:offset])
  end

  # Set Pagination headers on the response
  def build_pagination_headers path, values, params={}
    if values[:num_pages] > 1
      link_headers = {}
      new_params = params.merge({ per_page: values[:per_page], page: values[:page] })

      # Next page + Last page
      if values[:page] < values[:num_pages]
        new_params[:page] = values[:page] + 1
        link_headers[:next] = build_link_header path, new_params, "next"

        new_params[:page] = values[:num_pages]
        link_headers[:last] = build_link_header path, new_params, "last"
      end

      # Previous page + First page
      if values[:page] > 1
        new_params[:page] = 1
        link_headers[:first] = build_link_header path, new_params, "first"

        new_params[:page] = values[:page] - 1
        link_headers[:prev] = build_link_header path, new_params, "prev"
      end

      {
        'Link' => [link_headers[:next], link_headers[:last], link_headers[:first], link_headers[:prev]].compact.join(', '),
        'Total-Pages' => values[:num_pages].to_s,
        'Total-Items' => values[:total_items].to_s
      }
    else
      Hash.new
    end
  end

  def build_link_header path, params, rel
    %(<#{Api::Application.config.api_url}#{path}?#{Rack::Utils.build_query(params)}>; rel="#{rel}")
  end

  # Calculate page, per_page, num_pages
  def calculate_pagination_values(collection, params={})
    values = calculate_pagination_offset(params)

    collection_size = _calculate_collection_size(collection)

    # Send back the total number of items
    values.merge!(total_items: collection_size)

    # Calculate num_pages now that we have collection size and per_page
    values.merge!(num_pages: (collection_size.to_f / values[:per_page]).ceil)

    # Now that the number of pages has been calculated, enforce upper limit of page
    values.merge!(page: values[:num_pages]) if values[:page] > values[:num_pages]

    values
  end

  def calculate_pagination_offset(params)
    values = {
      page: 1,
      per_page: DEFAULT_PER_PAGE,
      offset: 0
    }

    if params.has_key?(:page)
      values.merge!(page: params[:page].to_i)

      values.merge!(page: 1) if values[:page] < 1
    end

    if params.has_key?(:per_page)
      values.merge!(per_page: params[:per_page].to_i)

      values.merge!(per_page: DEFAULT_PER_PAGE) if values[:per_page] < 1
      values.merge!(per_page: MAX_PER_PAGE) if values[:per_page] > MAX_PER_PAGE
    end

    # Calculate the offset
    values[:offset] = (values[:page] - 1) * values[:per_page] if values[:page] > 1

    values
  end

  def _calculate_collection_size(collection)
    collection_size = nil

    # Calculate size of collection
    if collection.is_a?(ActiveRecord::Relation) && collection.base_class.respond_to?(:collection_size_override)
      collection_size = collection.base_class.collection_size_override
    elsif collection.is_a? ActiveRecord::Relation
      collection_size = collection.limit(nil).offset(nil).reorder(nil).count(:all)

      # If collection was grouped, count is returned as a hash.
      # Turn it into the length of the collection.
      if collection_size.is_a?(Hash)
        collection_size = collection.length
      end

      # If the collection is not an ActiveRecord::Relation,
      # test if it is an Array-like object
    elsif collection.respond_to? :count
      collection_size = collection.count

      # If it is neither Array-like nor an ActiveRecord::Relation, what the heck are you doing.
    else
      raise Error, "Cannot paginate this Collection type"
    end

    collection_size
  end

  def expose_pagination_header
    response.headers['Access-Control-Expose-Headers'] = "Link, Total-Pages, Total-Items"
  end
end
