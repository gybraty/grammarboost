const request = require('supertest');
const app = require('../app');
const { User } = require('../models');

describe('Tag routes', () => {
  it('allows admins to create tags and lists them', async () => {
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

    const createRes = await agent.post('/api/tags').send({
      name: 'Articles',
      description: 'Definite and indefinite articles',
    });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.name).toBe('Articles');

    const listRes = await agent.get('/api/tags');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBe(1);
  });
});
