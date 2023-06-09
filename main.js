var weather_url = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
var apiKey = '33bU4NRUJ5pns3K/YK+U8LxMesOCiRs03brpKSY1mRMvXtN8NhftRxgU6bo30j2ydwOlIOtXQxU+r0aiSjlOKA==';
const date = new Date();
const baseDate = date.getFullYear().toString() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2);
const baseTime = ("0" + (date.getHours()-1)).slice(-2) + "00";
// const baseTime = "0200";
var nx = '55';
var ny = '127';

var queryParams = new URLSearchParams({
serviceKey: apiKey,
pageNo: '1',
numOfRows: '10',
dataType: 'JSON',
base_date: baseDate,
base_time: baseTime,
nx: nx,
ny: ny
});

function getData(data, type) {
    console.log(data)
    for (let x = 0; x < data.length; x++) {
        if (data['response']['body']['items']['item'][x]['category'] == type) {
            return data['response']['body']['items']['item'][x]['fcstValue'];
        }
    }
    return null;
}



fetch(weather_url + '?' + queryParams)
.then(function(response) {
    obj = response.json();
    return obj;
})
.then(function(data) {
    console.log(data)
    // If no error or wrong response
    if (data['response']['header']['resultMsg'] == "NO_DATA") {
        throw new Error("No Data");
    }
    // Temperature
    document.getElementById("tempNum").innerText=getData(data, 'TMP') + "°C"; 
    // Wind
    {
        var tempString = new String();
        var east = getData(data, 'UUU').to;
        console.log(east)
        if (east > 0) {tempString = tempString + "동";}
        else { tempString = tempString + '서'}
        var north = getData(data, 'VVV')
        console.log()
        if (north > 0) {tempString = tempString + "북";}
        else { tempString = tempString + '남'}

        var wind = Math.sqrt(east * east + north * north)
        document.getElementById("windNum").innerText = wind.toString() + "m/s";
    }
})
.catch(function(error) {
    console.log(error);
});