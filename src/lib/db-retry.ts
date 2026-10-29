
function isTransientDatabaseError(error: unknown): boolean {
  let current: unknown = error;

  // Check nested driver errors too.
  for (let depth = 0; depth < 5 && current; depth++) {
    if (typeof current !== "object") break;

    const err = current as {
      code?: string;
      message?: string;
      cause?: unknown;
    };

    const code = err.code ?? "";
    const message = err.message ?? "";

    if (
      [
        "EAI_AGAIN",
        "ECONNRESET",
        "ECONNREFUSED",
        "ETIMEDOUT",
        "EPIPE",
      ].includes(code) ||
      /getaddrinfo EAI_AGAIN|temporary failure in name resolution/i.test(
        message
      )
    ) {
      return true;
    }

    current = err.cause;
  }

  return false;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function withDbRetry<T>(
  operation: () => Promise<T>,
  attempts = 4
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransientDatabaseError(error) || attempt >= attempts) {
        throw error;
      }

      const delay = 300 * 2 ** (attempt - 1);
      await sleep(delay);
    }
  }
}
