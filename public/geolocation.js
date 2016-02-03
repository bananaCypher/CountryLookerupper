var UserLocation = function(){
    this.geolocation;
    this.userCountry;
    navigator.geolocation.getCurrentPosition(function(position){
        this.geolocation = position;
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'latLng': {lat: this.geolocation.coords.latitude, lng: this.geolocation.coords.longitude}}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    this.userCountry = getGeoCountry(results);
                }
            }
        }.bind(this));
    });
};

var getGeoCountry = function(results){ 
    for (var i = 0; i < results[0].address_components.length; i++) {
        var shortname = results[0].address_components[i].short_name;
        var longname = results[0].address_components[i].long_name;
        var type = results[0].address_components[i].types;
        if (type.indexOf("country") != -1)
        {
            if (!isNullOrWhitespace(shortname))
            {
                return shortname;
            }
            else
            {
                return longname;
            }
        }
    }
};

var isNullOrWhitespace = function(text){
    if (text == null) {
        return true;
    }
    return text.replace(/\s/gi, '').length < 1;
};
