import { IncomingMessage, ServerResponse } from 'http';
import { addUser, getUser, updateUser, deleteUser, getUsersDB } from '../services/userServices';
import { User, checkIsUser } from '../models/userModel';
import { parseRequest } from '../helper/utils';

const CONTENT_TYPE = { 'Content-Type': 'application/json' };

async function getAllUsers(req: IncomingMessage, res: ServerResponse) {
  try {
    const users = await getUsersDB();

    res
      .writeHead(200, CONTENT_TYPE)
      .end(JSON.stringify(users));

  } catch (err) {
    res
      .writeHead(500, CONTENT_TYPE)
      .end(JSON.stringify('Internal server error.'));
  }
}

async function createUser(req: IncomingMessage, res: ServerResponse) {
  try {
    const userInfo = await parseRequest(req, res);

    if (!checkIsUser(userInfo)) {
      res
        .writeHead(400, CONTENT_TYPE)
        .end(JSON.stringify('Request body does not contain required fields.'));
    } else {
      const newUser = await addUser(userInfo as User);
      res
        .writeHead(201, CONTENT_TYPE)
        .end(JSON.stringify(newUser));
      }

  } catch (err) {
    res
      .writeHead(500, CONTENT_TYPE)
      .end(JSON.stringify('Internal server error.'));
  }
}

async function getUserById(
  req: IncomingMessage,
  res: ServerResponse,
  id: string
) {
  try {
    const user = await getUser(id);

    if (!user) {
      res
        .writeHead(404, CONTENT_TYPE)
        .end(JSON.stringify(`Record with id === ${id} doesn't exist.`));
    } else {
      res
        .writeHead(200, CONTENT_TYPE)
        .end(JSON.stringify(user));
    }
   
  } catch (err) {
    res
      .writeHead(500, CONTENT_TYPE)
      .end(JSON.stringify('Internal server error.'));
  }
}

async function updateUserById(
  req: IncomingMessage,
  res: ServerResponse,
  id: string
) {
  try {
    const newInfoUser = await parseRequest(req, res);

    if (!checkIsUser(newInfoUser)) {
      res
        .writeHead(400, CONTENT_TYPE)
        .end(JSON.stringify('Request body does not contain required fields.'));
    } else {
      const updatedUser = await updateUser(id, newInfoUser as User);

      if (!updatedUser) {
        res
          .writeHead(404, CONTENT_TYPE)
          .end(JSON.stringify(`Record with id === ${id} doesn't exist.`));
      } else {
        res
          .writeHead(200, CONTENT_TYPE)
          .end(JSON.stringify(updatedUser));
      }
    }

  } catch (err) {
    res
      .writeHead(500, CONTENT_TYPE)
      .end(JSON.stringify('Internal server error.'));
  }
}

async function deleteUserById(
  req: IncomingMessage,
  res: ServerResponse,
  id: string
) {
  try {
    const indexUser = await deleteUser(id);

    if (indexUser === -1) {
      res
        .writeHead(404, CONTENT_TYPE)
        .end(JSON.stringify(`Record with id === ${id} doesn't exist.`));
    } else {
      res
        .writeHead(204, CONTENT_TYPE)
        .end();
    }

  } catch (err) {
    res
      .writeHead(500, CONTENT_TYPE)
      .end(JSON.stringify('Internal server error.'));
  }
}

export { CONTENT_TYPE, getAllUsers, createUser, getUserById, updateUserById, deleteUserById };
