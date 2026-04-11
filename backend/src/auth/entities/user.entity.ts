export interface User {
  id: string;
  email: string;
  password: string;
  securityQuestion1: string;
  securityAnswer1: string;
  securityQuestion2: string;
  securityAnswer2: string;
  securityQuestion3: string;
  securityAnswer3: string;
  createdAt: Date;
}
