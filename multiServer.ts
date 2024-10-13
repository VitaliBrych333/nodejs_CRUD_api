import cluster from 'cluster';
import { cpus } from 'os';
import path from 'path';
import http from 'http';
import dotenv from 'dotenv';
import { cwd } from 'process';
import { usersDB, updateUsersDB } from './services/userServices';

dotenv.config({ path: path.resolve(cwd(), '.env') });

const ENV_PORT: number | string = process.env.PORT;
const PORT = +ENV_PORT;
let redirectedPort = PORT + 1;

process
  .on('unhandledRejection', (err) => console.log(err))
  .on('uncaughtException', (err) => console.log(err));

const runMultiServer = async () => {
  if (cluster.isPrimary) {
    console.log(`Primary server(cluster) ${process.pid} is running on ${PORT}`);

    const countCpus = cpus().length;
    for (let i = 0; i < countCpus; i++) {
      cluster.fork({ PORT: PORT + i + 1 });
    }

    http
      .createServer()
      .on('request', (req, res) => {
        res
          .writeHead(307, { Location: `http://localhost:${redirectedPort}${req.url}` })
          .end(() => {
            console.log(`Request redirected to port ${redirectedPort}`);

            redirectedPort = redirectedPort + 1;

            if (redirectedPort > PORT + countCpus) {
              redirectedPort = redirectedPort - countCpus;
            }
          });
      })
      .listen(PORT, () => console.log(`Load balancer server is running on ${PORT}`));

    cluster
      .on('exit', (worker, code, signal) => console.log(`Worker ${worker.process.pid} exit`))
      .on('message', (worker, message: { action: string, parsedUserDB: string }) =>
        message.action === 'updateUsers'
          ? worker.send(JSON.stringify(usersDB))
          : updateUsersDB(message.parsedUserDB)
      );

  } else {
    await import('./index').then(() => console.log(`Worker ${process.pid} started`));
  }
};

runMultiServer();