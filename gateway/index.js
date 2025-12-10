const { exec } = require('child_process');
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Gateway service listening on port ${PORT}`);

  // macOS: open the browser when the server starts
  exec(`open http://localhost:${PORT}/health`, (error) => {
    if (error) {
      console.error('Failed to open browser:', error.message);
    }
  });
});
