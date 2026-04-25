describe('config JWT secret enforcement', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('allows test env without explicit JWT secrets', async () => {
    process.env.NODE_ENV = 'test';

    const { config } = await import('../config');

    expect(config.jwt.secret).toContain('jwt_secret-test-fallback');
    expect(config.jwt.refreshSecret).toContain('jwt_refresh_secret-test-fallback');
  });

  it('throws in non-test env when JWT secrets are missing', async () => {
    process.env.NODE_ENV = 'production';

    await expect(import('../config')).rejects.toThrow('JWT_SECRET must be set to a strong secret');
  });

  it('throws in non-test env when JWT secrets are weak placeholders', async () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'change-me-in-production-use-a-secure-random-string';
    process.env.JWT_REFRESH_SECRET = 'change-me-refresh-secret-too';

    await expect(import('../config')).rejects.toThrow('JWT_SECRET must be set to a strong secret');
  });

  it('loads in non-test env when JWT secrets are strong', async () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'a'.repeat(64);
    process.env.JWT_REFRESH_SECRET = 'b'.repeat(64);

    const { config } = await import('../config');

    expect(config.jwt.secret).toBe('a'.repeat(64));
    expect(config.jwt.refreshSecret).toBe('b'.repeat(64));
  });
});
