import { vi, expect, describe, it } from 'vitest';
import { User } from '../models/user.model'; // The User model
import supertest from 'supertest';
import { app } from '../server'; // Your app instance
import { storeRefreshToken } from '../utils/redis'; // Import the function for mocking

// Mock dependencies
vi.mock('../models/user.model'); // Mock User model
vi.mock('../utils/auth', () => ({
  generateAuthTokens: vi.fn().mockReturnValue({
    accessToken: 'mockAccessToken',
    refreshToken: 'mockRefreshToken',
  }), // Mock token generation
}));
vi.mock('../utils/redis', () => ({
  storeRefreshToken: vi.fn().mockResolvedValue(true), // Mock Redis storage
}));

describe('POST /login', () => {
  it('should successfully log in a user', async () => {
    console.log('Testing login functionality with valid user credentials');
    // Mock User and utility functions
    const mockUser = {
      _id: 'mockuser123',
      name: 'Test User',
      email: 'test@example.com',
      matchPassword: vi.fn().mockResolvedValue(true), // Mock password match
    };

    User.findOne.mockResolvedValue(mockUser); // Simulate a found user

    // Call the endpoint with mock data
    const response = await supertest(app).post('/api/v1/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    console.log('Received response:', response.body);
    

    // Assert response
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User logged in successfully');
    expect(response.body.data).toHaveProperty('accessToken');
    expect(typeof response.body.data.accessToken).toBe('string');

    // Assert mocked functions were called with correct arguments
    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(mockUser.matchPassword).toHaveBeenCalledWith('password123');
    // expect(storeRefreshToken).toHaveBeenCalledWith('mockuser123', 'mockRefreshToken');

  });
});
