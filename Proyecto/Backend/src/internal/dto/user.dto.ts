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
    role?: string;
    verification_token?: string;
    token_expiry_at?: Date;
    is_verified?: boolean;
}

export default interface UserDTO{
    id: number;
    username: string;
    email: string;
    role: string;
    created_at: Date;
    //is_verified: boolean;
}

export interface ServiceUserDTO{
    username: string;
    email: string;
    hash_password: string;
    role: string;
    verification_token: string;
    token_expiry_at: Date;
    is_verified: boolean;
}

export interface VerificationTokenDTO{
    id: number;
    username: string;
    email: string;
    hash_password: string;
    role: string;
    verification_token: string;
    token_expiry_at: Date;
    is_verified: boolean;
}


export interface PasswordUpdateDTO{
    current_password: string;
    new_password: string;
}


export interface GoogleUserDTO{
    google_id: string;
    email: string;
    username: string;
    role: string;
    is_verified: boolean;
    provider: string;
}