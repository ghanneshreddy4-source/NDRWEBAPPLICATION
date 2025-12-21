// routes/videoRoutes.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

/**
 * ✅ Google Drive Public Video Streaming Proxy
 * Decodes Base64 fileId from URL, handles large files & Range streaming.
 */
router.get("/api/drive-video/:encodedId", async (req, res) => {
  try {
    // --- Step 1: Decode Base64 File ID ---
    const fileId = Buffer.from(req.params.encodedId, "base64").toString("utf-8").trim();
    if (!fileId) {
      return res.status(400).json({ error: "Invalid file ID." });
    }

    const baseUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const range = req.headers.range;

    // --- Step 2: Initial request to get confirm token if needed ---
    const init = await axios.get(baseUrl, {
      responseType: "text",
      validateStatus: () => true,
    });

    let confirmToken = null;
    const tokenMatch = init.data.match(/confirm=([0-9A-Za-z_]+)/);
    if (tokenMatch) confirmToken = tokenMatch[1];

    const cookies = init.headers["set-cookie"] || [];
    const downloadUrl = confirmToken ? `${baseUrl}&confirm=${confirmToken}` : baseUrl;

    // --- Step 3: Build headers for Range requests ---
    const headers = {};
    if (range) headers["Range"] = range;
    if (cookies.length) headers["Cookie"] = cookies.join("; ");

    // --- Step 4: Request video stream ---
    const response = await axios({
      url: downloadUrl,
      method: "GET",
      responseType: "stream",
      headers,
    });

    const contentType = response.headers["content-type"] || "video/mp4";
    const contentRange = response.headers["content-range"];
    const contentLength = response.headers["content-length"];
    const statusCode = contentRange ? 206 : 200;

    // --- Step 5: Send headers to client ---
    res.writeHead(statusCode, {
      "Content-Type": contentType,
      "Content-Length": contentLength,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
      ...(contentRange && { "Content-Range": contentRange }),
    });

    // --- Step 6: Stream the video ---
    response.data.pipe(res);
  } catch (error) {
    console.error("❌ Drive video stream error:", error.message);
    res.status(500).json({
      error: "Unable to stream Google Drive video. Ensure the file is public and shared with 'Anyone with the link'.",
    });
  }
});

module.exports = router;
