// Create new file: middlewares/timeoutMiddleware.js
const timeout = (seconds) => {
  const ms = seconds * 1000;
  
  return (req, res, next) => {
    res.setTimeout(ms, () => {
      res.status(408).json({ message: 'Request timeout' });
    });
    next();
  };
};

module.exports = timeout;

// In server.js
const timeout = require('./middlewares/timeoutMiddleware');
app.use(timeout(8)); // 8 second timeout
