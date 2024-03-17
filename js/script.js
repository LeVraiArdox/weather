$(document).ready(function () {
  // Variables for working with Location, Temprature and Times
  var lat;
  var lon;
  var tempInF;
  var tempInC;
  var timeFormatted;

  // Quotes depending on the weather
  var weatherQuotes = {
    rain: '"The best thing one can do when it\'s raining is to let it rain." -Henry Wadsworth Longfellow',
    clear:
      '"Wherever you go, no matter what the weather, always bring your own sunshine." -Anthony J. D\'Angelo',
    clouds:
      '"The sky grew darker, painted blue on blue, one stroke at a time, into deeper and deeper shades of night." -Haruki Murakami',
    snow: '"So comes snow after fire, and even dragons have their ending!" -J. R. R. Tolkien',
    sleet:
      '"Then come the wild weather, come sleet or come snow, we will stand by each other, however it blow." -Simon Dach',
    wind: '"Kites rise highest against the wind - not with it." -Winston Churchill',
    fog: '"It is not the clear-sighted who rule the world. Great achievements are accomplished in a blessed, warm fog." -Joseph Conrad',
    default:
      '"The storm starts, when the drops start dropping When the drops stop dropping then the storm starts stopping."― Dr. Seuss ',
  };

  function locateYou() {
    // Try to get users location using their IP adress automattically.
    // It's not very precise but It's a way to get users location even if
    // their browser doesn't support Geolocation
    var ipApiCall = "https://ipapi.co/json";
    $.getJSON(ipApiCall, function (ipData) {
      lat = ipData.latitude;
      lon = ipData.longitude;
      yourAddress();
      getWeather();
    });

    // Try to get location from users browser (device).
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        // console.log(lat+" "+lon+"geo"); (For Debugging)
        yourAddress();
        getWeather();
      });
    }
  }

  // After collecting the Latiture and Longitute, Getting their formatted address from Google Maps.
  function yourAddress() {
    var googleApiCall =
      "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
      lat +
      "," +
      lon +
      "&key=YOURAPIKEY";
    console.log(googleApiCall);
    $.getJSON(googleApiCall, function (locationName) {
      $(".locName").html(locationName.results[0].formatted_address);
    });
  }

  function getWeather() {
    // Please replace 'YOUR_API_KEY' with your actual OpenWeather API key
    var apiKey = "YOURAPIKEY";
    var url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // Fetching all the information from the JSON file and plugging it into UI
        $(".currentTemp").html(Math.floor(data.main.temp));
        $(".weatherCondition").html(data.weather[0].description);
        $(".feelsLike").html(Math.floor(data.main.feels_like) + " °C");
        $(".humidity").html(data.main.humidity);
        $(".windSpeed").html(data.wind.speed);

        $(".todaySummary").html(data.weather[0].description);
        $(".tempMin").html(Math.floor(data.main.temp_min) + " °C");
        $(".tempMax").html(Math.floor(data.main.temp_max) + " °C");

        $(".cloudCover").text(data.clouds.all + " %");
        $(".dewPoint").text(data.main.dew_point + " °C");

        // Converting UNIX time
        $(".sunriseTime").text(unixToTime(data.sys.sunrise));
        $(".sunsetTime").text(unixToTime(data.sys.sunset));

        // Loading weekly Data in UI
        var days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        for (var i = 1; i < 7; i++) {
          var dayData = data.daily[i];
          $(".weekDayTempMax" + i).text(dayData.temp.max);
          $(".weekDayTempMin" + i).text(dayData.temp.min);
          $(".weekDaySunrise" + i).text(unixToTime(dayData.sunrise));
          $(".weekDaySunset" + i).text(unixToTime(dayData.sunset));
          $(".weekDayName" + i).text(unixToWeekday(dayData.dt));
          $(".weekDaySummary" + i).text(dayData.weather[0].description);
          $(".weekDayWind" + i).text(dayData.wind_speed);
          $(".weekDayHumid" + i).text(dayData.humidity);
          $(".weekDayCloud" + i).text(dayData.clouds);
        }

        // Convert temperature from Celsius to Fahrenheit
        tempInF = ((data.main.temp * 9) / 5 + 32).toFixed(2);
        var feelsLikeInF = ((data.main.feels_like * 9) / 5 + 32).toFixed(2);

        // Load Quotes
        var selectQuote = data.weather[0].main;
        var loadQuote = $(".quote");

        switch (selectQuote.toLowerCase()) {
          case "clear":
            $(".quote").text(weatherQuotes.clear);
            break;
          case "clouds":
            $(".quote").text(weatherQuotes.clouds);
            break;
          case "rain":
            $(".quote").text(weatherQuotes.rain);
            break;
          case "drizzle":
            $(".quote").text(weatherQuotes.rain);
            break;
          case "thunderstorm":
            $(".quote").text(weatherQuotes.rain);
            break;
          case "snow":
            $(".quote").text(weatherQuotes.snow);
            break;
          case "mist":
            $(".quote").text(weatherQuotes.fog);
            break;
          default:
            $(".quote").text(weatherQuotes.default);
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  locateYou();

  function unixToTime(unix) {
    var date = new Date(unix * 1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    return hours + ":" + minutes.substr(-2);
  }

  function unixToWeekday(unix) {
    var date = new Date(unix * 1000);
    var days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  }

  // UI Tweaks
  $(".convertToggle").on("click", function () {
    $(".toggleIcon").toggleClass("ion-toggle-filled");
    var tmpNow = $(".currentTemp");
    var unit = $(".unit");
    var feelsLike = $(".feelsLike");

    if (tmpNow.text() == tempInC) {
      tmpNow.text(tempInF);
      unit.text("°F");
      feelsLike.text(feelsLikeInF + " °F");
    } else {
      tmpNow.text(tempInC);
      unit.text("°C");
      feelsLike.text(feelsLikeInC + " °C");
    }
  });

  // Smooth Scrool to Weekly Forecast section
  $(".goToWeek").on("click", function () {
    $("html, body").animate(
      {
        scrollTop: $("#weeklyForecast").offset().top,
      },
      1000
    );
  });

  // Google location Search
  function initialize() {
    var input = document.getElementById("locSearchBox");
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener("place_changed", function () {
      var place = autocomplete.getPlace();
      lat = place.geometry.location.lat();
      lon = place.geometry.location.lng();
      $(".locName").html(place.formatted_address);
      //Calling the getWeather function to fetch data for Searched location
      getWeather();
    });
  }
  google.maps.event.addDomListener(window, "load", initialize);
});
