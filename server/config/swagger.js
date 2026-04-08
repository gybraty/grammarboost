const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const definition = {
  openapi: '3.0.0',
  info: {
    title: 'GrammarBoost API',
    version: '1.0.0',
  },
  servers: [{ url: '/' }],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
      },
      refreshCookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', example: 'learner' },
          profile: {
            type: 'object',
            properties: {
              displayName: { type: 'string' },
              level: { type: 'string', example: 'A1' },
              goals: { type: 'string' },
              avatarUrl: { type: 'string' },
            },
          },
        },
      },
      LessonMedia: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          publicId: { type: 'string' },
          resourceType: { type: 'string' },
          format: { type: 'string' },
          width: { type: 'number' },
          height: { type: 'number' },
          bytes: { type: 'number' },
          alt: { type: 'string' },
        },
      },
      Tag: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
        },
      },
      Lesson: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          level: { type: 'string', example: 'A1' },
          title: { type: 'string' },
          slug: { type: 'string' },
          summary: { type: 'string' },
          content: { type: 'string' },
          media: {
            type: 'array',
            items: { $ref: '#/components/schemas/LessonMedia' },
          },
          tags: {
            type: 'array',
            items: { $ref: '#/components/schemas/Tag' },
          },
          isPublished: { type: 'boolean' },
        },
      },
      Question: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          lesson: { type: 'string' },
          type: { type: 'string', example: 'multiple-choice' },
          prompt: { type: 'string' },
          choices: { type: 'array', items: { type: 'string' } },
          correctAnswers: { type: 'array', items: { type: 'string' } },
          explanation: { type: 'string' },
          order: { type: 'number' },
          difficulty: { type: 'number' },
        },
      },
      QuizQuestion: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string' },
          prompt: { type: 'string' },
          choices: { type: 'array', items: { type: 'string' } },
          order: { type: 'number' },
          difficulty: { type: 'number' },
        },
      },
      QuizResult: {
        type: 'object',
        properties: {
          attemptId: { type: 'string' },
          score: { type: 'number' },
          maxScore: { type: 'number' },
          percentage: { type: 'number' },
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                questionId: { type: 'string' },
                userAnswer: { type: 'string' },
                isCorrect: { type: 'boolean' },
                correctAnswers: { type: 'array', items: { type: 'string' } },
                explanation: { type: 'string' },
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              details: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  },
};

const options = {
  definition,
  apis: [path.join(__dirname, '../routes/*.js'), path.join(__dirname, '../app.js')],
};

module.exports = swaggerJSDoc(options);
