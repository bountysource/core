angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/delayed_jobs', {
        templateUrl: 'admin/delayed_jobs/index.html',
        controller: "DelayedJobsController"
      });
  })
  .controller("DelayedJobsController", function ($scope, $window, $api, $dialog) {

    $scope.overall_stats = $api.delayed_jobs_info({ group_stats: true });

    $scope.jobs = $api.delayed_jobs_get().then(function(jobs) {
      $scope.new_jobs = [];
      $scope.failed_jobs = [];

      for (var i=0; i<jobs.length; i++) {
        if (jobs[i].attempts === 0) {
          $scope.new_jobs.push(jobs[i]);
        } else {
          $scope.failed_jobs.push(jobs[i]);
        }

        // add elapsed time locked
        if (jobs[i].locked_at) {
          var now = new Moment();
          var started = new Moment(jobs[i].locked_at);

          jobs[i].$minutes_locked = now.diff(started, "minutes");
        }
      }

      return jobs;
    });

    // show job in modal with extra data
    $scope.show_job_modal = function(job) {
      job.$show_modal = true;
    };

    $scope.close_job_modal = function(job) {
      job.$show_modal = false;
    };

    $scope.perform_job = function(job) {
      job.$performing = true;

      $api.delayed_job_perform(job.id).then(function(updated_job) {
        job.$performing = false;

        console.log(updated_job);

        // if job still exists, it failed again.
        if (updated_job) {
          for (var k in updated_job) { job[k] = updated_job[k]; }
        } else {
          $scope.close_job_modal(job);

          // remove job from either the new_jobs or failed_jobs array
          var container = job.attempts === 0 ? $scope.new_jobs : $scope.failed_jobs;
          for (var i=0; i<container.length; i++) {
            if (container[i].id === job.id) {
              container.splice(i,1);
              break;
            }
          }
        }
      });
    };

    $scope.delete_job = function(job) {
      $scope.close_job_modal(job);

      $api.delayed_job_delete(job.id).then(function(response) {
        $scope.remove_job(job);
      });
    };

    $scope.remove_job = function(job) {
      if (job.attempts === 0) {
        for (var i=0; i<$scope.new_jobs.length; i++) {
          if ($scope.new_jobs[i].id === job.id) {
            $scope.new_jobs.splice(i,1);
            break;
          }
        }
      } else {
        for (var j=0; j<$scope.failed_jobs.length; j++) {
          if ($scope.failed_jobs[j].id === job.id) {
            $scope.failed_jobs.splice(j,1);
            break;
          }
        }
      }
    };
  });
