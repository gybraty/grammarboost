const request = require('supertest');
const app = require('../app');

describe('Auth routes', () => {
  it('registers, logs in, and refreshes tokens', async () => {
    const agent = request.agent(app);
    const email = 'learner@example.com';
    const password = 'StrongPass123!';

    const registerRes = await agent.post('/api/auth/register').send({
      email,
      password,
      displayName: 'Learner',
      level: 'A1',
      goals: 'Improve grammar',
    });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.data.email).toBe(email);
    expect(registerRes.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/accessToken=/),
        expect.stringMatching(/refreshToken=/),
      ])
    );

    const meRes = await agent.get('/api/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe(email);

    const loginRes = await agent.post('/api/auth/login').send({ email, password });
    expect(loginRes.status).toBe(200);

    const refreshRes = await agent.post('/api/auth/refresh');
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.email).toBe(email);
  });
});
