// Import MQTT service
import { MQTTService } from "./mqttService.js";
// define a function that converts a string to hex
let temperature;
let humidity;
let temperature1;
let humidity1;
let pressure1;
let pressure;
let altitude;
window.stringToHex =function(str){
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    const hexValue = charCode.toString(16);

    // Pad with zeros to ensure two-digit representation
    hex += hexValue.padStart(2, '0');
  }
  return hex;


}
// Target specific HTML items
const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themeToggler = document.querySelector(".theme-toggler");

// Holds the background color of all chart
var chartBGColor = getComputedStyle(document.body).getPropertyValue(
  "--chart-background"
);
var chartFontColor = getComputedStyle(document.body).getPropertyValue(
  "--chart-font-color"
);
var chartAxisColor = getComputedStyle(document.body).getPropertyValue(
  "--chart-axis-color"
);

/*
  Event listeners for any HTML click
*/
menuBtn.addEventListener("click", () => {
  sideMenu.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  sideMenu.style.display = "none";
});

themeToggler.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme-variables");
  themeToggler.querySelector("span:nth-child(1)").classList.toggle("active");
  themeToggler.querySelector("span:nth-child(2)").classList.toggle("active");

  // Update Chart background
  chartBGColor = getComputedStyle(document.body).getPropertyValue(
    "--chart-background"
  );
  chartFontColor = getComputedStyle(document.body).getPropertyValue(
    "--chart-font-color"
  );
  chartAxisColor = getComputedStyle(document.body).getPropertyValue(
    "--chart-axis-color"
  );
  updateChartsBackground();
});

/*
  Plotly.js graph and chart setup code
*/
var temperatureHistoryDiv = document.getElementById("temperature-history");
var humidityHistoryDiv = document.getElementById("humidity-history");
var pressureHistoryDiv = document.getElementById("pressure-history");
var altitudeHistoryDiv = document.getElementById("altitude-history");

var temperatureGaugeDiv = document.getElementById("temperature-gauge");
var humidityGaugeDiv = document.getElementById("humidity-gauge");
var pressureGaugeDiv = document.getElementById("pressure-gauge");
var altitudeGaugeDiv = document.getElementById("altitude-gauge");

const historyCharts = [
  temperatureHistoryDiv,
  humidityHistoryDiv,
  pressureHistoryDiv,
  altitudeHistoryDiv,
];

const gaugeCharts = [
  temperatureGaugeDiv,
  humidityGaugeDiv,
  pressureGaugeDiv,
  altitudeGaugeDiv,
];

// History Data
var temperatureTrace = {
  x: [],
  y: [],
  name: "Temperature",
  mode: "lines+markers",
  type: "line",
};
var humidityTrace = {
  x: [],
  y: [],
  name: "Humidity",
  mode: "lines+markers",
  type: "line",
};
var pressureTrace = {
  x: [],
  y: [],
  name: "Pressure",
  mode: "lines+markers",
  type: "line",
};
var altitudeTrace = {
  x: [],
  y: [],
  name: "Altitude",
  mode: "lines+markers",
  type: "line",
};

var temperatureLayout = {
  autosize: true,
  title: {
    text: "Temperature",
  },
  font: {
    size: 12,
    color: chartFontColor,
    family: "poppins, san-serif",
  },
  colorway: ["#05AD86"],
  margin: { t: 40, b: 40, l: 30, r: 30, pad: 10 },
  plot_bgcolor: chartBGColor,
  paper_bgcolor: chartBGColor,
  xaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
    gridwidth: "2",
    autorange: true,
  },
  yaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
    gridwidth: "2",
    autorange: true,
  },
};
var humidityLayout = {
  autosize: true,
  title: {
    text: "Humidity",
  },
  font: {
    size: 12,
    color: chartFontColor,
    family: "poppins, san-serif",
  },
  colorway: ["#05AD86"],
  margin: { t: 40, b: 40, l: 30, r: 30, pad: 0 },
  plot_bgcolor: chartBGColor,
  paper_bgcolor: chartBGColor,
  xaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
    gridwidth: "2",
  },
  yaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
  },
};
var pressureLayout = {
  autosize: true,
  title: {
    text: "Tds",
  },
  font: {
    size: 12,
    color: chartFontColor,
    family: "poppins, san-serif",
  },
  colorway: ["#05AD86"],
  margin: { t: 40, b: 40, l: 30, r: 30, pad: 0 },
  plot_bgcolor: chartBGColor,
  paper_bgcolor: chartBGColor,
  xaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
    gridwidth: "2",
  },
  yaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
  },
};
var altitudeLayout = {
  autosize: true,
  title: {
    text: "Light Intensity",
  },
  font: {
    size: 12,
    color: chartFontColor,
    family: "poppins, san-serif",
  },
  colorway: ["#05AD86"],
  margin: { t: 40, b: 40, l: 30, r: 30, pad: 0 },
  plot_bgcolor: chartBGColor,
  paper_bgcolor: chartBGColor,
  xaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
    gridwidth: "2",
  },
  yaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
  },
};

