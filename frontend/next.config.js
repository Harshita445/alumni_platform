/**
 * Ensure Turbopack uses the frontend folder as the project root.
 * This avoids Next inferring the workspace root incorrectly when the
 * repository contains other top-level `src/` folders.
 */

/** @type {import('next').NextConfig} */
const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  turbopack: {
    // Use absolute path to frontend directory to avoid incorrect root inference
    root: path.resolve(__dirname),
  },
};
