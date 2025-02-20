const multer = require("multer");

const storage = multer.memoryStorage(); // Store images in memory (RAM)
const upload = multer({ storage });

module.exports = upload;