var config = { responsive: true, displayModeBar: false };

// Event listener when page is loaded
window.addEventListener("load", (event) => {
  Plotly.newPlot(
    temperatureHistoryDiv,
    [temperatureTrace],
    temperatureLayout,
    config
  );
  Plotly.newPlot(humidityHistoryDiv, [humidityTrace], humidityLayout, config);
  Plotly.newPlot(pressureHistoryDiv, [pressureTrace], pressureLayout, config);
  Plotly.newPlot(altitudeHistoryDiv, [altitudeTrace], altitudeLayout, config);

  // Get MQTT Connection
  fetchMQTTConnection();

  // Run it initially
  handleDeviceChange(mediaQuery);
});

// Gauge Data
var temperatureData = [
  {
    domain: { x: [0, 1], y: [0, 1] },
    value: 0,
    title: { text: "Nitrogen" },
    type: "indicator",
    mode: "gauge+number+delta",
    delta: { reference: 30 },
    gauge: {
      axis: { range: [null, 50] },
      steps: [
        { range: [0, 20], color: "lightgray" },
        { range: [20, 30], color: "gray" },
      ],
      threshold: {
        line: { color: "red", width: 4 },
        thickness: 0.75,
        value: 30,
      },
    },
  },
];

var humidityData = [
  {
    domain: { x: [0, 1], y: [0, 1] },
    value: 0,
    title: { text: "Phosphorus" },
    type: "indicator",
    mode: "gauge+number+delta",
    delta: { reference: 50 },
    gauge: {
      axis: { range: [null, 100] },
      steps: [
        { range: [0, 20], color: "lightgray" },
        { range: [20, 30], color: "gray" },
      ],
      threshold: {
        line: { color: "red", width: 4 },
        thickness: 0.75,
        value: 30,
      },
    },
  },
];

var pressureData = [
  {
    domain: { x: [0, 1], y: [0, 1] },
    value: 0,
    title: { text: "Potassium" },
    type: "indicator",
    mode: "gauge+number+delta",
    delta: { reference: 750 },
    gauge: {
      axis: { range: [null, 1100] },
      steps: [
        { range: [0, 300], color: "lightgray" },
        { range: [300, 700], color: "gray" },
      ],
      threshold: {
        line: { color: "red", width: 4 },
        thickness: 0.75,
        value: 30,
      },
    },
  },
];

var altitudeData = [
  {
    domain: { x: [0, 1], y: [0, 1] },
    value: 0,
    title: { text: "Lux" },
    type: "indicator",
    mode: "gauge+number+delta",
    delta: { reference: 60 },
    gauge: {
      axis: { range: [null, 150] },
      steps: [
        { range: [0, 50], color: "lightgray" },
        { range: [50, 100], color: "gray" },
      ],
      threshold: {
        line: { color: "red", width: 4 },
        thickness: 0.75,
        value: 30,
      },
    },
  },
];

var layout = { width: 300, height: 250, margin: { t: 0, b: 0, l: 0, r: 0 } };

Plotly.newPlot(temperatureGaugeDiv, temperatureData, layout);
Plotly.newPlot(humidityGaugeDiv, humidityData, layout);
Plotly.newPlot(pressureGaugeDiv, pressureData, layout);
Plotly.newPlot(altitudeGaugeDiv, altitudeData, layout);

