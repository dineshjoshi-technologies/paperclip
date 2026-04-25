describe('config/database', () => {
  const prismaClientCtor = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    prismaClientCtor.mockReset();
  });

  it('connectDB logs success on connect', async () => {
    const mockClient = { $connect: jest.fn().mockResolvedValue(undefined), $disconnect: jest.fn() };
    prismaClientCtor.mockImplementation(() => mockClient);

    jest.doMock('@prisma/client', () => ({ PrismaClient: prismaClientCtor }));

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const { connectDB } = await import('../config/database');

    await connectDB();

    expect(mockClient.$connect).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Database connected successfully');
    consoleSpy.mockRestore();
  });

  it('connectDB exits process on connection failure', async () => {
    const mockClient = { $connect: jest.fn().mockRejectedValue(new Error('no-db')), $disconnect: jest.fn() };
    prismaClientCtor.mockImplementation(() => mockClient);

    jest.doMock('@prisma/client', () => ({ PrismaClient: prismaClientCtor }));

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const { connectDB } = await import('../config/database');
    await connectDB();

    expect(errorSpy).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);

    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('disconnectDB calls prisma disconnect', async () => {
    const mockClient = { $connect: jest.fn(), $disconnect: jest.fn().mockResolvedValue(undefined) };
    prismaClientCtor.mockImplementation(() => mockClient);

    jest.doMock('@prisma/client', () => ({ PrismaClient: prismaClientCtor }));

    const { disconnectDB } = await import('../config/database');
    await disconnectDB();

    expect(mockClient.$disconnect).toHaveBeenCalled();
  });
});

describe('config/redis', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('set/get/delete helpers call redis client methods', async () => {
    const redisMock = {
      set: jest.fn().mockResolvedValue('OK'),
      setex: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue('value-1'),
      del: jest.fn().mockResolvedValue(1),
      keys: jest.fn().mockResolvedValue([]),
      on: jest.fn(),
      ping: jest.fn().mockResolvedValue('PONG'),
      quit: jest.fn().mockResolvedValue('OK'),
    };

    const RedisCtor = jest.fn().mockImplementation((_url: string, opts: { retryStrategy: (times: number) => number | null }) => {
      expect(opts.retryStrategy(1)).toBe(50);
      expect(opts.retryStrategy(4)).toBeNull();
      return redisMock;
    });

    jest.doMock('ioredis', () => ({ __esModule: true, default: RedisCtor }));

    const { setCache, getCache, deleteCache } = await import('../config/redis');

    await setCache('k1', 'v1');
    await setCache('k2', 'v2', 30);
    const value = await getCache('k1');
    await deleteCache('k2');

    expect(redisMock.set).toHaveBeenCalledWith('k1', 'v1');
    expect(redisMock.setex).toHaveBeenCalledWith('k2', 30, 'v2');
    expect(redisMock.get).toHaveBeenCalledWith('k1');
    expect(redisMock.del).toHaveBeenCalledWith('k2');
    expect(value).toBe('value-1');
  });

  it('invalidatePattern deletes matched keys and skips empty sets', async () => {
    const redisMock = {
      set: jest.fn(),
      setex: jest.fn(),
      get: jest.fn(),
      del: jest.fn().mockResolvedValue(2),
      keys: jest.fn().mockResolvedValueOnce(['a', 'b']).mockResolvedValueOnce([]),
      on: jest.fn(),
      ping: jest.fn(),
      quit: jest.fn(),
    };

    const RedisCtor = jest.fn().mockImplementation(() => redisMock);
    jest.doMock('ioredis', () => ({ __esModule: true, default: RedisCtor }));

    const { invalidatePattern } = await import('../config/redis');

    await invalidatePattern('dist:*');
    await invalidatePattern('empty:*');

    expect(redisMock.keys).toHaveBeenNthCalledWith(1, 'dist:*');
    expect(redisMock.del).toHaveBeenCalledWith('a', 'b');
    expect(redisMock.keys).toHaveBeenNthCalledWith(2, 'empty:*');
    expect(redisMock.del).toHaveBeenCalledTimes(1);
  });
});
