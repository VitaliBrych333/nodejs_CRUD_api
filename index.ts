import path from 'path';
import http from 'http';
import dotenv from 'dotenv';
import { cwd } from 'process';
import router from './routers/router';

process
  .on('unhandledRejection', (err) => console.log(err))
  .on('uncaughtException', (err) => console.log(err));

dotenv.config({ path: path.resolve(cwd(), '.env') });

const PORT: number | string = process.env.PORT;

http
  .createServer()
  .on('request', router)
  .on('clientError', (err, socket) => socket.end('Internal server error.'))
  .on('error', (err) => console.log(`Error ${JSON.stringify(err)}.`))
  .listen(PORT, () => console.log(`Listening on HTTP port ${PORT}`));