// Will hold the arrays we receive from our BME280 sensor
// Temperature
let newTempXArray = [];
let newTempYArray = [];
// Humidity
let newHumidityXArray = [];
let newHumidityYArray = [];
// Pressure
let newPressureXArray = [];
let newPressureYArray = [];
// Altitude
let newAltitudeXArray = [];
let newAltitudeYArray = [];

// The maximum number of data points displayed on our scatter/line graph
let MAX_GRAPH_POINTS = 12;
let ctr = 0;

// Callback function that will retrieve our latest sensor readings and redraw our Gauge with the latest readings

function updateSensorReadings(jsonResponse) {
  // var temperature;

  pressure = jsonResponse;




  console.log(typeof jsonResponse);
  console.log(jsonResponse);
  // console.log("output--------",parseInt(jsonResponse,16))
  // if (jsonResponse[3]== 30){
  //   temperature = jsonResponse[12]

  // }

  // if (jsonResponse[3]== 31){
  //   humidity = jsonResponse[12]

  // }

  // if (jsonResponse[3]== 32){
  //   pressure = jsonResponse[12]

  // }


  

  // let temperature = Number(jsonResponse.temperature).toFixed(2);
  // let humidity = Number(jsonResponse.humidity).toFixed(2);
  // let pressure = Number(jsonResponse.pressure).toFixed(2);
  // let altitude = Number(jsonResponse.altitude).toFixed(2);


  updateBoxes(temperature, humidity, pressure, altitude);




  updateCharts(
    pressureHistoryDiv,
    newPressureXArray,
    newPressureYArray,
    pressure
  );





  }
function updateSensorReadings_lux(jsonResponse) {
    // var temperature;
  
    altitude = jsonResponse;
  
  
  
  
    console.log(typeof jsonResponse);
    console.log(jsonResponse);
    // console.log("output--------",parseInt(jsonResponse,16))
    // if (jsonResponse[3]== 30){
    //   temperature = jsonResponse[12]
  
    // }
  
    // if (jsonResponse[3]== 31){
    //   humidity = jsonResponse[12]
  
    // }
  
    // if (jsonResponse[3]== 32){
    //   pressure = jsonResponse[12]
  
    // }
  
  
    
  
    // let temperature = Number(jsonResponse.temperature).toFixed(2);
    // let humidity = Number(jsonResponse.humidity).toFixed(2);
    // let pressure = Number(jsonResponse.pressure).toFixed(2);
    // let altitude = Number(jsonResponse.altitude).toFixed(2);
  
  
    updateBoxes(temperature, humidity, pressure, altitude);
    updateGauge(temperature1, humidity1, pressure1, altitude);
  
  
  
    updateCharts(
      altitudeHistoryDiv,
      newAltitudeXArray,
      newAltitudeYArray,
      altitude
    );
  
  
  
  
    }

function updateSensorReadings_temp(jsonResponse) {
    temperature =jsonResponse;
    console.log(typeof jsonResponse);
    console.log(jsonResponse);

  
  
    updateBoxes(temperature, humidity, pressure, altitude);
  
    // updateGauge(temperature, humidity, pressure, altitude);
  
    // Update Temperature Line Chart
    updateCharts(
      temperatureHistoryDiv,
      newTempXArray,
      newTempYArray,
      temperature
    );
    // Update Humidity Line Chart
    updateCharts(
      humidityHistoryDiv,
      newHumidityXArray,
      newHumidityYArray,
      humidity
    );
    // Update Pressure Line Chart
    updateCharts(
      pressureHistoryDiv,
      newPressureXArray,
      newPressureYArray,
      pressure
    );
  
    // Update Altitude Line Chart

  
  
  
    }

function updateSensorReadings_soilp(jsonResponse) {
      humidity1 =jsonResponse;
      
  
    
    

    
      updateGauge(temperature1, humidity1, pressure1, altitude);
    

      } 
function updateSensorReadings_soilk(jsonResponse) {
        pressure1 =jsonResponse;
        
    
      
      
  
      
        updateGauge(temperature1, humidity1, pressure1, altitude);
      
  
        } 
