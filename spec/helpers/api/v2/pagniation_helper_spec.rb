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
    values[:page].should be == 1
  end

  it "should default to page 1 if collection empty" do
    values = calculate_pagination_values(Issue.limit(0))
    values[:page].should be == 1
  end

  it "should use default items per page" do
    values = calculate_pagination_values(Issue.all)
    values[:per_page].should be == Api::V2::PaginationHelper::DEFAULT_PER_PAGE
  end

  context "custom per_page value" do
    it "should use per_page defined on params" do
      values = calculate_pagination_values(Issue.all, { per_page: 50 })
      values[:per_page].should be == 50
    end
  end

  context "min per_page value" do
    it "should use per_page defined on params" do
      values = calculate_pagination_values(Issue.all, { per_page: -42 })
      values[:per_page].should be == Api::V2::PaginationHelper::DEFAULT_PER_PAGE
    end
  end

  context "max per_page value" do
    it "should limit to max items per page" do
      values = calculate_pagination_values(Issue.all, { per_page: 1337 })
      values[:per_page].should be == Api::V2::PaginationHelper::MAX_PER_PAGE
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
      paginated.count.should be == 1
      paginated.first.should be == issue1
    end

    it "should offset by 1 when requesting page 2" do
      params[:page] = 2
      paginated.first.should be == issue2
    end

    it "should offset by 2 when requesting page 3" do
      params[:page] = 3
      paginated.first.should be == issue3
    end

    it "should offset by 3 when requesting page 4" do
      params[:page] = 4
      paginated.first.should be == issue4
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
        links['first'].should be_nil
        links['prev'].should be_nil
      end

      it "provides next and last links" do
        links['last'].should_not be_nil
        links['next'].should_not be_nil
      end
    end

    context "on last page" do
      let(:links) do
        parse_links build_pagination_headers(
          '/foo', { per_page: 7, num_pages: 3, page: 3 }
        )['Link']
      end

      it "omits last and next links" do
        links['last'].should be_nil
        links['next'].should be_nil
      end

      it "provides first and prev links" do
        links['first'].should_not be_nil
        links['prev'].should_not be_nil
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
        q['page'].should == "3"
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
        q['per_page'].should == "7"
        q['page'].should == "3"

        q = Rack::Utils.parse_query(URI.parse(links['prev']).query)
        q['per_page'].should == "7"
        q['page'].should == "1"

        q = Rack::Utils.parse_query(URI.parse(links['last']).query)
        q['per_page'].should == "7"
        q['page'].should == "3"

        q = Rack::Utils.parse_query(URI.parse(links['first']).query)
        q['per_page'].should == "7"
        q['page'].should == "1"
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
        q['foo'].should == "bar"
      end
    end

  end

end
