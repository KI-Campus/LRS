export interface UserInterface {
  role: string;
  consumersAccess: string[];
  lastName: string;
  firstName: string;
  email: string;
  createdAt: Date;
  lastLogin: Date;
  id: string;
  key?: string;
}