function updateSensorReadings_soiln(jsonResponse) {
        temperature1 =jsonResponse;
        
    
      
      
  
      
        updateGauge(temperature1, humidity, pressure, altitude);
      
  
        }   
        
    
    
function updateSensorReadings_humi(jsonResponse) {
      humidity =jsonResponse;
      console.log(typeof jsonResponse);
      console.log(jsonResponse);
  
    
    
      updateBoxes(temperature, humidity, pressure, altitude);
    
      updateGauge(temperature, humidity, pressure, altitude);
    
      // Update Temperature Line Chart
      updateCharts(
        temperatureHistoryDiv,
        newTempXArray,
        newTempYArray,
        temperature
      );
      // Update Humidity Line Chart
      updateCharts(
        humidityHistoryDiv,
        newHumidityXArray,
        newHumidityYArray,
        humidity
      );
      // Update Pressure Line Chart
      updateCharts(
        pressureHistoryDiv,
        newPressureXArray,
        newPressureYArray,
        pressure
      );
    
      // Update Altitude Line Chart
      updateCharts(
        altitudeHistoryDiv,
        newAltitudeXArray,
        newAltitudeYArray,
        altitude
      );
    
    
    
      }


function updateBoxes(temperature, humidity, pressure, altitude) {
  let temperatureDiv = document.getElementById("temperature");
  let humidityDiv = document.getElementById("humidity");
  let pressureDiv = document.getElementById("pressure");
  let altitudeDiv = document.getElementById("altitude");

  temperatureDiv.innerHTML = temperature + " C";
  humidityDiv.innerHTML = humidity + " %";
  pressureDiv.innerHTML = pressure + " ppm";
  altitudeDiv.innerHTML = altitude + " lux";
}

function updateGauge(temperature, humidity, pressure, altitude) {
  var temperature_update = {
    value: temperature,
  };
  var humidity_update = {
    value: humidity,
  };
  var pressure_update = {
    value: pressure,
  };
  var altitude_update = {
    value: altitude,
  };
  Plotly.update(temperatureGaugeDiv, temperature_update);
  Plotly.update(humidityGaugeDiv, humidity_update);
  Plotly.update(pressureGaugeDiv, pressure_update);
  Plotly.update(altitudeGaugeDiv, altitude_update);
}

function updateCharts(lineChartDiv, xArray, yArray, sensorRead) {
  if (xArray.length >= MAX_GRAPH_POINTS) {
    xArray.shift();
  }
  if (yArray.length >= MAX_GRAPH_POINTS) {
    yArray.shift();
  }
  xArray.push(ctr++);
  yArray.push(sensorRead);

  var data_update = {
    x: [xArray],
    y: [yArray],
  };

  Plotly.update(lineChartDiv, data_update);
}

function updateChartsBackground() {
  // updates the background color of historical charts
  var updateHistory = {
    plot_bgcolor: chartBGColor,
    paper_bgcolor: chartBGColor,
    font: {
      color: chartFontColor,
    },
    xaxis: {
      color: chartAxisColor,
      linecolor: chartAxisColor,
    },
    yaxis: {
      color: chartAxisColor,
      linecolor: chartAxisColor,
    },
  };
  historyCharts.forEach((chart) => Plotly.relayout(chart, updateHistory));

  // updates the background color of gauge charts
  var gaugeHistory = {
    plot_bgcolor: chartBGColor,
    paper_bgcolor: chartBGColor,
    font: {
      color: chartFontColor,
    },
    xaxis: {
      color: chartAxisColor,
      linecolor: chartAxisColor,
    },
    yaxis: {
      color: chartAxisColor,
      linecolor: chartAxisColor,
    },
  };
  gaugeCharts.forEach((chart) => Plotly.relayout(chart, gaugeHistory));
}

const mediaQuery = window.matchMedia("(max-width: 600px)");

mediaQuery.addEventListener("change", function (e) {
  handleDeviceChange(e);
});

function handleDeviceChange(e) {
  if (e.matches) {
    console.log("Inside Mobile");
    var updateHistory = {
      width: 323,
      height: 250,
      "xaxis.autorange": true,
      "yaxis.autorange": true,
    };
    historyCharts.forEach((chart) => Plotly.relayout(chart, updateHistory));
  } else {
    var updateHistory = {
      width: 550,
      height: 260,
      "xaxis.autorange": true,
      "yaxis.autorange": true,
    };
    historyCharts.forEach((chart) => Plotly.relayout(chart, updateHistory));
  }
}

