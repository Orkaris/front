export interface Employee {
  id: number;
  employee_name: string;
  employee_salary: number;
  employee_age: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  gender: string;
  height: number;
  weight: number;
  birthdate: Date;
  profileType: number;
  profilePicture?: string;
}