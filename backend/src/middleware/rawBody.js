/**
 * Middleware that captures the raw body for webhook signature verification
 * while still allowing express.json() to parse the body normally.
 * 
 * Stores raw body as `req.rawBody` (string) before JSON parsing.
 */
function captureRawBody(req, res, buf) {
  req.rawBody = buf.toString();
}

module.exports = { captureRawBody };
