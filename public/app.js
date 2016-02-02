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
        borderCountries.push(searchForCountry('alpha3Code', border));
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
}

var searchForCountry = function(property, searchTerm){
    for (var country of countries){
        if (country[property] === searchTerm) {
            return country; 
        }
    }
    return null;
}

var selectionChangeHandler = function(){
    selectBox = document.querySelector('select');
    var country = searchForCountry('name', selectBox.value);
    displayCountry(country);
    localStorage.setItem(storageKey, JSON.stringify(country));
}

var createDropdown = function(countries) {
    var selectBox = document.createElement('select'); 
    var documentBody = document.querySelector('body');

    for (var country of countries) {
        var option = document.createElement('option');
        option.innerText = country.name;
        selectBox.appendChild(option);
    }
    
    selectBox.onchange = selectionChangeHandler;
    var lastCountry = JSON.parse(localStorage.getItem(storageKey));
    selectBox.value = lastCountry.name;
    displayCountry(lastCountry);
    documentBody.appendChild(selectBox);
};

window.onload = function(){
    console.log('App started');
    var url = 'https://restcountries.eu/rest/v1';
    var request = new XMLHttpRequest();

    request.open('GET', url);
    request.onload = function(){
        if (request.status === 200) {
            countries = JSON.parse(request.responseText);
            getRegions();
            displayCountry(countries[0]);
            createDropdown(countries);
        }
    };
    request.send(null);
};
