//User DTO interfaces

export interface CreateUserDTO{
    username: string;
    email: string;
    password: string;
    role: string;
}

export interface UpdateUserDTO{
    username?: string;
    email?: string;
    password?: string;
    role?: string;
}

export default interface UserDTO{
    id: number;
    username: string;
    email: string;
    role: string;
    created_at: Date;
}

export interface ServiceUserDTO{
    username: string;
    email: string;
    hash_password: string;
    role: string;
}