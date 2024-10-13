export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

export function checkIsUser(dataUser: unknown): boolean {
  return (
    (dataUser as User).username && typeof (dataUser as User).username === 'string' &&
    ((dataUser as User).age || (dataUser as User).age === 0) && typeof (dataUser as User).age === 'number' &&
    (dataUser as User).hobbies && Array.isArray((dataUser as User).hobbies)
  );
}