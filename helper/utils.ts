import { IncomingMessage, ServerResponse } from 'http';
import { CONTENT_TYPE } from '../controllers/usersController';

export const parseRequest = (req: IncomingMessage, res: ServerResponse) =>
  new Promise((resolve, reject) => {
    let body = '';
    req
      .on('data', (chunk) => body += chunk.toString())
      .on('end', () => {
        try {
          resolve(JSON.parse(body))
        } catch (err) {
          res
            .writeHead(500, CONTENT_TYPE)
            .end(JSON.stringify('Internal server error.'));
        }
      })
      .on('error', (err) => {
        res
          .writeHead(500, CONTENT_TYPE)
          .end(JSON.stringify('Internal server error.'));
      });
});