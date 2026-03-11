const fs = require("fs");
const csv = require("csv-parser");

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {

    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {

        // Normalize Azure / AWS / GCP column names
        const normalized = {
          month: row.Month || row.UsageDate || "",
          provider: row.Provider || "Azure",
          service: row.Service || row.ServiceName || "",
          region: row.Region || "",
          cost: parseFloat(row.Cost || row.cost || 0)
        };

        rows.push(normalized);

      })
      .on("end", () => {
        resolve(rows);
      })
      .on("error", reject);
  });
}

module.exports = parseCSV;