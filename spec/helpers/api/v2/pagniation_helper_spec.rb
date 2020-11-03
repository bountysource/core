require 'spec_helper'

def parse_links header
  links = Hash.new
  (header || '').split(',').each do |link|
    link =~ /<(.*?)>; rel="([^"]*)/
    links[$2] = $1
  end
  links
end

# Specs in this file have access to a helper object that includes
# the Api::V2::PaginationHelper. For example:
#
# describe Api::V2::PaginationHelper do
#   describe "string concat" do
#     it "concats two strings with spaces" do
#       expect(helper.concat_strings("this","that")).to eq("this that")
#     end
#   end
# end
describe Api::V2::PaginationHelper do

  let!(:issue1) { create(:issue, title: "DOGE HARD") }
  let!(:issue2) { create(:issue, title: "DOGE HARDER") }
  let!(:issue3) { create(:issue, title: "DOGE HARDEST") }
  let!(:issue4) { create(:issue, title: "DOGE HARDESTER") }

  it "should default to page 1" do
    values = calculate_pagination_values(Issue.all)
    expect(values[:page]).to eq(1)
  end

  it "should default to page 1 if collection empty" do
    values = calculate_pagination_values(Issue.limit(0))
    expect(values[:page]).to eq(1)
  end

  it "should use default items per page" do
    values = calculate_pagination_values(Issue.all)
    expect(values[:per_page]).to eq(Api::V2::PaginationHelper::DEFAULT_PER_PAGE)
  end

  context "custom per_page value" do
    it "should use per_page defined on params" do
      values = calculate_pagination_values(Issue.all, { per_page: 25 })
      expect(values[:per_page]).to eq(50)
    end
  end

  context "min per_page value" do
    it "should use per_page defined on params" do
      values = calculate_pagination_values(Issue.all, { per_page: 25 })
      expect(values[:per_page]).to eq(Api::V2::PaginationHelper::DEFAULT_PER_PAGE)
    end
  end

  context "max per_page value" do
    it "should limit to max items per page" do
      values = calculate_pagination_values(Issue.all, { per_page: 25 })
      expect(values[:per_page]).to eq(Api::V2::PaginationHelper::MAX_PER_PAGE)
    end
  end

  describe "limit" do
    let(:params) do
      {
        per_page: 1,
        page: 1
      }
    end

    let(:paginated) { paginate!(Issue.all) }

    it "should apply limit" do
      expect(paginated.count).to eq(1)
      expect(paginated.first).to eq(issue1)
    end

    it "should offset by 1 when requesting page 2" do
      params[:page] = 2
      expect(paginated.first).to eq(issue2)
    end

    it "should offset by 2 when requesting page 3" do
      params[:page] = 3
      expect(paginated.first).to eq(issue3)
    end

    it "should offset by 3 when requesting page 4" do
      params[:page] = 4
      expect(paginated.first).to eq(issue4)
    end
  end

  describe "Link headers" do
    context "on first page" do
      let(:links) do
        parse_links build_pagination_headers(
          '/foo', { per_page: 7, num_pages: 3, page: 1 }
        )['Link']
      end

      it "omits first and prev links" do
        expect(links['first']).to be_nil
        expect(links['prev']).to be_nil
      end

      it "provides next and last links" do
        expect(links['last']).not_to be_nil
        expect(links['next']).not_to be_nil
      end
    end

    context "on last page" do
      let(:links) do
        parse_links build_pagination_headers(
          '/foo', { per_page: 7, num_pages: 3, page: 3 }
        )['Link']
      end

      it "omits last and next links" do
        expect(links['last']).to be_nil
        expect(links['next']).to be_nil
      end

      it "provides first and prev links" do
        expect(links['first']).not_to be_nil
        expect(links['prev']).not_to be_nil
      end
    end

    context "on a path with no query params" do
      let(:links) do
        parse_links build_pagination_headers(
          "http://foo.io/bar", { per_page: 7, num_pages: 3, page: 2 }
        )["Link"]
      end

      it "adds query params to next link" do
        q = Rack::Utils.parse_query(links['next'])
        expect(q['page']).to eq("3")
      end
    end

    context "on a path with existing pagination params" do
      let(:links) do
        parse_links build_pagination_headers(
          "/foo.io/bar", { per_page: 7, num_pages: 3, page: 2 },
          { per_page: 7, page: 2 }
        )["Link"]
      end

      it "adds query params to links" do
        q = Rack::Utils.parse_query(URI.parse(links['next']).query)
        expect(q['per_page']).to eq("7")
        expect(q['page']).to eq("3")

        q = Rack::Utils.parse_query(URI.parse(links['prev']).query)
        expect(q['per_page']).to eq("7")
        expect(q['page']).to eq("1")

        q = Rack::Utils.parse_query(URI.parse(links['last']).query)
        expect(q['per_page']).to eq("7")
        expect(q['page']).to eq("3")

        q = Rack::Utils.parse_query(URI.parse(links['first']).query)
        expect(q['per_page']).to eq("7")
        expect(q['page']).to eq("1")
      end
    end

    context "on a path with non-pagination params" do
      let(:links) do
        parse_links build_pagination_headers(
          "/foo.io/bar", { per_page: 7, num_pages: 3, page: 2 },
          { foo: 'bar' }
        )["Link"]
      end

      it "preserves non-pagination query param" do
        q = Rack::Utils.parse_query(URI.parse(links['next']).query)
        expect(q['foo']).to eq("bar")
      end
    end

  end

end
