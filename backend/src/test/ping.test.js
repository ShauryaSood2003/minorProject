import supertest from 'supertest';
import { app } from '../server'; // Ensure the app instance is imported correctly

describe('GET /ping', () => {
  it('should return a 200 status and a success message', async () => {
    const response = await supertest(app).get('/ping');

    // Check the response status code
    expect(response.status).toBe(200);

    // Check the response body
    expect(response.body).toEqual({
      message: 'Backend is working perfectly'
    });
  });
});
