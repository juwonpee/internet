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

// API functions

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

// Get location
function dfs_xy_conv(v1, v2) {
    var RE = 6371.00877; // 지구 반경(km)
    var GRID = 5.0; // 격자 간격(km)
    var SLAT1 = 30.0; // 투영 위도1(degree)
    var SLAT2 = 60.0; // 투영 위도2(degree)
    var OLON = 126.0; // 기준점 경도(degree)
    var OLAT = 38.0; // 기준점 위도(degree)
    var XO = 43; // 기준점 X좌표(GRID)
    var YO = 136; // 기1준점 Y좌표(GRID)

    var DEGRAD = Math.PI / 180.0;
    var RADDEG = 180.0 / Math.PI;

    var re = RE / GRID;
    var slat1 = SLAT1 * DEGRAD;
    var slat2 = SLAT2 * DEGRAD;
    var olon = OLON * DEGRAD;
    var olat = OLAT * DEGRAD;

    var sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    var sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
    var ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = re * sf / Math.pow(ro, sn);
    var rs = {};
    
    rs['lat'] = v1;
    rs['lng'] = v2;
    var ra = Math.tan(Math.PI * 0.25 + (v1) * DEGRAD * 0.5);
    ra = re * sf / Math.pow(ra, sn);
    var theta = v2 * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;
    rs['x'] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    rs['y'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
    return rs;
}
function start() {
    
    if (navigator.geolocation) { // GPS를 지원하면
        navigator.geolocation.getCurrentPosition(function(position) {
            // Save location
            var loc = {};
            loc['lat'] = position.coords.latitude;
            loc['lng'] = position.coords.longitude;

            // Convert to x and y
            var rs = dfs_xy_conv(loc['lat'], loc['lng'])
            console.log("Location")
            console.log(rs)
            // Call weather API
            {
            var weatherQueryParams = new URLSearchParams({
                serviceKey: apiKey,
                dataType: 'JSON',
                pageNo: '1',
                numOfRows: '10',
                base_date: baseDate,
                base_time: baseTime,
                nx: rs.x.toString(),
                ny: rs.y.toString()
            });

            
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
                })
                .catch(function(error) {
                    console.log(data);
                    console.log(error);
                });
            }

            // Call dust API
            {
                var dustQueryParams = new URLSearchParams({
                    serviceKey: '33bU4NRUJ5pns3K%2FYK%2BU8LxMesOCiRs03brpKSY1mRMvXtN8NhftRxgU6bo30j2ydwOlIOtXQxU%2Br0aiSjlOKA%3D%3D',
                    returnType: 'JSON',
                    numOfRows: '1',
                    pageNo: '1',
                    sidoName: '서울',
                    ver: '1.0'
                });
                fetch(dust_url + '?' + dustQueryParams)
                .then(function(response) {
                    obj = response.json();
                    console.log(obj);
                    return obj;
                })
                .catch(function(error) {
                    // console.log(response)
                    console.log(error);
                });
            }
            

      }, function(error) {
        console.error(error);
      });
    } else {
      alert('GPS를 지원하지 않습니다');
    }
  }



start();