"use strict";
require("dotenv").config();
const PORT = process.env.PORT;
const caps = require("socket.io")(PORT);
const owners = caps.of("/owners");
const drivers = caps.of("/drivers");
const customs = caps.of("/customs");

const uuid = require("uuid").v4;
const msgQueue = {
  companies: {
    madaba: { cars: ["1", "2", "3", "4", "5"], req: {} },
    amman: { cars: ["6", "7", "8", "9", "10"], req: {} },
  },
  cars: [
    ["1", "madaba"],
    ["2", "madaba"],
    ["3", "madaba"],
    ["4", "madaba"],
    ["5", "madaba"],
    ["6", "amman"],
    ["7", "amman"],
    ["8", "amman"],
    ["9", "amman"],
    ["10", "amman"],
  ],
};

customs.on("connection", (socket) => {
  console.log("customs connected", socket.id);
  socket.on("rental-res", (payload) => {
    customs.emit("res", payload);
  });
});
owners.on("connection", (socket) => {
  console.log("owner connected", socket.id);
  socket.on("get-all", (payload) => {
    Object.values(msgQueue.companies[payload].req).forEach((id) => {
      owners.emit("all", id);
    });
  });
  socket.on("req-fromCus", (payload) => {
    for (let i = 0; i < msgQueue.cars.length; i++) {
      if (msgQueue.cars[i][0] == [payload.carid]) {
        msgQueue.companies[msgQueue.cars[i][1]].req[
          payload.carid
        ] = `there is a customer need a car that have id:${payload.carid} from ${payload.startDate} to ${payload.endDate} `;

        break;
      }
    }
    owners.emit("rent-req", payload);
  });
});

drivers.on("connection", (socket) => {
  console.log("driver connected");
  socket.on("custom-need-driver", (payload) => {
    drivers.emit("mission", payload);
  });
});
