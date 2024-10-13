import { IncomingMessage, ServerResponse} from 'http';
import { validate } from 'uuid';
import { CONTENT_TYPE, getAllUsers, createUser, getUserById, deleteUserById, updateUserById } from '../controllers/usersController';

export const BASE_USER_API_URL = '/api/users';

const router = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  try {
    const { method, url } = req;

    if (!(req.url && req.url.startsWith(BASE_USER_API_URL))) {
      res
        .writeHead(404, CONTENT_TYPE)
        .end(JSON.stringify('Invalid url request.'));
      return;
    }

    if (url === BASE_USER_API_URL) {
      if (method === 'GET') return await getAllUsers(req, res);
      if (method === 'POST') return await createUser(req, res);
    }

    const uuid = url.split('/').slice(3).join('/');

    if (!validate(uuid)) {
      res
        .writeHead(400, CONTENT_TYPE)
        .end(JSON.stringify('UserId is invalid (not uuid).'));
      return;
    }

    if (method === 'GET') return await getUserById(req, res, uuid);
    if (method === 'PUT') return await updateUserById(req, res, uuid);
    if (method === 'DELETE') return await deleteUserById(req, res, uuid);

  } catch (err) {
    res
      .writeHead(500, CONTENT_TYPE)
      .end(JSON.stringify('Internal server error.'));
  }
};

export default router;