/*
  MQTT Message Handling Code
*/
const mqttStatus = document.querySelector(".status");

function onConnect(message) {
  mqttStatus.textContent = "Connected";
}
function onMessage(topic, message) {

  if(topic=== "topic3"){
    try {
      // myObj.defineSandbox(false); 

  console.log("payload is ======",message)

  // console
  var stringResponse = message.toString();
  // console.log("tryingg  payload is ======",parseInt(message,16))
  var messageResponse = JSON.stringify(message);
  var obj = JSON.parse(messageResponse);
  console.log(obj.data);
  var arr =obj.data;



  // message.data
  console.log("tryingg stringfy actual value payload is ======",messageResponse)
  console.log("tryingg hex  payload is ======",parseInt(messageResponse.data,16))
  updateSensorReadings(arr);
//   var messageResponse = JSON.parse(stringResponse);
//   updateSensorReadings(messageResponse);
} catch( ex ) {
  console.log(ex)
  // execution continues here when an error was thrown. You can also inspect the `ex`ception object
}
  }
  if(topic==="esp32/temp"){
    try {
      // myObj.defineSandbox(false); 

    // onMessageArrived(message);
    var msgObject = JSON.parse(message.toString())
    var arr1=JSON.stringify(msgObject,'',2);
    console.log("message is john cennnnnnnna" + JSON.stringify(msgObject,'',2));

    // var messageResponse1 = JSON.stringify(message);
    // console.log("the message is ----",message)
    // console.log("the messageResponse1 is ----",messageResponse1)
    // var obj1 = JSON.parse(messageResponse1);
    // console.log(obj1.data);
    // var arr1 =obj1.data;
    // console.log("topic---- temp",arr1)
    // console.log(arr1)
    updateSensorReadings_temp(arr1);

  } catch( ex ) {
    console.log(ex)
    // execution continues here when an error was thrown. You can also inspect the `ex`ception object
}
  
  }
  if(topic==="soil/n"){
    try {
      // myObj.defineSandbox(false); 

    // onMessageArrived(message);
    var msgObject = JSON.parse(message.toString())
    var arr1=JSON.stringify(msgObject,'',2);
    console.log("message isoil/n" + JSON.stringify(msgObject,'',2));

    // var messageResponse1 = JSON.stringify(message);
    // console.log("the message is ----",message)
    // console.log("the messageResponse1 is ----",messageResponse1)
    // var obj1 = JSON.parse(messageResponse1);
    // console.log(obj1.data);
    // var arr1 =obj1.data;
    // console.log("topic---- temp",arr1)
    // console.log(arr1)
    updateSensorReadings_soiln(arr1);

  } catch( ex ) {
    console.log(ex)
    // execution continues here when an error was thrown. You can also inspect the `ex`ception object
}
  
  }

  if(topic==="soil/p"){
    try {
      // myObj.defineSandbox(false); 

    // onMessageArrived(message);
    var msgObject = JSON.parse(message.toString())
    var arr1=JSON.stringify(msgObject,'',2);
    console.log("message soil/p" + JSON.stringify(msgObject,'',2));

    // var messageResponse1 = JSON.stringify(message);
    // console.log("the message is ----",message)
    // console.log("the messageResponse1 is ----",messageResponse1)
    // var obj1 = JSON.parse(messageResponse1);
    // console.log(obj1.data);
    // var arr1 =obj1.data;
    // console.log("topic---- temp",arr1)
    // console.log(arr1)
    updateSensorReadings_soilp(arr1);

  } catch( ex ) {
    console.log(ex)
    // execution continues here when an error was thrown. You can also inspect the `ex`ception object
}
  
  }

  if(topic==="soil/k"){
    try {
      // myObj.defineSandbox(false); 

    // onMessageArrived(message);
    var msgObject = JSON.parse(message.toString())
    var arr1=JSON.stringify(msgObject,'',2);
    console.log("message soil/k" + JSON.stringify(msgObject,'',2));

    // var messageResponse1 = JSON.stringify(message);
    // console.log("the message is ----",message)
    // console.log("the messageResponse1 is ----",messageResponse1)
    // var obj1 = JSON.parse(messageResponse1);
    // console.log(obj1.data);
    // var arr1 =obj1.data;
    // console.log("topic---- temp",arr1)
    // console.log(arr1)
    updateSensorReadings_soilk(arr1);

  } catch( ex ) {
    console.log(ex)
    // execution continues here when an error was thrown. You can also inspect the `ex`ception object
}
  
  }
  if(topic==="lux"){
    try {
      // myObj.defineSandbox(false); 

    // onMessageArrived(message);
    var msgObject = JSON.parse(message.toString())
    var arr1=JSON.stringify(msgObject,'',2);
    console.log("message soil/k" + JSON.stringify(msgObject,'',2));

    // var messageResponse1 = JSON.stringify(message);
    // console.log("the message is ----",message)
    // console.log("the messageResponse1 is ----",messageResponse1)
    // var obj1 = JSON.parse(messageResponse1);
    // console.log(obj1.data);
    // var arr1 =obj1.data;
    // console.log("topic---- temp",arr1)
    // console.log(arr1)
    updateSensorReadings_lux(arr1);

  } catch( ex ) {
    console.log(ex)
    // execution continues here when an error was thrown. You can also inspect the `ex`ception object
}
  
  }

  // if (temperature && humidity) {
  //   //do database update or print
  //   console.log("----");
  //   console.log("temp: %s", temperature);
  //   console.log("----");
  //   console.log("humidity: %s", humidity);
  //   //reset to undefined for next time
  //   temperature = undefined;
  //   humidity = undefined;
//  }
  if(topic==="esp32/humi"){
    // onMessageArrived(message);
    try {
      // myObj.defineSandbox(false); 

    var msgObject = JSON.parse(message.toString())
    var arr2=JSON.stringify(msgObject,'',2);
    console.log("message is john cennnnnnnna" + JSON.stringify(msgObject,'',2));

    updateSensorReadings_humi(arr2);
  } catch( ex ) {
    console.log(ex)
    // execution continues here when an error was thrown. You can also inspect the `ex`ception object
}
  
  }
  if(topic==="esp32/tds"){
    try {
      // myObj.defineSandbox(false); 

      var msgObject = JSON.parse(message.toString())
      var arr_tds=JSON.stringify(msgObject,'',2);
      console.log("message is john cennnnnnnna" + JSON.stringify(msgObject,'',2));
    updateSensorReadings(arr_tds);
  } catch( ex ) {
    // execution continues here when an error was thrown. You can also inspect the `ex`ception object
    console.log(ex)
}
  
  }
}

