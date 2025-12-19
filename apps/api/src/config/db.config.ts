import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { registerAs } from '@nestjs/config';
import * as path from 'path';

export default registerAs(
  'db',
  (): PostgresConnectionOptions => ({
    url: process.env.DB_URL,
    type: 'postgres',
    entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
    ssl: true,
    // only for development
    synchronize: true,
  }),
);
