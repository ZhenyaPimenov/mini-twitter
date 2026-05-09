import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const HASH_PREFIX = "pbkdf2";
const ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString(
    "hex",
  );

  return `${HASH_PREFIX}$${ITERATIONS}$${salt}$${hash}`;
}

export function isHashedPassword(password: string) {
  return password.startsWith(`${HASH_PREFIX}$`);
}

export function verifyPassword(password: string, storedPassword: string) {
  const [prefix, iterationsText, salt, storedHash] = storedPassword.split("$");

  if (prefix !== HASH_PREFIX || !iterationsText || !salt || !storedHash) {
    return storedPassword === password;
  }

  const iterations = Number(iterationsText);

  if (!Number.isInteger(iterations) || iterations <= 0) {
    return false;
  }

  const hash = pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST);
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (storedBuffer.length !== hash.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, hash);
}
