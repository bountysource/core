 // Converts cashout address to the address1/address2 format used by the tax form.
angular.module('factories').factory('taxFormAddress', ['countries', function(countries){
  return {
    address1: function(address) {
      var addr = address.address1;

      if(address.address2)
        addr += ", " + address.address2;

      return addr;
    },

    address2: function(address, us_state) {
      us_state = us_state || false;
      var addr = address.city;

      if(address.state) 
        addr += (addr ? ", " : "") + address.state;
  
      if(address.postal_code) 
        addr += (addr ? ", " : "") + address.postal_code;

      return addr;
    },

    country: function(address) {
      if(!address.country) return "";

      for(var i = 0; i < countries.length; i++) {
        if(countries[i].code == address.country)
          return countries[i].name;
      }

      return "";
    }
  }
}]);