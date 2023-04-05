import xlsx from "node-xlsx";
import parse from "date-fns/parse";
import * as math from "mathjs";

import express from "express";
const app = express();
const port = 3000;

const init = async () => {
  let excel = xlsx.parse("./DataForTest.xlsx", {
    cellDates: true,
  });

  let finalData = excel[0].data;

  app.get("/SelectAllData", (req, res) => {
    let queryParams = req.query;
    let city = queryParams.city;
    let startDateQ = queryParams.startDate;
    let endDateQ = queryParams.endDate;
    let startDate: Date | null = null,
      endDate: Date | null = null;

    if (!city) {
      res.status(400);
      res.send("Missing city in query parameters");
      return;
    }
    if (startDateQ) {
      startDate = parse(startDateQ as string, "yyyy-MM-dd", new Date());
    }
    if (endDateQ) {
      endDate = parse(endDateQ as string, "yyyy-MM-dd", new Date());
    }
    if (startDate && endDate && startDate > endDate) {
      res.status(400);
      res.send("Start date is after end date");
      return;
    }

    let filtered = finalData.filter((val: any) => {
      return (
        val[0] == city &&
        (endDate ? val[1] <= endDate : true) &&
        (startDate ? val[1] >= startDate : true)
      );
    });

    res.send(filtered);
  });

  app.get("/SelectKW", (req, res) => {
    let queryParams = req.query;
    let city = queryParams.city;

    if (!city) {
      res.status(400);
      res.send("Missing city in query parameters");
      return;
    }

    let filtered = finalData
      .filter((val: any) => {
        return val[0] == city;
      })
      .map((x: any) => x[2]);

    const standardDeviation = math.std(filtered);
    const max = Math.max(...filtered);
    const min = Math.min(...filtered);
    const mean = math.mean(filtered);

    res.send({
      standardDeviation,
      max,
      min,
      mean,
    });
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
