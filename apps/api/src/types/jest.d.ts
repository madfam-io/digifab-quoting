declare namespace jest {
  interface MockInstance<T = unknown, Y extends unknown[] = unknown[]> {
    mockClear(): this;
    mockReset(): this;
    mockRestore(): void;
    mockImplementation(fn?: (...args: Y) => T): this;
    mockImplementationOnce(fn: (...args: Y) => T): this;
    mockReturnThis(): this;
    mockReturnValue(value: T): this;
    mockReturnValueOnce(value: T): this;
    mockResolvedValue(value: T extends Promise<infer U> ? U : never): this;
    mockResolvedValueOnce(value: T extends Promise<infer U> ? U : never): this;
    mockRejectedValue(value: unknown): this;
    mockRejectedValueOnce(value: unknown): this;
    mockName(name: string): this;
    getMockName(): string;
  }

  interface Mock<T = unknown, Y extends unknown[] = unknown[]> extends MockInstance<T, Y> {
    new (...args: Y): T;
    (...args: Y): T;
  }

  function fn<T = unknown, Y extends unknown[] = unknown[]>(implementation?: (...args: Y) => T): Mock<T, Y>;
  function setTimeout(timeout: number): void;

  const mock: {
    <T>(path: string): T;
    <T>(path: string, factory: () => T): T;
  };
}

declare const jest: typeof jest;