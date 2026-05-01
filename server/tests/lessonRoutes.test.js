jest.mock('../services/r2Service', () => ({
  uploadPdfBuffer: jest.fn(),
  deletePdfObject: jest.fn().mockResolvedValue(),
  getKeyFromPublicUrl: jest.fn(),
}));

const request = require('supertest');
const app = require('../app');
const { User } = require('../models');
const { deletePdfObject } = require('../services/r2Service');

const createAdminAgent = async () => {
  const agent = request.agent(app);
  const email = 'admin@example.com';
  const password = 'StrongPass123!';

  await agent.post('/api/auth/register').send({
    email,
    password,
    displayName: 'Admin',
  });

  await User.findOneAndUpdate({ email }, { role: 'admin' });
  await agent.post('/api/auth/login').send({ email, password });
  return agent;
};

describe('Lesson routes', () => {
  it('creates and lists lessons with content links', async () => {
    const agent = await createAdminAgent();
    const contentLink = 'https://cdn.example.com/lessons/articles.pdf';

    const createRes = await agent.post('/api/lessons').send({
      title: 'Articles and determiners',
      level: 'A1',
      summary: 'Intro to articles',
      contentLink,
      tags: [],
      isPublished: true,
    });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.contentLink).toBe(contentLink);

    const listRes = await agent.get('/api/lessons');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(1);
    expect(listRes.body.data[0].contentLink).toBe(contentLink);
  });

  it('requires content links when creating lessons', async () => {
    const agent = await createAdminAgent();

    const res = await agent.post('/api/lessons').send({
      title: 'Missing content',
      level: 'A1',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Level, title, and content link are required');
  });

  it('deletes lesson content from R2 and clears the lesson', async () => {
    const agent = await createAdminAgent();
    const contentLink = 'https://cdn.example.com/lessons/articles.pdf';

    const createRes = await agent.post('/api/lessons').send({
      title: 'Articles and determiners',
      level: 'A1',
      contentLink,
      contentKey: 'lessons/123-articles.pdf',
      tags: [],
      isPublished: true,
    });

    const lessonId = createRes.body.data._id;
    const deleteRes = await agent.delete(`/api/lessons/${lessonId}/content`);

    expect(deleteRes.status).toBe(200);
    expect(deletePdfObject).toHaveBeenCalledWith('lessons/123-articles.pdf');
    expect(deleteRes.body.data.contentLink).toBe(null);
    expect(deleteRes.body.data.contentKey).toBe(null);
  });
});
