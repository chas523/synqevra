export const DUMMY_BCRYPT_HASH: string =
  '$2b$10$zVhqBrWc9KgiBZHtWsWfy.XnWjX9e4A7y2NDTgk7kvc4hnWHDv0EW';

export const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 10);
