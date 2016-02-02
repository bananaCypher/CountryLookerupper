var countries = [];
var regions = [];
var storageKey = 'lastCountry';

var Region = function(name){
   this.name = name; 
   this.subRegions = [];
   this.countries = [];
}
var SubRegion = function(name){
    this.name = name;
    this.countries = [];
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
        for (subRegion in subRegionList) {
            var subRegionObject = new SubRegion(subRegion);
            subRegionObject.countries = subRegionList[subRegion];
            region.subRegions.push(subRegionObject);
        }
    }
}

var getRegions = function(){
    var regionList = {};
    for (var country of countries) {
        if (country.region in regionList) {
            regionList[country.region].push(country);
        } else {
            regionList[country.region] = [country];
        }
    } 
    for (region in regionList) {
        var regionObject = new Region(region);
        regionObject.countries = regionList[region]; 
        regions.push(regionObject);
    }
    getSubRegions();
}

var getBorderingCountries = function(country) {
    var borderCountries = [];
    for (border of country.borders) {
        borderCountries.push(searchFor('alpha3Code', border, countries));
    }
    return borderCountries;
}

var displayCountry = function(country) {
    var countryDisplay = document.querySelector('#country-display');
    countryDisplay.innerHTML = '';

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
    displayMap(country.latlng[0], country.latlng[1]);
}

var searchFor = function(property, searchTerm, items){
    for (var item of items){
        if (item[property] === searchTerm) {
            return item; 
        }
    }
    return null;
}

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

var createDropdown = function(label, items, onChangeFunction) {
    var oldSelectBox = document.querySelector('#' + label);
    var oldLabel = document.querySelector('#label-' + label);
    if (oldSelectBox) {
        oldSelectBox.parentNode.removeChild(oldSelectBox);
        oldLabel.parentNode.removeChild(oldLabel);
    }
    var selectBox = document.createElement('select'); 
    var documentBody = document.querySelector('body');

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
    documentBody.appendChild(labelElement);
    documentBody.appendChild(selectBox);
};

var updateDropdown = function(selectBox, items) {
    selectBox.innerHTML = '';
    for (var item of items) {
        var option = document.createElement('option');
        option.innerText = item.name;
        selectBox.appendChild(option);
    }
};

var checkboxHandler = function(){
    if (this.checked) {
        createDropdown('Regions', regions, regionSelectionHandler);
    } else {
        var regionLabel = document.querySelector('#Regions');
        var regionSelect = document.querySelector('#label-Regions');
        var subregionLabel = document.querySelector('#Subregions');
        var subregionSelect = document.querySelector('#label-Subregions');
        regionLabel.parentNode.removeChild(regionLabel);
        regionSelect.parentNode.removeChild(regionSelect);
        subregionLabel.parentNode.removeChild(subregionLabel);
        subregionSelect.parentNode.removeChild(subregionSelect);
        var countrySelect = document.querySelector('#Countries');
        updateDropdown(countrySelect, countries);
    }
};

window.onload = function(){
    console.log('App started');
    var url = 'https://restcountries.eu/rest/v1';
    var request = new XMLHttpRequest();

    var checkbox = document.querySelector('#filter-regions');
    checkbox.onclick = checkboxHandler;

    request.open('GET', url);
    request.onload = function(){
        if (request.status === 200) {
            countries = JSON.parse(request.responseText);
            getRegions();
            displayCountry(countries[0]);
            createDropdown('Countries', countries, countrySelectionHandler);
            var lastCountry = JSON.parse(localStorage.getItem(storageKey));
            var selectBox = document.querySelector('select') 
            selectBox.value = lastCountry.name;
            displayCountry(lastCountry);
        }
    };
    request.send(null);
};

var displayMap = function(latitude, longitude){
    var position = {lat: latitude, lng: longitude}
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
};
