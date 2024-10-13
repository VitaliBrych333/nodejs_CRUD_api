import cluster from 'cluster';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/userModel';

let usersDB: User[] = [];

async function getUsersDB(): Promise<User[]> {
  if (cluster.isWorker) {
    await getUsersDBfromClusterPrimary();
  }

  return new Promise(async (resolve, reject) => resolve(usersDB));
}

async function getUser(id: string): Promise<User | null> {
  if (cluster.isWorker) {
    await getUsersDBfromClusterPrimary();
  }

  return new Promise((resolve, reject) => {
    const user = usersDB.find(user => user.id === id);
    user
      ? resolve(user)
      : resolve(null);
  });
}

async function addUser(user: User): Promise<User> {
  if (cluster.isWorker) {
    await getUsersDBfromClusterPrimary();
  }

  return new Promise(async (resolve, reject) => {
    const newUser = { id: uuidv4(), ...user };
    usersDB.push(newUser);

    if (cluster.isWorker) {
      await sendUsersDBtoClusterPrimary(usersDB);
    }

    resolve(newUser);
  });
};
  
async function updateUser(id: string, newInfoUser: User): Promise<User | null> {
  if (cluster.isWorker) {
    await getUsersDBfromClusterPrimary();
  }

  return new Promise(async (resolve, reject) => {
    const indexUser = usersDB.findIndex((user) => user.id === id);

    if (indexUser !== -1) {
      usersDB[indexUser] = { id, ...newInfoUser };

      if (cluster.isWorker) {
        await sendUsersDBtoClusterPrimary(usersDB);
      }

      resolve(usersDB[indexUser]);
    } else {
      resolve(null);
    }
  });
};
  
async function deleteUser(id: string): Promise<number> {
  if (cluster.isWorker) {
    await getUsersDBfromClusterPrimary();
  }

  return new Promise(async (resolve, reject) => {
    const indexUser = usersDB.findIndex((user) => user.id === id);
  
    if (indexUser !== -1) {
      usersDB.splice(indexUser, 1);

      if (cluster.isWorker) {
        await sendUsersDBtoClusterPrimary(usersDB);
      }
    } 

    resolve(indexUser);
  });
};

function updateUsersDB(latestStateDB: string): void {
  usersDB = [...JSON.parse(latestStateDB)];
}

async function getUsersDBfromClusterPrimary(): Promise<User[]> {
  return new Promise((resolve, reject) => {
    const result = process.send(
      { action: 'updateUsers', parsedUserDB: JSON.stringify(usersDB) },
      () => process.once('message', (message: string) => resolve((usersDB = [...JSON.parse(message)])))
    );

    if (!result) {
      throw new Error();
    }
  });
}

async function sendUsersDBtoClusterPrimary(actualUsersDB: User[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const result = process.send({ action: 'sendUsersDB', parsedUserDB: JSON.stringify(actualUsersDB) });

    if (!result) {
      throw new Error();
    } else {
      resolve();
    }
  });
}

export { usersDB, updateUsersDB, getUsersDB, getUser, addUser, updateUser, deleteUser };