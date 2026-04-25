import { errorHandler } from '../middleware/errorHandler';
import { logger } from '../middleware/logger';

const validationResultMock = jest.fn();

jest.mock('express-validator', () => ({
  validationResult: (...args: unknown[]) => validationResultMock(...args),
}));

import { validate } from '../middleware/validate';

function createRes() {
  return {
    statusCode: 200,
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    on: jest.fn(),
  } as any;
}

describe('middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validate returns 400 with mapped validation details', () => {
    validationResultMock.mockReturnValue({
      isEmpty: () => false,
      array: () => [
        { path: 'email', msg: 'Invalid email' },
        { msg: 'Generic error without path' },
      ],
    });

    const req: any = {};
    const res = createRes();
    const next = jest.fn();

    validate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation failed',
      details: [
        { field: 'email', message: 'Invalid email' },
        { field: 'unknown', message: 'Generic error without path' },
      ],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('validate calls next when there are no validation errors', () => {
    validationResultMock.mockReturnValue({ isEmpty: () => true, array: () => [] });

    const req: any = {};
    const res = createRes();
    const next = jest.fn();

    validate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('errorHandler returns database error response for known prisma errors', () => {
    const error = { name: 'PrismaClientKnownRequestError', message: 'db fail' } as Error;
    const req: any = {};
    const res = createRes();
    const next = jest.fn();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Database operation failed' });
    consoleSpy.mockRestore();
  });

  it('errorHandler hides internal error message in production', () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const req: any = {};
    const res = createRes();
    const next = jest.fn();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    errorHandler(new Error('boom'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });

    process.env.NODE_ENV = previous;
    consoleSpy.mockRestore();
  });

  it('logger emits one log line on response finish', () => {
    const req: any = { method: 'GET', originalUrl: '/api/test' };
    const res = createRes();
    res.statusCode = 204;
    const next = jest.fn();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    let finishHandler: (() => void) | undefined;
    res.on.mockImplementation((event: string, cb: () => void) => {
      if (event === 'finish') finishHandler = cb;
    });

    logger(req, res, next);
    expect(next).toHaveBeenCalled();

    finishHandler!();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/^GET \/api\/test 204 \d+ms$/));
    consoleSpy.mockRestore();
  });
});
