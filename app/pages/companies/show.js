'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/companies/:id', {
        templateUrl: 'pages/companies/show.html',
        controller: 'BaseCompanyController'
      });
  })
  .controller('CompanyTrackersController', function ($scope, $routeParams, $api) {
    $scope.projects = [];

    $scope.company.then(function(company) {

      $scope.$watch('project_search', function() {
        if (typeof($scope.project_search) === 'number') {
          $api.company_tracker_add(company.slug, $scope.project_search).then(function(updated_company) {
            $scope.set_company(updated_company);
          });
          $scope.project_search = null;
        } else {
          $api.tracker_typeahead($scope.project_search).then(function(result) {
            $scope.projects = result;
          });
        }
      });

      $scope.remove_tracker = function(tracker_id) {
        $api.company_tracker_remove(company.slug, tracker_id).then(function(updated_company) {
          $scope.set_company(updated_company);
        });
      };

    });

//    $scope.project_search = null;
//
////    $scope.$watch('project_search', function(project_id) {
////      project_id = parseInt(project_id, 10);
////      if (!isNaN(project_id)) {
////        company.add_project(project_id);
////      }
////    });
//
//    // add project from search input to project
//    company.add_project = function(project_id) {
//      console.log('add_project', project_id);
//
//      var project;
//      for (var i=0; i<$scope.projects.length; i++) {
//        if ($scope.projects[i].id === project_id) {
//          project = $scope.projects[i];
//
//          // mark it as selected
//          project.$added = true;
//
//          company.trackers.push(project);
//          break;
//        }
//      }
//
//      // reset the search field
//      $scope.project_search = null;
//    };
//
////    };
////
////
////
////
////    $scope.projects = [
////      { name: "JSHint", id: 1, image_url: "" },
////      { name: "Rails", id: 2, image_url: "" },
////      { name: "JQuery", id: 3, image_url: "" },
////      { name: "Bountysource", id: 4, image_url: "" }
////    ];
////
////
////    // TODO fast-as-fuck tracker search in API to power search
////
////    $scope.loading_more_projects = false;
  });