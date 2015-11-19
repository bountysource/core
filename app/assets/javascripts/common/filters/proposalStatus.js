angular.module('filters').filter('proposalStatus', function () {
  return function (status) {
    var filteredText;
    switch(status) {
      case "pending":
        filteredText = "Pending";
        break;
      case "pending_appointment":
        filteredText = "Pending";
        break;
      case "appointed":
        filteredText = "Accepted";
        break;
      case "rejected":
        filteredText = "Rejected";
        break;
      case "pending_approval":
        filteredText = "Solution Submitted";
        break;
      case "approved":
        filteredText = "Approved and Paid";
        break;
    }
    return filteredText;
  };
});
