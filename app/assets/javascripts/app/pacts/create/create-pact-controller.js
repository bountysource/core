function initializeScope(scope) {
  scope.formData = {}
  // pact type default options and value
  scope.pactTypeOptions = [
    { value: 'default', description: 'Default' },
    { value: 'approval_required', description: 'Approval Required' },
  ]
  scope.pactType = {
    value: 'default',
  }
  scope.updatePactType = function (value) {
    scope.pactType.value = value
  }
  // pact timer default options and value
  scope.pactTimerOptions = [
    { value: 0, description: 'Never' },
    { value: 30, description: '30 days' },
    { value: 90, description: '90 days' },
  ]
  scope.pactTimer = {
    value: 0,
  }
  scope.updatePactTimer = function (value) {
    scope.pactTimer.value = value
  }
  scope.expirienceLvlOptions = [
    { value: 'beginner', description: 'Beginner' },
    { value: 'intermediate', description: 'Intermediate' },
    { value: 'advanced', description: 'Advanced' },
  ]
  scope.expirienceLvl = {
    value: 'intermediate',
  }
  scope.updateExpirienceLvl = function (value) {
    scope.expirienceLvl.value = value
  }
  scope.timeCommitmentOptions = [
    { value: 'hours', description: 'Hours' },
    { value: 'days', description: 'Days' },
    { value: 'weeks', description: 'Weeks' },
    { value: 'months', description: 'Months' },
  ]
  scope.timeCommitment = {
    value: 'days',
  }
  scope.updateTimeCommitment = function (value) {
    scope.timeCommitment.value = value
  }
  scope.issueTypeOptions = [
    { value: 'bug', description: 'Bug' },
    { value: 'feature', description: 'Feature' },
    { value: 'improvement', description: 'Improvement' },
    { value: 'security', description: 'Security' },
    { value: 'documentation', description: 'Documentation' },
    { value: 'design', description: 'Design' },
    { value: 'code review', description: 'Code review' },
    { value: 'other', description: 'Other' },
  ]
  scope.issueType = {
    value: 'other',
  }
  scope.updateissueType = function (value) {
    scope.issueType.value = value
  }
  scope.errors = {
    githubIssue: '',
    projectLink: '',
    projectName: '',
    projectDescription: '',
  }
}

function validatePact(data) {
  let errors = {}
  let fields = Object.keys(data)
  for (const field of fields) {
    let fieldName = field
    let fieldValue = data[field]
    if (
      fieldName === 'projectName' ||
      fieldName === 'projectLink' ||
      fieldName === 'githubIssue' ||
      fieldName === 'projectDescription'
    ) {
      if (!fieldValue) {
        errors[fieldName] = 'Field is required'
      }
    }
  }
  if (Object.keys(errors).length > 0) {
    return errors
  } else {
    return null
  }
}

angular
  .module('app')
  .controller('PactController', function ($api, $window, $scope, $location, $anchorScroll, $routeParams) {
    initializeScope($scope)

    $scope.setOwner = function (type, owner) {
      switch (type) {
        case 'anonymous':
          $scope.owner = {
            display_name: 'Anonymous',
            image_url: '<%= asset_path("bs-anon.png") %>',
          }
          break

        case 'person':
          $scope.owner = angular.copy(owner)
          break
      }
    }

    $scope.goToSignInPage = function () {
      $location.url('/signin')
    }

    $scope.createPact = function () {
      let data = {
        project_name: $scope.formData.projectName,
        pact_type: $scope.pactType.value,
        experience_level: $scope.expirienceLvl.value,
        time_commitment: $scope.timeCommitment.value,
        issue_type: $scope.issueType.value,
        expires_at: $scope.pactTimer.value,
        link: $scope.formData.projectLink,
        issue_url: $scope.formData.githubIssue,
        project_description: $scope.formData.projectDescription,
      }

      let errors = validatePact(data)

      if (errors) {
        $scope.errors = errors
      } else {
        $scope.errors = {
          githubIssue: '',
          projectLink: '',
          projectName: '',
          projectDescription: '',
        }

        $api.v2.createPact(data).then(function (response) {
          if (response.success) {
            $window.location = '/pacts/' + response.data.id
          }
        })
      }
    }
    const routeListener = $scope.$on('$routeChangeSuccess', function () {
      $anchorScroll()
      routeListener()
    })
  })
// .directive("imgupload", function () {
//   function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {
//     if (arguments.length === 2) {
//       x = y = 0;
//       w = ctx.canvas.width;
//       h = ctx.canvas.height;
//     }

//     // default offset is center
//     offsetX = typeof offsetX === "number" ? offsetX : 0.5;
//     offsetY = typeof offsetY === "number" ? offsetY : 0.5;

//     // keep bounds [0.0, 1.0]
//     if (offsetX < 0) offsetX = 0;
//     if (offsetY < 0) offsetY = 0;
//     if (offsetX > 1) offsetX = 1;
//     if (offsetY > 1) offsetY = 1;

//     var iw = img.width,
//       ih = img.height,
//       r = Math.min(w / iw, h / ih),
//       nw = iw * r, // new prop. width
//       nh = ih * r, // new prop. height
//       cx,
//       cy,
//       cw,
//       ch,
//       ar = 1;

//     // decide which gap to fill
//     if (nw < w) ar = w / nw;
//     if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; // updated
//     nw *= ar;
//     nh *= ar;

//     // calc source rectangle
//     cw = iw / (nw / w);
//     ch = ih / (nh / h);

//     cx = (iw - cw) * offsetX;
//     cy = (ih - ch) * offsetY;

//     // make sure source rectangle is valid
//     if (cx < 0) cx = 0;
//     if (cy < 0) cy = 0;
//     if (cw > iw) cw = iw;
//     if (ch > ih) ch = ih;

//     // fill image in dest. rectangle
//     ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
//   }
//   return {
//     restrict: "A",
//     scope: true,
//     link: function (scope, element, attr) {
//       element.bind("change", function () {
//         const imageContainer = document.getElementById("images");
//         imageContainer.innerHTML = "";
//         if (element[0].files.length > 3) {
//           scope.$parent.fileLength = true;
//         } else {
//           scope.$parent.fileLength = false;
//           for (let i = 0; i < element[0].files.length; i++) {
//             const file = element[0].files[i];
//             const ctx = document.createElement("canvas");
//             ctx.width = 150;
//             ctx.height = 150;
//             ctx.id = `canvas-${i}`;
//             imageContainer.appendChild(ctx);
//             const context = document
//               .getElementById(`canvas-${i}`)
//               .getContext("2d");
//             const img = new Image();
//             img.src = URL.createObjectURL(file);
//             img.onload = function () {
//               drawImageProp(context, img, 0, 0, ctx.width, ctx.height);
//             };
//           }
//         }
//       });
//     },
//   };
// });
