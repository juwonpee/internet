const weather_url = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
const dust_url = 'http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty'
var apiKey = '33bU4NRUJ5pns3K/YK+U8LxMesOCiRs03brpKSY1mRMvXtN8NhftRxgU6bo30j2ydwOlIOtXQxU+r0aiSjlOKA==';
const date = new Date();
const baseDate = date.getFullYear().toString() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2);
const hour = date.getHours();
// Set time in 3 hour increments
var baseTime;
for (let x = 2; x <= 24; x+=3) {
    if (x >= hour) {
        baseTime = ("0" + x).slice(-2) + "00";
        break;
    }
    else {
        baseTime = ("0" + 2).slice(-2) + "00";
    }
}

// Get location
// var location  = navigator.geolocation.getCurrentPosition

console.log("Date " + baseDate)
console.log("Hour " + baseTime)

var nx = '55';
var ny = '127';

var weatherQueryParams = new URLSearchParams({
    serviceKey: apiKey,
    dataType: 'JSON',
    pageNo: '1',
    numOfRows: '10',
    base_date: baseDate,
    base_time: baseTime,
    nx: nx,
    ny: ny
});

var dustQueryParams = new URLSearchParams({
    serviceKey : apiKey,
    returnType : 'JSON',
    numOfRows : '1',
    pageNo : '1',
    sidoName : '서울',
    ver: '1.0'
});

function getWeatherData(data, type) {
    for (let x = 0; x < data.length; x++) {
        if (data[x]['category'] == type) {
            return data[x]['fcstValue'];
        }
    }
    return null;
}

function getDustData(data, type) {
    return null;
}



fetch(weather_url + '?' + weatherQueryParams)
.then(function(response) {
    obj = response.json();
    return obj;
})
.then(function(data) {
    // If no error or wrong response
    if (data['response']['header']['resultCode'] != '00') {
        throw new Error(data['response']['header']['resultMsg']);
    }
    // Dont need rest of json
    data = data['response']['body']['items']['item']

    // Temperature
    document.getElementById("tempNum").innerText=getWeatherData(data, 'TMP') + "°C"; 

    // Wind
    {
        var tempString = new String();
        var east = getWeatherData(data, 'UUU');
        if (east > 0) {tempString = tempString + "동";}
        else { tempString = tempString + '서'}
        var north = getWeatherData(data, 'VVV');
        if (north > 0) {tempString = tempString + "북";}
        else { tempString = tempString + '남'}

        var wind = Math.sqrt(east * east + north * north)
        document.getElementById("windNum").innerText = tempString + wind.toFixed(2).toString() + "m/s";
    }

    // 
})
.catch(function(error) {
    console.log(error);
});

fetch(dust_url + '?' + dustQueryParams)
.then(function(response) {
    obj = response.json();
    console.log(obj);
    return obj;
})
.catch(function(error) {
    console.log(error);
});;