import app from '#src/app.js';
import request from 'supertest';

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('GET /health ', async () => {
      const response = await request(app).get('/health').expect(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timeStamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api', () => {
    it('GET /api ', async () => {
      const response = await request(app).get('/api').expect(200);
      expect(response.body).toHaveProperty(
        'message',
        'Acquisitions API is running!'
      );
    });
  });

  describe('GET /unknown-route', () => {
    it('GET /unknown-route should return 404', async () => {
      const response = await request(app).get('/unknown-route').expect(404);
      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});
