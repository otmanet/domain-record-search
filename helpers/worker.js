const { parentPort } = require("worker_threads");
const dns = require("dns");
parentPort.on("message", ({ domain }) => {
  dns.resolveTxt(domain, (err, records) => {
    if (err) {
      parentPort.postMessage({ domain, txtRecords: null, error: err.message });
    } else {
      const txtRecords = records.flat().join(" ");
      parentPort.postMessage({ domain, txtRecords });
    }
  });
});
