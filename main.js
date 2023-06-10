const weather_url = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
const dust_url = 'http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty';
var address_url = 'http://api.vworld.kr/req/address'
const date = new Date();
var baseDate = date.getFullYear().toString() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2);
const hour = date.getHours();
// Set time in 3 hour increments
var baseTime;
for (let x = 2; x < 24; x+=3) {
    if (x >= hour) {
        x -= 3;
        baseTime = ("0" + x).slice(-2) + "00";
        break;
    }
    else {
        baseTime = ("0" + 2).slice(-2) + "00";
    }
}
// baseTime = '0200'
// baseDate = "20230610"
console.log('Time: ' + baseTime)
console.log("Date " + baseDate)

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

function calculate(temp,wind,dust) {
    document.getElementById("tempNum").innerText=temp;
    document.getElementById("windNum").innerText=wind;
    document.getElementById("dustNum0").innerText=dust;
    console.log("asedfasdrfs " + dust)
    var nodevalue;
    const genderNodeList = document.getElementsByName('group1');
    
    genderNodeList.forEach((node) => {
        if(node.checked)  {
       
            nodevalue = node.value;
        }
    }) 

    var result;
    if(nodevalue="dog1"){if(temp>12){result="매우 좋음";}else if(temp>7){result="좋음";}else if(temp>-1){result="보통";}else if(temp>-4){result="나쁨";}else{result="매우 나쁨";}}
    else if(nodevalue="dog2"){if(temp>10){result="매우 좋음";}else if(temp>7){result="좋음";}else if(temp>-1){result="보통";}else if(temp>-9){result="나쁨";}else{result="매우 나쁨";}}
    else{if(temp>7){result="매우 좋음";}else if(temp>4){result="좋음";}else if(temp>-6){result="보통";}else if(temp>-9){result="나쁨";}else{result="매우 나쁨";}}
    document.getElementById('message1').innerText
            = '산책지수: '+result;
}

function hello(){
    console.log("Button press")
    start();
}


function start() {
    if (navigator.geolocation) { // GPS를 지원하면
        navigator.geolocation.getCurrentPosition(function(position) {
            var finalData = {};

            // Save location
            var loc = {};
            loc['lat'] = position.coords.latitude;
            loc['lng'] = position.coords.longitude;

            // Convert to x and y
            var rs = dfs_xy_conv(loc['lat'], loc['lng'])
            finalData['loc'] = rs;
            console.log("Location")
            console.log(rs)

            // Call weather API
            {
                var weatherQueryParams = new URLSearchParams({
                    serviceKey: '33bU4NRUJ5pns3K/YK+U8LxMesOCiRs03brpKSY1mRMvXtN8NhftRxgU6bo30j2ydwOlIOtXQxU+r0aiSjlOKA==',
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
                    console.log("weather data")
                    console.log(data)
                    // If no error or wrong response
                    if (data['response']['header']['resultCode'] != '00') {
                        throw new Error(data['response']['header']['resultMsg']);
                    }
                    // Dont need rest of json
                    data = data['response']['body']['items']['item']
    
                    // Temperature
                    console.log("Temperature " + getWeatherData(data, 'TMP'))
                    finalData['temp'] = getWeatherData(data, 'TMP');
    
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
                        console.log("Wind: " + wind)
                        finalData['wind'] = tempString + wind.toFixed(2).toString();
                    }
                })
                .then(function() {
                    var pm25;
                    var pm10;
                    // Call dust API
                    {
                        var dustQueryParams = new URLSearchParams({
                            serviceKey: 'v2jyt/AEEfyh2TpPTVqq9KnSwLwS4Sgw5Oneqxm3vUfXQKkBh2sMfXDxbQLS10ZKuuSnmGce4vHglvRHw8iZMQ==',
                            returnType: 'JSON',
                            numOfRows: '1',
                            pageNo: '1',
                            sidoName: '서울',
                            ver: '1.0'
                        });
                        fetch(dust_url + '?' + dustQueryParams)
                        .then(function(response) {
                            obj = response.json();
                            return obj;
                        })
                        .then(function(data) {
                            console.log("Dust data")
                            console.log(data)
                            data = data['response']['body']['items']['0'];
                            pm25 = data['pm25Value'];
                            pm10 = data['pm10Value'];
                            console.log("2.5: " + pm25 + ", 10: " + pm10);
                            finalData['2.5']= pm25;
                            finalData['10']= pm10;
                            calculate(finalData['temp'],finalData['wind'],finalData['2.5']);
                        })
                        .catch(function(error) {
                            // console.log(response)
                            console.log(error);
                        });
                    }
                })
                .catch(function(error) {
                    console.log(error);
                });
            }
            

            return finalData    

            // // Call Address API
            // {
            //     var addressQueryParams = new URLSearchParams({
            //         request: 'getaddress',
            //         key: 'D114CBFD-52BE-301D-86E0-E5A09739E09A',
            //         service: 'address',
            //         // point: rs.lng + ',' + rs.lat,
            //         point: "127.101313354,37.402352535",
            //         format: 'json',
            //         type: 'BOTH'
            //     });
            //     fetch(address_url + '?' + addressQueryParams, {
            //         mode: "no-cors"
            //     })
            //     .then(function(response) {
            //         console.log("Response " + response.text)
            //         obj = response.json();
            //         return obj;
            //     })
            //     .then(function(data) {
            //         console.log("Address" + data)
            //     })
            //     .catch(function(error) {
            //         // console.log(response)
            //         console.log(error);
            //     });
            // }
            
            

      }, function(error) {
        console.error(error);
      });
    } else {
      alert('GPS를 지원하지 않습니다');
    }
    
}