function onMessage1(topic, message) {


  if(topic=="esp32/temp"){
    var messageResponse = JSON.stringify(message);
    var obj = JSON.parse(messageResponse);
    console.log(obj.data);
    var arr =obj.data;
    console.log("topic---- temp",arr)
    console.log(arr)
    updateSensorReadings(arr);
  
  }

}


function onMessage2(topic, message) {

  
  if(topic=="esp32/humi"){
    var messageResponse = JSON.stringify(message);
    var obj = JSON.parse(messageResponse);
    console.log(obj.data);
    var arr =obj.data;
    console.log("topic---- humi",arr)
    updateSensorReadings(arr);
  
  }

}

function onMessage3(topic, message) {


  if(topic=="esp32/tds"){
    var messageResponse = JSON.stringify(message);
    var obj = JSON.parse(messageResponse);
    console.log(obj.data);
    var arr =obj.data;
    console.log("topic---- tds",arr)
    updateSensorReadings(arr);
  
  }
}

function onError(error) {
  console.log(`Error encountered :: ${error}`);
  mqttStatus.textContent = "Error";
}

function onClose() {
  console.log(`MQTT connection closed!`);
  mqttStatus.textContent = "Closed";
}

function fetchMQTTConnection() {
  fetch("/mqttConnDetails", {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log("main data===========",data)
      // initializeMQTTConnection(data.mqttServer, data.mqttTopic,data.mqttTopi2,data.mqttTopi3,data.mqttTopi4);
      initializeMQTTConnection(data.mqttServer);
      // initializeMQTTConnection2(data.mqttServer, data.mqttTopic3);
      // initializeMQTTConnection3(data.mqttServer, data.mqttTopic4);
    })
    .catch((error) => console.error("Error getting MQTT Connection :", error));
}

