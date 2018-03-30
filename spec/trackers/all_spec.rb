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

    describe "GoogleCode::Issue" do
      let(:issue_url) { "https://code.google.com/p/ovz-web-panel/issues/detail?id=49" }

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
      let(:issue_url) { "https://bitbucket.org/site/master/issues/10983/ed25519-ssh-keys-bb-13645" }

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

    describe "GoogleCode::Tracker" do
      let(:tracker_class) { GoogleCode::Tracker }
      let(:tracker_url) { "https://code.google.com/p/ovz-web-panel/" }
      let(:tracker_name) { "ovz-web-panel" }

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
        expect(action).to change(tracker.issues, :count).by_at_least(tracker_class::MAX_RESULT_PER_PAGE)
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
        # Bitbucket API 2.0 returns at least 10 values in a continuing page
        expect(action).to change(tracker.issues, :count).by_at_least(10)
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
      info[:issue_class].should be_nil
      info[:tracker_class].should eq(Trac::Tracker)
      info[:tracker_url].should eq('https://trac.adium.im/')
      info[:tracker_name].should eq('Adium Trac')
    end

    # no trailing slash
    it "https://trac.adium.im" do
      info[:issue_class].should be_nil
      info[:tracker_class].should eq(Trac::Tracker)
      info[:tracker_url].should eq('https://trac.adium.im/')
      info[:tracker_name].should eq('Adium Trac')
    end

    it "https://trac.adium.im/ticket/6" do
      info[:issue_class].should eq(Trac::Issue)
      info[:issue_url].should eq('https://trac.adium.im/ticket/6')
      info[:tracker_class].should eq(Trac::Tracker)
      info[:tracker_url].should eq('https://trac.adium.im/')
      info[:tracker_name].should eq('Adium Trac')
    end

    it "http://bugs.jquery.com/" do
      info[:issue_class].should be_nil
      info[:tracker_class].should eq(Trac::Tracker)
      info[:tracker_url].should eq('http://bugs.jquery.com/')
      info[:tracker_name].should eq('jQuery Core')
    end

    it "http://bugs.jquery.com/ticket/10495" do
      info[:issue_class].should eq(Trac::Issue)
      info[:issue_url].should eq('http://bugs.jquery.com/ticket/10495')
      info[:tracker_class].should eq(Trac::Tracker)
      info[:tracker_url].should eq('http://bugs.jquery.com/')
      info[:tracker_name].should eq('jQuery Core')
    end

    it "http://trac.macports.org/" do
      info[:issue_class].should be_nil
      info[:tracker_class].should eq(Trac::Tracker)
      info[:tracker_url].should eq('http://trac.macports.org/')
      info[:tracker_name].should eq('MacPorts')
    end

    it "http://twistedmatrix.com/trac/" do
      info[:issue_class].should be_nil
      info[:tracker_class].should eq(Trac::Tracker)
      info[:tracker_url].should eq('http://twistedmatrix.com/trac/')
      info[:tracker_name].should eq('Twisted')
    end

    it "http://twistedmatrix.com/trac/ticket/1228" do
      info[:issue_class].should eq(Trac::Issue)
      info[:issue_url].should eq('http://twistedmatrix.com/trac/ticket/1228')
      info[:tracker_class].should eq(Trac::Tracker)
      info[:tracker_url].should eq('http://twistedmatrix.com/trac/')
      info[:tracker_name].should eq('Twisted')
    end

    it "https://trac.torproject.org/projects/tor" do
      info[:issue_class].should be_nil
      info[:tracker_class].should eq(Trac::Tracker)
      info[:tracker_url].should eq('https://trac.torproject.org/projects/tor/')
      info[:tracker_name].should eq('Tor Bug Tracker & Wiki')
    end

    # no trailing slash
    it "https://trac.torproject.org/projects/tor/" do
      info[:issue_class].should be_nil
      info[:tracker_class].should eq(Trac::Tracker)
      info[:tracker_url].should eq('https://trac.torproject.org/projects/tor/')
      info[:tracker_name].should eq('Tor Bug Tracker & Wiki')
    end

    it "https://trac.videolan.org/vlc/" do
      info[:issue_class].should be_nil
      info[:tracker_class].should eq(Trac::Tracker)
      info[:tracker_url].should eq('https://trac.videolan.org/vlc/')
      info[:tracker_name].should eq('VLC')
    end

    it "https://trac.videolan.org/vlc/ticket/4352" do
      info[:issue_class].should eq(Trac::Issue)
      info[:issue_url].should eq('https://trac.videolan.org/vlc/ticket/4352')
      info[:tracker_class].should eq(Trac::Tracker)
      info[:tracker_url].should eq('https://trac.videolan.org/vlc/')
      info[:tracker_name].should eq('VLC')
    end


    ############### JIRA ###############


    it "http://dev.clojure.org/jira/browse/CLJS" do
      info[:issue_class].should be_nil
      info[:tracker_class].should eq(Jira::Tracker)
      info[:tracker_url].should eq('http://dev.clojure.org/jira/browse/CLJS')
      info[:tracker_name].should eq('CLJS')
    end

    it "http://dev.clojure.org/jira/browse/CLJS-868" do
      info[:issue_class].should eq(Jira::Issue)
      info[:issue_url].should eq('http://dev.clojure.org/jira/browse/CLJS-868')
      info[:issue_title].should eq('no arity warnings on recursive calls')
      info[:tracker_class].should eq(Jira::Tracker)
      info[:tracker_url].should eq('http://dev.clojure.org/jira/browse/CLJS')
      info[:tracker_name].should eq('CLJS')
    end

    it "https://bukkit.atlassian.net/projects/BUKKIT/summary" do
      info[:issue_class].should be_nil
      info[:tracker_class].should eq(Jira::Tracker)
      info[:tracker_url].should eq('https://bukkit.atlassian.net/browse/BUKKIT')
      info[:tracker_name].should eq('BUKKIT')
    end

    it "https://bukkit.atlassian.net/browse/BUKKIT-3846" do
      info[:issue_class].should eq(Jira::Issue)
      info[:issue_url].should eq('https://bukkit.atlassian.net/browse/BUKKIT-3846')
      info[:issue_title].should eq('FurnaceRecipe overwrites vanilla result experience')
      info[:tracker_class].should eq(Jira::Tracker)
      info[:tracker_url].should eq('https://bukkit.atlassian.net/browse/BUKKIT')
      info[:tracker_name].should eq('BUKKIT')
    end

    it "https://bukkit.atlassian.net/projects/BUKKIT/issues/BUKKIT-5574" do
      info[:issue_class].should eq(Jira::Issue)
      info[:issue_url].should eq('https://bukkit.atlassian.net/browse/BUKKIT-5574')
      info[:issue_title].should eq('Fatal failure by spawning')
      info[:tracker_class].should eq(Jira::Tracker)
      info[:tracker_url].should eq('https://bukkit.atlassian.net/browse/BUKKIT')
      info[:tracker_name].should eq('BUKKIT')
    end

    it "https://issues.apache.org/jira/browse/AGILA" do
      info[:issue_class].should be_nil
      info[:tracker_class].should eq(Jira::Tracker)
      info[:tracker_url].should eq('https://issues.apache.org/jira/browse/AGILA')
      info[:tracker_name].should eq('AGILA')
    end

    it "https://issues.apache.org/jira/browse/AGILA-44" do
      info[:issue_class].should eq(Jira::Issue)
      info[:issue_url].should eq('https://issues.apache.org/jira/browse/AGILA-44')
      info[:tracker_class].should eq(Jira::Tracker)
      info[:tracker_url].should eq('https://issues.apache.org/jira/browse/AGILA')
      info[:tracker_name].should eq('AGILA')
    end


    ############### BUGZILLA ###############

    it "https://bugzilla.gnome.org/buglist.cgi?quicksearch=component%3Ageneral+product%3A%22gnome-terminal%22+" do
      info[:issue_class].should be_nil
      info[:tracker_class].should eq(Bugzilla::Tracker)
      info[:tracker_url].should eq('https://bugzilla.gnome.org/buglist.cgi?product=gnome-terminal')
      info[:tracker_name].should eq('GNOME - gnome-terminal')
    end

    it "https://bugzilla.gnome.org/show_bug.cgi?id=380612" do
      info[:issue_class].should eq(Bugzilla::Issue)
      info[:issue_url].should eq('https://bugzilla.gnome.org/show_bug.cgi?id=380612')
      info[:tracker_class].should eq(Bugzilla::Tracker)
      info[:tracker_url].should eq('https://bugzilla.gnome.org/buglist.cgi?product=totem')
      info[:tracker_name].should eq('GNOME - totem')
    end

    it "https://bugzilla.redhat.com/buglist.cgi?product=Fedora&component=fedora-packager&resolution=---" do
      info[:issue_class].should be_nil
      info[:tracker_class].should eq(Bugzilla::Tracker)
      info[:tracker_url].should eq('https://bugzilla.redhat.com/buglist.cgi?product=Fedora')
      info[:tracker_name].should eq('Red Hat - Fedora')
    end

    it "https://bugzilla.redhat.com/show_bug.cgi?id=707252" do
      info[:issue_class].should eq(Bugzilla::Issue)
      info[:issue_url].should eq('https://bugzilla.redhat.com/show_bug.cgi?id=707252')
      info[:tracker_class].should eq(Bugzilla::Tracker)
      info[:tracker_url].should eq('https://bugzilla.redhat.com/buglist.cgi?product=Bugzilla')
      info[:tracker_name].should eq('Red Hat - Bugzilla')
    end

    it "https://bugs.webkit.org/show_bug.cgi?id=65711" do
      info[:issue_class].should eq(Bugzilla::Issue)
      info[:issue_url].should eq('https://bugs.webkit.org/show_bug.cgi?id=65711')
      info[:tracker_class].should eq(Bugzilla::Tracker)
      info[:tracker_url].should eq('https://bugs.webkit.org/buglist.cgi?product=WebKit')
      info[:tracker_name].should eq('WebKit - WebKit')
    end

    ############### GOOGLE CODE ###############

    it "https://code.google.com/p/redmine-dmsf/" do
      info[:issue_class].should be_nil
      info[:tracker_class].should eq(GoogleCode::Tracker)
      info[:tracker_url].should eq('https://code.google.com/p/redmine-dmsf/')
      info[:tracker_name].should eq('redmine-dmsf')
    end

    it "https://code.google.com/p/jsc3d/issues/list" do
      info[:issue_class].should be_nil
      info[:tracker_class].should eq(GoogleCode::Tracker)
      info[:tracker_url].should eq('https://code.google.com/p/jsc3d/')
      info[:tracker_name].should eq('jsc3d')
    end

    it "https://code.google.com/p/redmine-dmsf/issues/detail?id=2" do
      info[:issue_class].should eq(GoogleCode::Issue)
      info[:issue_url].should eq('https://code.google.com/p/redmine-dmsf/issues/detail?id=2')
      info[:tracker_class].should eq(GoogleCode::Tracker)
      info[:tracker_url].should eq('https://code.google.com/p/redmine-dmsf/')
      info[:tracker_name].should eq('redmine-dmsf')
    end

    it "https://code.google.com/p/chromium/issues/detail?id=165329" do
      info[:issue_class].should eq(GoogleCode::Issue)
      info[:issue_url].should eq('https://code.google.com/p/chromium/issues/detail?id=165329')
      info[:tracker_class].should eq(GoogleCode::Tracker)
      info[:tracker_url].should eq('https://code.google.com/p/chromium/')
      info[:tracker_name].should eq('chromium')
    end

    it "https://code.google.com/p/tectonicus/issues/detail?id=19" do
      info[:issue_class].should eq(GoogleCode::Issue)
      info[:issue_url].should eq('https://code.google.com/p/tectonicus/issues/detail?id=19')
      info[:tracker_class].should eq(GoogleCode::Tracker)
      info[:tracker_url].should eq('https://code.google.com/p/tectonicus/')
      info[:tracker_name].should eq('tectonicus')
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
      info[:issue_class].should eq(nil)
      info[:tracker_class].should eq(Bitbucket::Tracker)
      info[:tracker_url].should eq('https://bitbucket.org/birkenfeld/sphinx')
      info[:tracker_name].should eq('birkenfeld/sphinx')
    end

    it "https://bitbucket.org/birkenfeld/sphinx/issue/156" do
      info[:issue_class].should eq(Bitbucket::Issue)
      info[:issue_url].should eq('https://bitbucket.org/birkenfeld/sphinx/issues/156')
      info[:tracker_class].should eq(Bitbucket::Tracker)
      info[:tracker_url].should eq('https://bitbucket.org/birkenfeld/sphinx')
      info[:tracker_name].should eq('birkenfeld/sphinx')
    end

    ################ LAUNCHPAD ###############
    it "https://bugs.launchpad.net/gwibber" do
      info[:issue_class].should eq(nil)
      info[:tracker_class].should eq(Launchpad::Tracker)
      info[:tracker_url].should eq('https://bugs.launchpad.net/gwibber')
      info[:tracker_name].should eq('gwibber')
    end

    it "https://bugs.launchpad.net/gwibber/+bug/1123780" do
      info[:issue_class].should eq(Launchpad::Issue)
      info[:issue_url].should eq('https://bugs.launchpad.net/gwibber/+bug/1123780')
      info[:tracker_class].should eq(Launchpad::Tracker)
      info[:tracker_url].should eq('https://bugs.launchpad.net/gwibber')
      info[:tracker_name].should eq('gwibber')
    end


    ################ PIVOTAL ###############
    it "https://www.pivotaltracker.com/projects/367813/stories" do
      info[:issue_class].should eq(nil)
      info[:tracker_class].should eq(Pivotal::Tracker)
      info[:tracker_url].should eq('https://www.pivotaltracker.com/projects/367813')
      info[:tracker_name].should eq('Departments and policy (Dev)')
    end
    it "https://www.pivotaltracker.com/story/show/45939421" do
      info[:issue_class].should eq(Pivotal::Issue)
      info[:issue_url].should eq('https://www.pivotaltracker.com/story/show/45939421')
      info[:tracker_class].should eq(Pivotal::Tracker)
      info[:tracker_url].should eq('https://www.pivotaltracker.com/projects/367813')
      info[:tracker_name].should eq('Departments and policy (Dev)')
    end
    it "https://www.pivotaltracker.com/projects/367813#!/stories/45939421" do
      info[:issue_class].should eq(Pivotal::Issue)
      info[:issue_url].should eq('https://www.pivotaltracker.com/story/show/45939421')
      info[:tracker_class].should eq(Pivotal::Tracker)
      info[:tracker_url].should eq('https://www.pivotaltracker.com/projects/367813')
      info[:tracker_name].should eq('Departments and policy (Dev)')
    end
    it "https://www.pivotaltracker.com/n/projects/367813/stories/45939421" do
      info[:issue_class].should eq(Pivotal::Issue)
      info[:issue_url].should eq('https://www.pivotaltracker.com/story/show/45939421')
      info[:tracker_class].should eq(Pivotal::Tracker)
      info[:tracker_url].should eq('https://www.pivotaltracker.com/projects/367813')
      info[:tracker_name].should eq('Departments and policy (Dev)')
    end

    ################ MANTIS ###############
    it "https://www.mantisbt.org/bugs/my_view_page.php" do
      info[:issue_class].should eq(nil)
      info[:tracker_class].should eq(Mantis::Tracker)
      info[:tracker_url].should eq('https://www.mantisbt.org/bugs/')
      info[:tracker_name].should eq('www.mantisbt.org')
    end

    it "https://www.mantisbt.org/bugs/view.php?id=24096" do
      info[:issue_class].should eq(Mantis::Issue)
      info[:issue_url].should eq('https://www.mantisbt.org/bugs/view.php?id=24096')
      info[:tracker_class].should eq(Mantis::Tracker)
      info[:tracker_url].should eq('https://www.mantisbt.org/bugs/')
      info[:tracker_name].should eq('www.mantisbt.org')
    end

  end

end
