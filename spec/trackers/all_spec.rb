require 'spec_helper'

describe "live_sync" do

  # use VCR to record live responses
  around(:each) do |example|
    name = example.metadata[:full_description].split(/\s+/, 2).join("/").underscore.gsub(/[^\w\/]+/, "_")
    VCR.use_cassette(name) { example.call }
  end

  describe "Issue#remote_sync" do
    let(:action) do
      lambda {
        issue = Tracker.magically_turn_url_into_tracker_or_issue(issue_url)
        issue.remote_sync_if_necessary({})
      }
    end

    describe "Jira::Issue" do
      let(:issue_url) { "https://issues.apache.org/jira/browse/ARIES-998" }

      it "should create new issue" do
        expect(action).to change(Issue, :count).by(1)
      end

      it "should fetch issue comment" do
        expect(action).to change(Comment, :count).by_at_least(1)
      end
    end

    describe "Bugzilla::Issue" do
      let(:issue_url) { "https://d.puremagic.com/issues/show_bug.cgi?id=314" }

      it "should create new issue" do
        expect(action).to change(Issue, :count).by(1)
      end

      it "should fetch issue comment" do
        expect(action).to change(Comment, :count).by_at_least(1)
      end
    end

    describe "Trac::Issue" do
      let(:issue_url) { "http://trac.edgewall.org/ticket/10755" }

      it "should create new issue" do
        expect(action).to change(Issue, :count).by(1)
      end

      it "should fetch issue comment" do
        expect(action).to change(Comment, :count).by_at_least(1)
      end
    end

    # describe "SourceForge::Issue" do
    #   let(:issue_url) { "http://sourceforge.net/p/squirrel-sql/bugs/1076/" }
    #
    #   it "should create new issue" do
    #     expect(action).to change(Issue, :count).by(1)
    #   end
    #
    #   it "should fetch issue comment" do
    #     expect(action).to change(Comment, :count).by_at_least(1)
    #   end
    # end
    #
    # describe "SourceForgeNative::Issue" do
    #   let(:issue_url) { "http://sourceforge.net/tracker/?func=detail&aid=3600690&group_id=37116&atid=418820" }
    #
    #   it "should create new issue" do
    #     expect(action).to change(Issue, :count).by(1)
    #   end
    #
    #   it "should fetch issue comment" do
    #     expect(action).to change(Comment, :count).by_at_least(1)
    #   end
    # end

    describe "Launchpad::Issue" do
      let(:issue_url) { "https://bugs.launchpad.net/gwibber/+bug/1123780" }

      it "should create new issue" do
        expect(action).to change(Issue, :count).by(1)
      end

      it "should fetch issue comment" do
        expect(action).to change(Comment, :count).by_at_least(1)
      end
    end

    describe "Bitbucket::Issue" do
      let(:issue_url) { "https://bitbucket.org/site/master/issues/15896/stderr-ssh-connect-to-host-bitbucketorg" }

      it "should create new issue" do
        expect(action).to change(Issue, :count).by(1)
      end

      it "should fetch issue comment" do
        expect(action).to change(Comment, :count).by_at_least(1)
      end
    end

    describe "Pivotal::Issue" do
      let(:issue_url) { "https://www.pivotaltracker.com/story/show/45939421" }

      it "should create new issue" do
        expect(action).to change(Issue, :count).by(1)
      end

      it "should fetch issue comment" do
        expect(action).to change(Comment, :count).by_at_least(1)
      end
    end

    describe "Pivotal::Issue" do
      let(:issue_url) { "https://www.pivotaltracker.com/n/projects/367813/stories/45939421" }

      it "should create new issue" do
        expect(action).to change(Issue, :count).by(1)
      end

      it "should fetch issue comment" do
        expect(action).to change(Comment, :count).by_at_least(1)
      end
    end


    describe "MantisRest::Issue" do
      let(:issue_url) { "https://www.mantisbt.org/bugs/view.php?id=24096" }

      it "should create new issue" do
        expect(action).to change(Issue, :count).by(1)
      end

      it "should fetch issue comment" do
        expect(action).to change(Comment, :count).by_at_least(1)
      end
    end

    describe "MantisSoap::Issue" do
      let(:issue_url) { "https://bugs.limesurvey.org/view.php?id=12227" }

      it "should create new issue" do
        expect(action).to change(Issue, :count).by(1)
      end

      it "should fetch issue comment" do
        expect(action).to change(Comment, :count).by_at_least(1)
      end
    end

    describe "MantisPrintBug::Issue" do
      let(:issue_url) { "https://caml.inria.fr/mantis/view.php?id=7754" }

      it "should create new issue" do
        expect(action).to change(Issue, :count).by(1)
      end

      it "should fetch issue comment" do
        expect(action).to change(Comment, :count).by_at_least(1)
      end
    end
  end

  describe "Tracker#remote_sync" do
    let!(:tracker) { tracker_class.new(url: tracker_url, name: tracker_name) }
    let(:action) do
      lambda { tracker.remote_sync_if_necessary({}) }
    end

    describe "Jira::Tracker" do
      let(:tracker_class) { Jira::Tracker }
      let(:tracker_url) { "https://issues.apache.org/jira/browse/ARIES" }
      let(:tracker_name) { "ARIES" }

      it "should create new Tracker" do
        expect(action).to change(Tracker, :count).by(1)
      end

      it "should create Tracker Issues" do
        expect(action).to change(tracker.issues, :count).by_at_least(tracker_class::MAX_RESULT_PER_PAGE)
      end
    end

    describe "Bugzilla::Tracker" do
      let(:tracker_class) { Bugzilla::Tracker }
      let(:tracker_url) { "https://bugzilla.mozilla.org/buglist.cgi?product=Core" }
      let(:tracker_name) { "Core" }

      it "should create new Tracker" do
        expect(action).to change(Tracker, :count).by(1)
      end

      it "should create Tracker Issues" do
        expect(action).to change(tracker.issues, :count).by_at_least(100)
      end
    end

    describe "Trac::Tracker" do
      let(:tracker_class) { Trac::Tracker }
      let(:tracker_url) { "http://trac.edgewall.org/" }
      let(:tracker_name) { "trac.edgewall.org" }

      it "should create new Tracker" do
        expect(action).to change(Tracker, :count).by(1)
      end

      it "should create Tracker Issues" do
        expect(action).to change(tracker.issues, :count).by_at_least(tracker_class::MAX_RESULT_PER_PAGE)
      end
    end

    # describe "SourceForge::Tracker" do
    #   let(:tracker_class) { SourceForge::Tracker }
    #   let(:tracker_url) { "http://sourceforge.net/projects/squirrel-sql/" }
    #   let(:tracker_name) { "squirrel-sql" }
    #
    #   it "should create new Tracker" do
    #     expect(action).to change(Tracker, :count).by(1)
    #   end
    #
    #   it "should create Tracker Issues" do
    #     expect(action).to change(tracker.issues, :count).by_at_least(tracker_class::MAX_RESULT_PER_PAGE)
    #   end
    # end
    #
    # describe "SourceForgeNative::Tracker" do
    #   let(:tracker_class) { SourceForgeNative::Tracker }
    #   let(:tracker_url) { "http://sourceforge.net/tracker/?group_id=37116" }
    #   let(:tracker_name) { "ScummVM" }
    #
    #   it "should create new Tracker" do
    #     expect(action).to change(Tracker, :count).by(1)
    #   end
    #
    #   it "should create Tracker Issues" do
    #     expect(action).to change(tracker.issues, :count).by_at_least(tracker_class::MAX_RESULT_PER_PAGE)
    #   end
    # end

    describe "Launchpad::Tracker" do
      let(:tracker_class) { Launchpad::Tracker }
      let(:tracker_url) { "https://bugs.launchpad.net/gwibber" }
      let(:tracker_name) { "Gwibber" }

      it "should create new Tracker" do
        expect(action).to change(Tracker, :count).by(1)
      end

      it "should create Tracker Issues" do
        expect(action).to change{tracker.issues.count}.by_at_least(tracker_class::MAX_RESULT_PER_PAGE)
      end
    end

    describe "Bitbucket::Tracker" do
      let(:tracker_class) { Bitbucket::Tracker }
      let(:tracker_url) { "https://bitbucket.org/zurmo/zurmo" }
      let(:tracker_name) { "zurmo/zurmo" }

      it "should create new Tracker" do
        expect(action).to change(Tracker, :count).by(1)
      end

      it "should create Tracker Issues" do
        expect(action).to change(tracker.issues, :count).by_at_least(tracker_class::MAX_RESULT_PER_PAGE)
      end
    end

    describe "Pivotal::Tracker" do
      let(:tracker_class) { Pivotal::Tracker }
      let(:tracker_url) { "https://www.pivotaltracker.com/projects/367813/stories" }
      let(:tracker_name) { "Inside Government (Development) (Public)" }

      it "should create new Tracker" do
        expect(action).to change(Tracker, :count).by(1)
      end

      it "should create Tracker Issues" do
        expect(action).to change(tracker.issues, :count).by_at_least(1)
      end
    end

    describe "Mantis::Tracker" do
      let(:tracker_class) { Mantis::Tracker }
      let(:tracker_url) { "https://www.mantisbt.org/bugs/" }
      let(:tracker_name) { "www.mantisbt.org" }

      it "should create new Tracker" do
        expect(action).to change(Tracker, :count).by(1)
      end

      it "should create Tracker Issues" do
        expect(action).to change(tracker.issues, :count).by_at_least(1)
      end
    end
  end

  describe "Tracker::API.extract_info_from_url" do
    let(:info) { |example| Tracker.extract_info_from_url(example.metadata[:description]) }

    ############### TRAC ###############

    it "https://trac.adium.im/" do
      expect(info[:issue_class]).to be_nil
      expect(info[:tracker_class]).to eq(Trac::Tracker)
      expect(info[:tracker_url]).to eq('https://trac.adium.im/')
      expect(info[:tracker_name]).to eq('Adium Trac')
    end

    # no trailing slash
    it "https://trac.adium.im" do
      expect(info[:issue_class]).to be_nil
      expect(info[:tracker_class]).to eq(Trac::Tracker)
      expect(info[:tracker_url]).to eq('https://trac.adium.im/')
      expect(info[:tracker_name]).to eq('Adium Trac')
    end

    it "https://trac.adium.im/ticket/6" do
      expect(info[:issue_class]).to eq(Trac::Issue)
      expect(info[:issue_url]).to eq('https://trac.adium.im/ticket/6')
      expect(info[:tracker_class]).to eq(Trac::Tracker)
      expect(info[:tracker_url]).to eq('https://trac.adium.im/')
      expect(info[:tracker_name]).to eq('Adium Trac')
    end

    it "http://bugs.jquery.com/" do
      expect(info[:issue_class]).to be_nil
      expect(info[:tracker_class]).to eq(Trac::Tracker)
      expect(info[:tracker_url]).to eq('http://bugs.jquery.com/')
      expect(info[:tracker_name]).to eq('jQuery Core')
    end

    it "http://bugs.jquery.com/ticket/10495" do
      expect(info[:issue_class]).to eq(Trac::Issue)
      expect(info[:issue_url]).to eq('http://bugs.jquery.com/ticket/10495')
      expect(info[:tracker_class]).to eq(Trac::Tracker)
      expect(info[:tracker_url]).to eq('http://bugs.jquery.com/')
      expect(info[:tracker_name]).to eq('jQuery Core')
    end

    it "http://trac.macports.org/" do
      expect(info[:issue_class]).to be_nil
      expect(info[:tracker_class]).to eq(Trac::Tracker)
      expect(info[:tracker_url]).to eq('http://trac.macports.org/')
      expect(info[:tracker_name]).to eq('MacPorts')
    end

    it "http://twistedmatrix.com/trac/" do
      expect(info[:issue_class]).to be_nil
      expect(info[:tracker_class]).to eq(Trac::Tracker)
      expect(info[:tracker_url]).to eq('http://twistedmatrix.com/trac/')
      expect(info[:tracker_name]).to eq('Twisted')
    end

    it "http://twistedmatrix.com/trac/ticket/1228" do
      expect(info[:issue_class]).to eq(Trac::Issue)
      expect(info[:issue_url]).to eq('http://twistedmatrix.com/trac/ticket/1228')
      expect(info[:tracker_class]).to eq(Trac::Tracker)
      expect(info[:tracker_url]).to eq('http://twistedmatrix.com/trac/')
      expect(info[:tracker_name]).to eq('Twisted')
    end

    it "https://trac.torproject.org/projects/tor" do
      expect(info[:issue_class]).to be_nil
      expect(info[:tracker_class]).to eq(Trac::Tracker)
      expect(info[:tracker_url]).to eq('https://trac.torproject.org/projects/tor/')
      expect(info[:tracker_name]).to eq('Tor Bug Tracker & Wiki')
    end

    # no trailing slash
    it "https://trac.torproject.org/projects/tor/" do
      expect(info[:issue_class]).to be_nil
      expect(info[:tracker_class]).to eq(Trac::Tracker)
      expect(info[:tracker_url]).to eq('https://trac.torproject.org/projects/tor/')
      expect(info[:tracker_name]).to eq('Tor Bug Tracker & Wiki')
    end

    it "https://trac.videolan.org/vlc/" do
      expect(info[:issue_class]).to be_nil
      expect(info[:tracker_class]).to eq(Trac::Tracker)
      expect(info[:tracker_url]).to eq('https://trac.videolan.org/vlc/')
      expect(info[:tracker_name]).to eq('VLC')
    end

    it "https://trac.videolan.org/vlc/ticket/4352" do
      expect(info[:issue_class]).to eq(Trac::Issue)
      expect(info[:issue_url]).to eq('https://trac.videolan.org/vlc/ticket/4352')
      expect(info[:tracker_class]).to eq(Trac::Tracker)
      expect(info[:tracker_url]).to eq('https://trac.videolan.org/vlc/')
      expect(info[:tracker_name]).to eq('VLC')
    end


    ############### JIRA ###############


    it "http://dev.clojure.org/jira/browse/CLJS" do
      expect(info[:issue_class]).to be_nil
      expect(info[:tracker_class]).to eq(Jira::Tracker)
      expect(info[:tracker_url]).to eq('http://dev.clojure.org/jira/browse/CLJS')
      expect(info[:tracker_name]).to eq('CLJS')
    end

    it "http://dev.clojure.org/jira/browse/CLJS-868" do
      expect(info[:issue_class]).to eq(Jira::Issue)
      expect(info[:issue_url]).to eq('http://dev.clojure.org/jira/browse/CLJS-868')
      expect(info[:issue_title]).to eq('no arity warnings on recursive calls')
      expect(info[:tracker_class]).to eq(Jira::Tracker)
      expect(info[:tracker_url]).to eq('http://dev.clojure.org/jira/browse/CLJS')
      expect(info[:tracker_name]).to eq('CLJS')
    end

    it "https://bukkit.atlassian.net/projects/BUKKIT/summary" do
      expect(info[:issue_class]).to be_nil
      expect(info[:tracker_class]).to eq(Jira::Tracker)
      expect(info[:tracker_url]).to eq('https://bukkit.atlassian.net/browse/BUKKIT')
      expect(info[:tracker_name]).to eq('BUKKIT')
    end

    it "https://bukkit.atlassian.net/browse/BUKKIT-3846" do
      expect(info[:issue_class]).to eq(Jira::Issue)
      expect(info[:issue_url]).to eq('https://bukkit.atlassian.net/browse/BUKKIT-3846')
      expect(info[:issue_title]).to eq('FurnaceRecipe overwrites vanilla result experience')
      expect(info[:tracker_class]).to eq(Jira::Tracker)
      expect(info[:tracker_url]).to eq('https://bukkit.atlassian.net/browse/BUKKIT')
      expect(info[:tracker_name]).to eq('BUKKIT')
    end

    it "https://bukkit.atlassian.net/projects/BUKKIT/issues/BUKKIT-5574" do
      expect(info[:issue_class]).to eq(Jira::Issue)
      expect(info[:issue_url]).to eq('https://bukkit.atlassian.net/browse/BUKKIT-5574')
      expect(info[:issue_title]).to eq('Fatal failure by spawning')
      expect(info[:tracker_class]).to eq(Jira::Tracker)
      expect(info[:tracker_url]).to eq('https://bukkit.atlassian.net/browse/BUKKIT')
      expect(info[:tracker_name]).to eq('BUKKIT')
    end

    it "https://issues.apache.org/jira/browse/AGILA" do
      expect(info[:issue_class]).to be_nil
      expect(info[:tracker_class]).to eq(Jira::Tracker)
      expect(info[:tracker_url]).to eq('https://issues.apache.org/jira/browse/AGILA')
      expect(info[:tracker_name]).to eq('AGILA')
    end

    it "https://issues.apache.org/jira/browse/AGILA-44" do
      expect(info[:issue_class]).to eq(Jira::Issue)
      expect(info[:issue_url]).to eq('https://issues.apache.org/jira/browse/AGILA-44')
      expect(info[:tracker_class]).to eq(Jira::Tracker)
      expect(info[:tracker_url]).to eq('https://issues.apache.org/jira/browse/AGILA')
      expect(info[:tracker_name]).to eq('AGILA')
    end


    ############### BUGZILLA ###############

    it "https://bugzilla.gnome.org/buglist.cgi?quicksearch=component%3Ageneral+product%3A%22gnome-terminal%22+" do
      expect(info[:issue_class]).to be_nil
      expect(info[:tracker_class]).to eq(Bugzilla::Tracker)
      expect(info[:tracker_url]).to eq('https://bugzilla.gnome.org/buglist.cgi?product=gnome-terminal')
      expect(info[:tracker_name]).to eq('GNOME - gnome-terminal')
    end

    it "https://bugzilla.gnome.org/show_bug.cgi?id=380612" do
      expect(info[:issue_class]).to eq(Bugzilla::Issue)
      expect(info[:issue_url]).to eq('https://bugzilla.gnome.org/show_bug.cgi?id=380612')
      expect(info[:tracker_class]).to eq(Bugzilla::Tracker)
      expect(info[:tracker_url]).to eq('https://bugzilla.gnome.org/buglist.cgi?product=totem')
      expect(info[:tracker_name]).to eq('GNOME - totem')
    end

    it "https://bugzilla.redhat.com/buglist.cgi?product=Fedora&component=fedora-packager&resolution=---" do
      expect(info[:issue_class]).to be_nil
      expect(info[:tracker_class]).to eq(Bugzilla::Tracker)
      expect(info[:tracker_url]).to eq('https://bugzilla.redhat.com/buglist.cgi?product=Fedora')
      expect(info[:tracker_name]).to eq('Red Hat - Fedora')
    end

    it "https://bugzilla.redhat.com/show_bug.cgi?id=707252" do
      expect(info[:issue_class]).to eq(Bugzilla::Issue)
      expect(info[:issue_url]).to eq('https://bugzilla.redhat.com/show_bug.cgi?id=707252')
      expect(info[:tracker_class]).to eq(Bugzilla::Tracker)
      expect(info[:tracker_url]).to eq('https://bugzilla.redhat.com/buglist.cgi?product=Bugzilla')
      expect(info[:tracker_name]).to eq('Red Hat - Bugzilla')
    end

    it "https://bugs.webkit.org/show_bug.cgi?id=65711" do
      expect(info[:issue_class]).to eq(Bugzilla::Issue)
      expect(info[:issue_url]).to eq('https://bugs.webkit.org/show_bug.cgi?id=65711')
      expect(info[:tracker_class]).to eq(Bugzilla::Tracker)
      expect(info[:tracker_url]).to eq('https://bugs.webkit.org/buglist.cgi?product=WebKit')
      expect(info[:tracker_name]).to eq('WebKit - WebKit')
    end

    ################ SOURCEFORGE ###############

    # it "http://sourceforge.net/projects/squirrel-sql/" do
    #   info[:issue_class].should be_nil
    #   info[:tracker_class].should eq(SourceForge::Tracker)
    #   info[:tracker_url].should eq('http://sourceforge.net/projects/squirrel-sql/')
    #   info[:tracker_name].should eq('squirrel-sql')
    # end
    #
    # it "http://sourceforge.net/p/squirrel-sql/patches/" do
    #   info[:issue_class].should be_nil
    #   info[:tracker_class].should eq(SourceForge::Tracker)
    #   info[:tracker_url].should eq('http://sourceforge.net/projects/squirrel-sql/')
    #   info[:tracker_name].should eq('squirrel-sql')
    # end
    #
    # it "http://sourceforge.net/p/squirrel-sql/bugs/1076/" do
    #   info[:issue_class].should eq(SourceForge::Issue)
    #   info[:issue_url].should eq('http://sourceforge.net/p/squirrel-sql/bugs/1076/')
    #   info[:tracker_class].should eq(SourceForge::Tracker)
    #   info[:tracker_url].should eq('http://sourceforge.net/projects/squirrel-sql/')
    #   info[:tracker_name].should eq('squirrel-sql')
    # end
    #
    # ################ SOURCEFORGE (SECONDARY TRACKER) ###############
    #
    # it "http://sourceforge.net/tracker/?group_id=37116&atid=418823" do
    #   info[:issue_class].should be_nil
    #   info[:tracker_class].should eq(SourceForgeNative::Tracker)
    #   info[:tracker_url].should eq('http://sourceforge.net/tracker/?group_id=37116')
    #   info[:tracker_name].should eq('ScummVM')
    # end
    #
    # it "http://sourceforge.net/tracker/?group_id=37116&atid=418820" do
    #   info[:issue_class].should be_nil
    #   info[:tracker_class].should eq(SourceForgeNative::Tracker)
    #   info[:tracker_url].should eq('http://sourceforge.net/tracker/?group_id=37116')
    #   info[:tracker_name].should eq('ScummVM')
    # end
    #
    # it "http://sourceforge.net/tracker/?func=detail&aid=3518284&group_id=37116&atid=418820" do
    #   info[:issue_class].should eq(SourceForgeNative::Issue)
    #   info[:issue_url].should eq('http://sourceforge.net/tracker/?func=detail&aid=3518284&group_id=37116&atid=418820')
    #   info[:tracker_class].should eq(SourceForgeNative::Tracker)
    #   info[:tracker_url].should eq('http://sourceforge.net/tracker/?group_id=37116')
    #   info[:tracker_name].should eq('ScummVM')
    # end
    #
    # ################ SOURCEFORGE (TRAC) ###############
    # it "http://sourceforge.net/apps/trac/squirrel-sql/" do
    #   info[:issue_class].should be_nil
    #   info[:tracker_class].should eq(Trac::Tracker)
    #   info[:tracker_url].should eq('http://sourceforge.net/apps/trac/squirrel-sql/')
    #   info[:tracker_name].should eq('squirrel-sql')
    # end


    ################ BITBUCKET ###############
    it "https://bitbucket.org/birkenfeld/sphinx" do
      expect(info[:issue_class]).to eq(nil)
      expect(info[:tracker_class]).to eq(Bitbucket::Tracker)
      expect(info[:tracker_url]).to eq('https://bitbucket.org/birkenfeld/sphinx')
      expect(info[:tracker_name]).to eq('birkenfeld/sphinx')
    end

    it "https://bitbucket.org/birkenfeld/sphinx/issue/156" do
      expect(info[:issue_class]).to eq(Bitbucket::Issue)
      expect(info[:issue_url]).to eq('https://bitbucket.org/birkenfeld/sphinx/issues/156')
      expect(info[:tracker_class]).to eq(Bitbucket::Tracker)
      expect(info[:tracker_url]).to eq('https://bitbucket.org/birkenfeld/sphinx')
      expect(info[:tracker_name]).to eq('birkenfeld/sphinx')
    end

    ################ LAUNCHPAD ###############
    it "https://bugs.launchpad.net/gwibber" do
      expect(info[:issue_class]).to eq(nil)
      expect(info[:tracker_class]).to eq(Launchpad::Tracker)
      expect(info[:tracker_url]).to eq('https://bugs.launchpad.net/gwibber')
      expect(info[:tracker_name]).to eq('gwibber')
    end

    it "https://bugs.launchpad.net/gwibber/+bug/1123780" do
      expect(info[:issue_class]).to eq(Launchpad::Issue)
      expect(info[:issue_url]).to eq('https://bugs.launchpad.net/gwibber/+bug/1123780')
      expect(info[:tracker_class]).to eq(Launchpad::Tracker)
      expect(info[:tracker_url]).to eq('https://bugs.launchpad.net/gwibber')
      expect(info[:tracker_name]).to eq('gwibber')
    end


    ################ PIVOTAL ###############
    it "https://www.pivotaltracker.com/projects/367813/stories" do
      expect(info[:issue_class]).to eq(nil)
      expect(info[:tracker_class]).to eq(Pivotal::Tracker)
      expect(info[:tracker_url]).to eq('https://www.pivotaltracker.com/projects/367813')
      expect(info[:tracker_name]).to eq('Departments and policy (Dev)')
    end
    it "https://www.pivotaltracker.com/story/show/45939421" do
      expect(info[:issue_class]).to eq(Pivotal::Issue)
      expect(info[:issue_url]).to eq('https://www.pivotaltracker.com/story/show/45939421')
      expect(info[:tracker_class]).to eq(Pivotal::Tracker)
      expect(info[:tracker_url]).to eq('https://www.pivotaltracker.com/projects/367813')
      expect(info[:tracker_name]).to eq('Departments and policy (Dev)')
    end
    it "https://www.pivotaltracker.com/projects/367813#!/stories/45939421" do
      expect(info[:issue_class]).to eq(Pivotal::Issue)
      expect(info[:issue_url]).to eq('https://www.pivotaltracker.com/story/show/45939421')
      expect(info[:tracker_class]).to eq(Pivotal::Tracker)
      expect(info[:tracker_url]).to eq('https://www.pivotaltracker.com/projects/367813')
      expect(info[:tracker_name]).to eq('Departments and policy (Dev)')
    end
    it "https://www.pivotaltracker.com/n/projects/367813/stories/45939421" do
      expect(info[:issue_class]).to eq(Pivotal::Issue)
      expect(info[:issue_url]).to eq('https://www.pivotaltracker.com/story/show/45939421')
      expect(info[:tracker_class]).to eq(Pivotal::Tracker)
      expect(info[:tracker_url]).to eq('https://www.pivotaltracker.com/projects/367813')
      expect(info[:tracker_name]).to eq('Departments and policy (Dev)')
    end

    ################ MANTIS ###############
    it "https://www.mantisbt.org/bugs/my_view_page.php" do
      expect(info[:issue_class]).to eq(nil)
      expect(info[:tracker_class]).to eq(Mantis::Tracker)
      expect(info[:tracker_url]).to eq('https://www.mantisbt.org/bugs/')
      expect(info[:tracker_name]).to eq('www.mantisbt.org')
    end

    it "https://www.mantisbt.org/bugs/view.php?id=24096" do
      expect(info[:issue_class]).to eq(Mantis::Issue)
      expect(info[:issue_url]).to eq('https://www.mantisbt.org/bugs/view.php?id=24096')
      expect(info[:tracker_class]).to eq(Mantis::Tracker)
      expect(info[:tracker_url]).to eq('https://www.mantisbt.org/bugs/')
      expect(info[:tracker_name]).to eq('www.mantisbt.org')
    end

  end

end
