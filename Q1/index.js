const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const app = express();
const port = 3100;

app.locals.authToken = null;

const fetchTrains = async (authToken) => {
  const url = "http://20.244.56.144/train/trains";
  const options = {
    method: "GET",
    headers: {
      Authorization: "Bearer " + authToken,
    },
  };
  const traindata = await fetch(url, options)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    });
  return traindata;
};

const authorise = async () => {
  const url = "http://20.244.56.144/train/auth";
  const body = {
    companyName: "Rishi travels",
    clientID: "699091f4-4d9e-45f1-8716-a93fcec2fedb",
    clientSecret: "IujDpHYjxeUBrVfd",
    ownerName: "Rishi Madan",
    ownerEmail: "rishimadan014@gmail.com",
    rollNo: "R2142201672",
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
  const authToken = await fetch(url, options)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    });
  return authToken.access_token;
};

const filter = (data) => {
  const filteredData = data.map((train) => {
    // Current time
    const currentTime = new Date();
    const maxTime = currentTime.setHours(currentTime.getHours() + 12);
    // Departure time
    let departureTime = new Date();
    departureTime.setHours(
      train.departureTime.Hours,
      train.departureTime.Minutes,
      train.departureTime.Seconds
    );
    departureTime.setHours(departureTime.getHours() + train.delayedBy);

    if (departureTime >= maxTime && departureTime < currentTime) {
      console.log("Train is delayed by more than 12 hours");
      return;
    }

    return {
      trainName: train.trainName,
      d_time: departureTime.toISOString(),
      c_time: currentTime.toISOString(),
      delay: train.delayedBy,
    };
  });
  return filteredData;
};

app.get("/", async (req, res) => {
  const authToken = app.locals.authToken?.toString();
  let data = await fetchTrains(authToken);

  if (!data.length) {
    const authToken = await authorise();
    app.locals.authToken = authToken;
    data = await fetchTrains(authToken);
  }
  console.log(data.length);
  data = filter(data);
  res.send(data);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
