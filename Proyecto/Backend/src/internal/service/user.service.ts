import { UserRepositoryInterface } from "../repository/user.repository";
import UserDTO, { CreateUserDTO, ServiceUserDTO, UpdateUserDTO } from "../dto/user.dto";
import bcrypt from 'bcrypt';    

export interface UserServiceInterface {

  getUser(id: number): Promise<UserDTO>;
  getAllUsers(limit?: number, offset?: number): Promise<UserDTO[]>;
  createUser(userData: CreateUserDTO): Promise<UserDTO>;
  updateUser(id: number, userData: UpdateUserDTO): Promise<UserDTO>;
  deleteUser(id: number): Promise<boolean>;
  findByEmail(email: string): Promise<UserDTO>;
  login(email: string, password: string): Promise<UserDTO>;

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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            throw new Error('Invalid email format');
        }

        const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,64}$/;

        if (!passwordRegex.test(userData.password)) {
            throw new Error('Password must be 8-64 characters and include uppercase, lowercase, number, and symbols');
        }

        const allowedRoles = ["admin", "user"];

        if (!allowedRoles.includes(userData.role)) {
            throw new Error(`Invalid role. Allowed roles are: admin, user`);
        }

        const serviceDto: ServiceUserDTO = {
            username: userData.username,
            email: userData.email,
            hash_password: await bcrypt.hash(userData.password, 10),
            role: userData.role
        }
        

        try {
            return await this.userRepository.create(serviceDto);
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
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(userData.email)) {
                    throw new Error('Invalid email format');
                }
            }

            if (userData.role){
                const allowedRoles = ["admin", "user"];

                if (!allowedRoles.includes(userData.role)) {
                    throw new Error(`Invalid role. Allowed roles are: admin, user`);
                }
            }

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


}


