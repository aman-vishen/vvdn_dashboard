const express = require("express");

const app = express();
const port = 3000;

// load dotenv to read environment variables
require("dotenv").config();

// template view engine
app.set("view engine", "ejs");

// Serve Static Files
app.use(express.static("public"));

//routes
const dashboardRouter = require("./routes/dashboard");

app.get("/mqttConnDetails", (req, res) => {
  res.send(
    JSON.stringify({
      mqttServer: process.env.MQTT_BROKER,
      // mqttTopic: process.env.MQTT_TOPIC,
      // mqttTopic2: process.env.MQTT_TOPIC1,
      // mqttTopic3: process.env.MQTT_TOPIC2,
      // mqttTopic4: process.env.MQTT_TOPIC4,
    })
  );
});

app.get("/", dashboardRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
