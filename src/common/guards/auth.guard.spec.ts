import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockRequest: { headers: { authorization?: string } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGuard],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);

    // Mock request object
    mockRequest = {
      headers: {},
    };

    // Mock execution context
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as jest.Mocked<ExecutionContext>;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for valid Bearer token', () => {
      mockRequest.headers.authorization = 'Bearer valid-token-123';

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true for Bearer token with spaces', () => {
      mockRequest.headers.authorization = 'Bearer token-with-spaces';

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true for Bearer token with special characters', () => {
      mockRequest.headers.authorization = 'Bearer token!@#$%^&*()';

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when Authorization header is missing', () => {
      mockRequest.headers.authorization = undefined;

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Authorization header is required',
      );
    });

    it('should throw UnauthorizedException when Authorization header is null', () => {
      mockRequest.headers.authorization = null;

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Authorization header is required',
      );
    });

    it('should throw UnauthorizedException when Authorization header is empty string', () => {
      mockRequest.headers.authorization = '';

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Authorization header is required',
      );
    });

    it('should throw UnauthorizedException when Authorization header is not Bearer format', () => {
      mockRequest.headers.authorization = 'Basic dXNlcjpwYXNz';

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Bearer token is required');
    });

    it('should throw UnauthorizedException when Authorization header is missing Bearer prefix', () => {
      mockRequest.headers.authorization = 'token123';

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Bearer token is required');
    });

    it('should throw UnauthorizedException when Bearer token is empty', () => {
      mockRequest.headers.authorization = 'Bearer ';

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Token is required');
    });

    it('should throw UnauthorizedException when Bearer token is only spaces', () => {
      mockRequest.headers.authorization = 'Bearer   ';

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Token is required');
    });

    it('should throw UnauthorizedException when Bearer token is only tabs', () => {
      mockRequest.headers.authorization = 'Bearer\t\t';

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Bearer token is required');
    });

    it('should throw UnauthorizedException when Bearer token is only newlines', () => {
      mockRequest.headers.authorization = 'Bearer\n\n';

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Bearer token is required');
    });

    it('should throw UnauthorizedException when Bearer token is only carriage returns', () => {
      mockRequest.headers.authorization = 'Bearer\r\r';

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Bearer token is required');
    });

    it('should throw UnauthorizedException when Bearer token is mixed whitespace', () => {
      mockRequest.headers.authorization = 'Bearer \t\n\r ';

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Token is required');
    });

    it('should handle case sensitivity correctly', () => {
      mockRequest.headers.authorization = 'bearer valid-token';

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Bearer token is required');
    });

    it('should handle extra spaces in Bearer prefix', () => {
      mockRequest.headers.authorization = 'Bearer  valid-token';

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle multiple Bearer prefixes', () => {
      mockRequest.headers.authorization = 'Bearer Bearer valid-token';

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle Bearer with no space after', () => {
      mockRequest.headers.authorization = 'Bearervalid-token';

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Bearer token is required');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long tokens', () => {
      const longToken = 'a'.repeat(10000);
      mockRequest.headers.authorization = `Bearer ${longToken}`;

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle tokens with unicode characters', () => {
      mockRequest.headers.authorization = 'Bearer token-🚀-emoji-测试';

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle tokens with special characters', () => {
      mockRequest.headers.authorization = 'Bearer token!@#$%^&*()_+-=[]{}|;:,.<>?';

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle tokens with numbers', () => {
      mockRequest.headers.authorization = 'Bearer token123456789';

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle tokens with hyphens and underscores', () => {
      mockRequest.headers.authorization = 'Bearer token-with-hyphens_and_underscores';

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });
  });

  describe('Error Message Validation', () => {
    it('should provide correct error message for missing header', () => {
      mockRequest.headers.authorization = undefined;

      try {
        guard.canActivate(mockExecutionContext);
        fail('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Authorization header is required');
        expect(error.getStatus()).toBe(401);
      }
    });

    it('should provide correct error message for invalid format', () => {
      mockRequest.headers.authorization = 'InvalidFormat token';

      try {
        guard.canActivate(mockExecutionContext);
        fail('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Bearer token is required');
        expect(error.getStatus()).toBe(401);
      }
    });

    it('should provide correct error message for empty token', () => {
      mockRequest.headers.authorization = 'Bearer ';

      try {
        guard.canActivate(mockExecutionContext);
        fail('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Token is required');
        expect(error.getStatus()).toBe(401);
      }
    });
  });
});
