import { createServer } from 'http';
import request from 'supertest';
import router from '../routers/router';

const serverTest = createServer().on('request', router);
const serverRequest = request(serverTest);

const testUser_first = {
  username: 'testUserName1',
  age: 30,
  hobbies: ['testHobbie_1', 'testHobbie_2']
};

const testUser_second = {
  username: 'testUserName2',
  age: 10,
  hobbies: ['testHobbie_3']
};

describe('Requests tests.', () => {
  afterAll((done) => {
    serverTest.close();
    done();
  });

  it('should return empty array for first request GET "/api/users"', (done) => {
    serverRequest.get('/api/users').expect(200, [], done);
  });

  it('should create new user for request POST and return an array containing this value for GET', async () => {
    const testUser_1 = (await serverRequest.post('/api/users').send(testUser_first).expect(201)).body;
    const users = (await serverRequest.get('/api/users')).body;
    expect(testUser_1).toMatchObject(testUser_first);
    expect(users).toHaveLength(1);
  });

  it('should create a second new user for request GET then delete first user by ID for request DELETE', async () => {
    const testUser_2 = (await serverRequest.post('/api/users').send(testUser_second).expect(201)).body;
    expect(testUser_2).toMatchObject(testUser_second);
    expect((await serverRequest.get('/api/users')).body).toHaveLength(2);

    const usersFirstGET = (await serverRequest.get('/api/users')).body;
    expect(usersFirstGET).toHaveLength(2);

    await serverRequest.delete(`/api/users/${usersFirstGET[0].id}`).expect(204);
    const usersSecondGET = (await serverRequest.get('/api/users')).body;

    expect(usersSecondGET).toHaveLength(1);
    expect(usersSecondGET[0]).toMatchObject(testUser_second);
  });

  it('should update a second new user and return user with updated info for request PUT', async () => {
    const newInfoUser = {
      username: 'updatedTestUserName2',
      age: 15,
      hobbies: ['updatedTestHobbie_3']
    };
    const usersFirstGET = (await serverRequest.get('/api/users')).body;

    expect(usersFirstGET).toHaveLength(1);
    expect(usersFirstGET[0]).toMatchObject(testUser_second);

    const updatedTestUser = (await serverRequest.put(`/api/users/${usersFirstGET[0].id}`).send(newInfoUser).expect(200)).body;
    expect(updatedTestUser.id).toEqual(usersFirstGET[0].id);

    const usersSecondGET = (await serverRequest.get('/api/users')).body;
    expect(usersSecondGET).toHaveLength(1);
    expect(usersSecondGET[0]).toMatchObject(newInfoUser);
  });
});