// function onMessageArrived(message) {
//   // var payload = message.payloadBytes
//   // var length = payload.length();
//   // var buffer = new ArrayBuffer(length);
//   // uint = new Uint8Array(buffer);
//   // for (var i=0; i<length; i++) {
// 	//   uint[i] = payload[i];
//   // }
//   // var dataView = new DataView(uint.buffer);
//   // for (var i=0; i<length/8; i++) {
//   //     console.log(dataView.getFloat64((i*8), false));
//   // }
//   var msgObject = JSON.parse(message.toString())
//   console.log("message is john cennnnnnnna" + JSON.stringify(msgObject,'',2));
//   // console.log("topic is "+ topic);

// //   var payload = message.payloadByte
// //   var doubleView = new Float64Array(payload);
// //   var number = doubleView[0];
// //   console.log("the number is john cenaaaa",number);
// };
function initializeMQTTConnection(mqttServer) {
  console.log(
    `Initializing connection to :: ${mqttServer}, } `
  );
  var fnCallbacks = { onConnect, onMessage, onError, onClose };

  var mqttService = new MQTTService(mqttServer, fnCallbacks);
  mqttService.connect();

  // mqttService.subscribe([mqttTopic,mqttTopic2],[2,0]);
  // mqttService.subscribe(mqttTopic1);
  // mqttService.subscribe(mqttTopic3);
  // mqttService.subscribe(mqttTopic4);
  mqttService.subscribe("iot/temp")
  mqttService.subscribe("iot/humi")
  mqttService.subscribe("iot/tds")
  mqttService.subscribe("iot/lux")
  mqttService.subscribe("iot/N")
  mqttService.subscribe("iot/P")
  mqttService.subscribe("iot/K")

  // mqttService.subscribe("esp32/temp",
  // mqtt.AT_MOST_ONCE,
  // function(qosMode) {
  //     // This is the subscription acknowledgement callback
  //     if (qosMode < 0x80) {
  //         // We are subscribed, so inform the user...
  //         console.log("Subscribed to \'esp32/temp' with delivery mode: " + qosMode + ".");
  //         console.log("Subscribed to \'esp32/temp' with delivery mode: " + qosMode + ".");

  //         // ...and set the message handler
  //         mqttService.onmessage(onMessage);
  //     } else {
  //         // We couldn't subscribe for some reason so inform the user
  //         console.log("Not subscribed to \'imp.mqtt.test.pings\'.");
  //     }
  // });



}

// function initializeMQTTConnection1(mqttServer, mqttTopic2) {
//   console.log(
//     `Initializing connection to :: ${mqttServer}, topic :: ${mqttTopic2}`
//   );
//   var fnCallbacks2 = { onConnect, onMessage1, onError, onClose };

//   var mqttService2 = new MQTTService(mqttServer, fnCallbacks2);
//   mqttService2.connect();
//   mqttService2.subscribe(mqttTopic2);

// }


// function initializeMQTTConnection2(mqttServer, mqttTopic3) {
//   console.log(
//     `Initializing connection to :: ${mqttServer}, topic :: ${mqttTopic3}`
//   );
//   var fnCallbacks3 = { onConnect, onMessage2, onError, onClose };

//   var mqttService3 = new MQTTService(mqttServer, fnCallbacks3);
//   mqttService3.connect();


//   mqttService3.subscribe(mqttTopic3);

// }

// function initializeMQTTConnection3(mqttServer, mqttTopic4) {
//   console.log(
//     `Initializing connection to :: ${mqttServer}, topic :: ${mqttTopic4}`
//   );
//   var fnCallbacks4 = { onConnect, onMessage3, onError, onClose };

//   var mqttService4 = new MQTTService(mqttServer, fnCallbacks4);
//   mqttService4.connect();


//   mqttService4.subscribe(mqttTopic4);

// }

