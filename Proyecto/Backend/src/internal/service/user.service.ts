import { UserRepositoryInterface } from "../repository/user.repository";
import UserDTO, { CreateUserDTO, ServiceUserDTO, UpdateUserDTO, PasswordUpdateDTO, GoogleUserDTO } from "../dto/user.dto";
import bcrypt from 'bcrypt';  
import crypto from 'crypto';  
import { sendVerificationEmail } from "./email.service";

export interface UserServiceInterface {

  getUser(id: number): Promise<UserDTO>;
  getAllUsers(limit?: number, offset?: number): Promise<UserDTO[]>;
  createUser(userData: CreateUserDTO): Promise<UserDTO>;
  updateUser(id: number, userData: UpdateUserDTO): Promise<UserDTO>;
  deleteUser(id: number): Promise<boolean>;
  findByEmail(email: string): Promise<UserDTO>;
  login(email: string, password: string): Promise<UserDTO>;
  verifyUser(token: string): Promise<void>;
  updatePassword(id: number, passwordData: PasswordUpdateDTO): Promise<void>;
  createUserFromGoogle(googleUserData: GoogleUserDTO): Promise<UserDTO>;

}

// Validation functions
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password: string): boolean {
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,64}$/;
    return passwordRegex.test(password);
}

function isValidRole(role: string): boolean {
    const allowedRoles = ["admin", "user"]; 
    return allowedRoles.includes(role);
}


//Token generator
function generateVerificationToken(): { token: string; expiry: Date } {

    const token = crypto.randomBytes(32).toString('hex');
    const hour=3600000;
    const expiry = new Date(Date.now() + hour);

    return { token, expiry };

}


export class UserService implements UserServiceInterface {

    private userRepository: UserRepositoryInterface;

    constructor(userRepository: UserRepositoryInterface) {
        this.userRepository = userRepository;
    }

    async getUser(id: number): Promise<UserDTO>{
        try {
            const user = await this.userRepository.findById(id);
            if (!user) {
                throw new Error(`User with ID ${id} not found`);
            }
            return user;
        } catch (error) {
            console.error('Error getUser:', error);
            throw error;
        }

    }


    async getAllUsers(limit?: number, offset?: number): Promise<UserDTO[]> {

        try {
            return await this.userRepository.findAll(limit, offset);
        } catch (error) {
            console.error('Error getAllUsers:', error);
            throw error;
        }

    }

    async createUser(userData: CreateUserDTO): Promise<UserDTO> {

        if (!isValidEmail(userData.email)) {
        throw new Error('Invalid email format');
    }

        if (!isValidPassword(userData.password)) {
            throw new Error('Password must be 8-64 characters and include uppercase, lowercase, number, and symbols');
        }

        if (!isValidRole(userData.role)) {
            throw new Error(`Invalid role. Allowed roles are: admin, user`);
        }

        const verification = generateVerificationToken();

        const serviceDto: ServiceUserDTO = {
            username: userData.username,
            email: userData.email,
            hash_password: await bcrypt.hash(userData.password, 10),
            role: userData.role,
            verification_token: verification.token,
            token_expiry_at: verification.expiry,
            is_verified: false,
        }
        

        try {
            const user = await this.userRepository.create(serviceDto);
            await sendVerificationEmail(userData.email, verification.token);
            return user;

        } catch (error) {
            console.error('Error createUser:', error);
            throw error;
        }

    }

    
    async updateUser(id: number, userData: UpdateUserDTO): Promise<UserDTO> {

        try {

            const existingUser = await this.userRepository.findById(id);
            if (!existingUser) {
                throw new Error(`User with ID ${id} not found`);
            }

            if (userData.email) {
                if (!isValidEmail(userData.email)) {
                    throw new Error('Invalid email format');
                }
            }

            if (userData.role){
                if (!isValidRole(userData.role)) {
                    throw new Error(`Invalid role. Allowed roles are: admin, user`);
                }
            }

            //TO DO: Crear un método que se encargue del cambio de contraseña
            if(userData.password){
                userData.password = await bcrypt.hash(userData.password, 10);
            }


            const updateUser = await this.userRepository.update(id, userData);
            if (!updateUser) {
                throw new Error(`Error updating user with ID ${id}`);
            }

            return updateUser;
        
        }

        catch (error) {
            console.error('Error updateUser:', error);
            throw error;
        }

    }


    async updatePassword(id: number, passwordData: PasswordUpdateDTO): Promise<void> {


        try {

            if (!isValidPassword(passwordData.new_password)) {
            throw new Error('Password must be 8-64 characters and include uppercase, lowercase, number, and symbols');
            }

            const existingUser = await this.userRepository.fullFindById(id);
            if (!existingUser) {
                throw new Error(`User with ID ${id} not found`);
            }

            //Verficar contraseña actual
            const passwordMatch = await bcrypt.compare(passwordData.current_password, existingUser.hash_password);
            if (!passwordMatch) {
                throw new Error('Current password is incorrect');
            }

            const hashedNewPassword = await bcrypt.hash(passwordData.new_password, 10);
            await this.userRepository.updatePassword(id, hashedNewPassword);

        }

        catch (error) {
            console.error('Error updatePassword:', error);
            throw error;
        }
    }


    async deleteUser(id: number): Promise<boolean> {

        try {
            const exists = await this.userRepository.existsById(id);
            if (!exists) {
                throw new Error(`User with ID ${id} not found`);
            }

            return await this.userRepository.delete(id);
        }
        catch (error) {
            console.error('Error deleteUser:', error);
            throw error;
        }
    }

    async findByEmail(email: string): Promise<UserDTO> {

        try {
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                throw new Error(`User with email "${email}" not found`);
            }
            return user;
        } catch (error) {
            console.error('Error findByEmail:', error);
            throw error;
        }

    }

    async login(email: string, password: string): Promise<UserDTO> {

        try {
            const user = await this.userRepository.findByEmailForLogin(email);
            if (!user) {
                throw new Error(`User with email "${email}" not found`);
            }

            if(!user.is_verified){
                throw new Error('User email is not verified');
            }

            const passwordMatch = await bcrypt.compare(password, user.hash_password);

            if (!passwordMatch) {
                throw new Error('Invalid password');
            }

        
            return await this.userRepository.findByEmail(email) as UserDTO;
        }

        catch (error) {
            console.error('Error login:', error);
            throw error;
        }

    }


    async verifyUser(token: string): Promise<void> {


        try {
            const user = await this.userRepository.findByVerificationToken(token);

            if(!user){
                throw new Error('Invalid verification user token');
            }

            if(user.token_expiry_at < new Date()){
                throw new Error('Verification token has expired');
            }

            this.updateUser(user.id, {
                is_verified: true
            });
        }

        catch (error) {
            console.error('Error verifyToken:', error);
            throw error;
        }
        
    }


    async createUserFromGoogle(googleUserData: GoogleUserDTO): Promise<UserDTO> {

        if (!isValidRole(googleUserData.role)) {
            throw new Error(`Invalid role. Allowed roles are: admin, user`);
        }

        try {
            const user = await this.userRepository.createUserFromGoogle(googleUserData);
            return user;
        } catch (error) {
            console.error('Error createUserFromGoogle:', error);
            throw error;
        }

    }



}


