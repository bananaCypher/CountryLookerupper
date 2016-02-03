// Globals
var countries = [];
var regions = [];
var storageKey = 'lastCountry';
var userLocation = new UserLocation();

// Constructors
var Region = function(name){
   this.name = name; 
   this.subRegions = [];
   this.countries = [];
}
var SubRegion = function(name){
    this.name = name;
    this.countries = [];
}

// Helper Functions
var deleteElement = function(elementId) {
    var element = document.getElementById(elementId);
    if (element) {
        element.parentNode.removeChild(element);
    }
}

var searchFor = function(property, searchTerm, items){
    for (var item of items){
        if (item[property] === searchTerm) {
            return item; 
        }
    }
    return null;
}

var createRegionObjects = function(regionList, constructor, output){
    for (region in regionList) {
        var regionObject = new constructor(region);
        regionObject.countries = regionList[region]; 
        output.push(regionObject);
    }
}

// Region Functions
var getRegions = function(){
    var regionList = {};
    for (var country of countries) {
        if (country.region in regionList) {
            regionList[country.region].push(country);
        } else {
            regionList[country.region] = [country];
        }
    } 
    createRegionObjects(regionList, Region, regions);
    getSubRegions();
}

var getSubRegions = function(){
    for (var region of regions) {
        var subRegionList = {};
        for (var country of region.countries) {
            if (country.subregion in subRegionList) {
                subRegionList[country.subregion].push(country);
            } else {
                subRegionList[country.subregion] = [country];
            }        
        }
        createRegionObjects(subRegionList, SubRegion, region.subRegions);
    }
}

// Country functions
var getBorderingCountries = function(country) {
    var borderCountries = [];
    for (border of country.borders) {
        borderCountries.push(searchFor('alpha3Code', border, countries));
    }
    return borderCountries;
}


// Selection box handlers
var countrySelectionHandler = function(){
    var selectBox = document.querySelector('#Countries');
    var country = searchFor('name', selectBox.value, countries);
    displayCountry(country);
    localStorage.setItem(storageKey, JSON.stringify(country));
}

var regionSelectionHandler = function(){
    var selectBox = document.querySelector('#Regions'); 
    var region = searchFor('name', selectBox.value, regions);
    var countryBox = document.querySelector('#Countries');
    updateDropdown(countryBox, region.countries);
    createDropdown('Subregions', region.subRegions, subregionSelectionHandler);
}

var subregionSelectionHandler = function(){
    var selectBox = document.querySelector('#Subregions'); 
    var region = searchFor('name', document.querySelector('#Regions').value, regions);
    var subregion = searchFor('name', selectBox.value, region.subRegions);
    var countryBox = document.querySelector('#Countries');
    updateDropdown(countryBox, subregion.countries);
}

var checkboxHandler = function(){
    if (this.checked) {
        createDropdown('Regions', regions, regionSelectionHandler);
    } else {
        deleteElement('Regions');
        deleteElement('label-Regions');
        deleteElement('Subregions');
        deleteElement('label-Subregions');
        var countrySelect = document.querySelector('#Countries');
        updateDropdown(countrySelect, countries);
    }
};

var showMyCountry = function(){
   displayCountry(searchFor('alpha2Code', userCountry, countries)) ;
};


// Display functions
var displayCountry = function(country) {
    var countryDisplay = document.createElement('div');

    var countryName = document.createElement('p');
    var population = document.createElement('p');
    var capitalCity = document.createElement('p');

    countryName.innerText = 'Country: ' + country.name;
    population.innerText = 'Population: ' + country.population;
    capitalCity.innerText = 'Capital: ' + country.capital;

    countryDisplay.appendChild(countryName);
    countryDisplay.appendChild(population);
    countryDisplay.appendChild(capitalCity);

    var borderingCountries = getBorderingCountries(country);
    var borderListStart = document.createElement('ul');
    borderListStart.innerText = 'Bordering countries:-'
    for (var borderCountry of borderingCountries) {
        var borderListItem = document.createElement('li');
        borderListItem.innerText = borderCountry.name;
        borderListStart.appendChild(borderListItem);
    }
    countryDisplay.appendChild(borderListStart);
    displayMap(country, countryDisplay);
}

var createDropdown = function(label, items, onChangeFunction) {
    deleteElement(label);
    deleteElement('label-' + label);

    var selectBox = document.createElement('select'); 
    var selectContainer = document.querySelector('#select-container');

    for (var item of items) {
        var option = document.createElement('option');
        option.innerText = item.name;
        selectBox.appendChild(option);
    }
    
    selectBox.id = label;
    selectBox.onchange = onChangeFunction;

    var labelElement = document.createElement('label');
    labelElement.id = 'label-' + label; 
    labelElement.innerText = label;
    selectContainer.appendChild(labelElement);
    selectContainer.appendChild(selectBox);
    return selectContainer;
};

var updateDropdown = function(selectBox, items) {
    selectBox.innerHTML = '';
    for (var item of items) {
        var option = document.createElement('option');
        option.innerText = item.name;
        selectBox.appendChild(option);
    }
};

var displayMap = function(country, element){
    var position = {lat: country.latlng[0], lng: country.latlng[1]}
    var mapCanvas = document.getElementById('map');
    var mapOptions = {
        center: position,
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.HYBRID
    }
    var map = new google.maps.Map(mapCanvas, mapOptions)
    var marker = new google.maps.Marker({
        position: position,
        map: map,
    }); 
    var infoWindow = new google.maps.InfoWindow({
        content: element.innerHTML
    }); 
    marker.addListener('click', function(){
        infoWindow.open(map, marker); 
    });
    map.addListener('click', function(){
        infoWindow.close(); 
    });
};

// Init
window.onload = function(){
    console.log('App started');
    var url = 'https://restcountries.eu/rest/v1';
    var request = new XMLHttpRequest();

    var checkbox = document.querySelector('#filter-regions');
    checkbox.onclick = checkboxHandler;
    var myCountryButton = document.querySelector('#my-country-button');
    myCountryButton.onclick = showMyCountry;

    request.open('GET', url);
    request.onload = function(){
        if (request.status === 200) {
            countries = JSON.parse(request.responseText);
            getRegions();
            displayCountry(countries[0]); //in case there are no saved countries
            createDropdown('Countries', countries, countrySelectionHandler);
            var lastCountry = JSON.parse(localStorage.getItem(storageKey));
            var selectBox = document.querySelector('select') 
            selectBox.value = lastCountry.name;
            displayCountry(lastCountry);
        }
    };
    request.send(null);
};
