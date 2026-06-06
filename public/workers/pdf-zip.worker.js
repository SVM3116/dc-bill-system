/* eslint-disable no-restricted-globals */

// Import JSZip inside the worker using CDN
importScripts("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");

self.onmessage = async function (e) {
  const { documents, baseUrl } = e.data;
  
  if (!documents || documents.length === 0) {
    self.postMessage({ type: "error", error: "No documents provided" });
    return;
  }

  try {
    const zip = new JSZip();

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const currentNum = i + 1;
      
      self.postMessage({
        type: "progress",
        current: currentNum,
        total: documents.length,
        number: doc.number,
        percent: 10 + Math.floor((currentNum / documents.length) * 80)
      });

      const apiEndpoint = doc.type === "dc_bill" ? "/api/pdf" : "/api/hand-voucher-pdf";
      // Construct full absolute URL using baseUrl to ensure absolute path works inside worker
      const fetchUrl = `${baseUrl}${apiEndpoint}?id=${doc.id}&download=true`;

      try {
        const res = await fetch(fetchUrl);
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        const blob = await res.blob();
        const cleanNum = doc.number.replace(/[^a-zA-Z0-9-]/g, "_");
        const filename = doc.type === "dc_bill" 
          ? `DC_Bill_${cleanNum}.pdf` 
          : `Hand_Voucher_${cleanNum}.pdf`;

        zip.file(filename, blob);
      } catch (fetchErr) {
        self.postMessage({
          type: "warning",
          message: `Failed to download ${doc.number}, skipping.`
        });
      }
    }

    self.postMessage({ type: "progress", percent: 95, statusText: "Generating ZIP archive..." });

    const zipContent = await zip.generateAsync({ type: "blob" });

    // Send the compiled blob back to the main thread
    self.postMessage({ type: "success", blob: zipContent });

  } catch (err) {
    self.postMessage({ type: "error", error: err.message || "Unknown error during ZIP generation" });
  }
};
