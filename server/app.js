require('./config/env');

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const authRoutes = require('./routes/authRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const questionRoutes = require('./routes/questionRoutes');
const progressRoutes = require('./routes/progressRoutes');
const tagRoutes = require('./routes/tagRoutes');

const app = express();

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(logger);
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is healthy
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
/**
 * @openapi
 * /api/docs-yaml:
 *   get:
 *     summary: Get Swagger schema in YAML format
 *     tags:
 *       - Docs
 *     responses:
 *       200:
 *         description: YAML schema
 */
app.get('/api/docs-yaml', (req, res) => {
  res.type('text/yaml').send(yaml.dump(swaggerSpec, { noRefs: true }));
});
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/tags', tagRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
