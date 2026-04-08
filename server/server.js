require('./config/env');

const app = require('./app');
const { connectDb } = require('./config/db');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
