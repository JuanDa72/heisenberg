//Primer test: Contraseña invalida en el login
import { UserService } from "./user.service";
import { UserRepositoryInterface } from "../repository/user.repository";
import bcrypt from 'bcrypt';
import userDTO from '../dto/user.dto';
import { ServiceUserDTO } from "../dto/user.dto";
import crypto from 'crypto';
import { sendVerificationEmail } from "./email.service";
import { create } from "domain";

//Remplazamos las dependencias por mocks
jest.mock('../repository/user.repository');
jest.mock('bcrypt');
jest.mock('crypto');
jest.mock('./email.service');

//Para no tener problemas con los tipos :)
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedCrypto = crypto as jest.Mocked<typeof crypto>;
const mockedSendVerificationEmail = sendVerificationEmail as jest.MockedFunction<typeof sendVerificationEmail>;
const MockedUserRepository = {
  findByEmailForLogin: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
} as any;

//Test de Login
describe('UserService - Login', () => {

    let userService: UserService;

    beforeEach(() => {
        jest.clearAllMocks();
        userService = new UserService(MockedUserRepository as UserRepositoryInterface);
    });

    test('should throw an error for invalid password', async () => {
        //Usuario existe y esta verificado pero la contraseña es incorrecta

        const email='jest@gmail.com';
        const password="Wrongpassword_1"

        //Mockeamos respuesta del repositorio
        const mockuser = {
            username: "UserJest",
            email: email,
            hash_password: "hashedpassword",
            role: "user",
            verification_token: "some_token",
            token_expiry_at: new Date(Date.now()),
            is_verified: true
        }

        MockedUserRepository.findByEmailForLogin.mockResolvedValue(mockuser);

        //Simulamos que la contraseña no coincide
        mockedBcrypt.compare.mockResolvedValue(false as never);

        await expect(userService.login(email, password)).rejects.toThrow('Invalid password');

        //Verificamos que se hayan llamado los mocks
        expect(MockedUserRepository.findByEmailForLogin).toHaveBeenCalledWith(email);
        expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, mockuser.hash_password);
    })

    test('should login successfully with correct credentials', async () => {

        //Usuario existe y esta verificado con contraseña correcta
        const email='jest@gmail.com';
        const password="Correctpassword_1"

        //Mockeamos respuesta del repositorio
        const mockuser = {
            id: 1,
            username: "UserJest",
            email: email,
            hash_password: "hashedpassword",
            role: "user",
            verification_token: "some_token",
            token_expiry_at: new Date(Date.now()),
            is_verified: true
        }

        MockedUserRepository.findByEmailForLogin.mockResolvedValue(mockuser);

        //Simulamos que la contraseña coincide
        mockedBcrypt.compare.mockResolvedValue(true as never);
        
        //Mockeamos findByEmail para retornar el userDTO sin el hash_password
        const userDTOResult: userDTO = {
            id: 1,
            username: "UserJest",
            email: email,
            role: "user",
            created_at: new Date(Date.now()),
        };

        MockedUserRepository.findByEmail.mockResolvedValue(userDTOResult);

        const result = await userService.login(email, password);
        
        expect(result).toEqual(userDTOResult);

        //Verificamos que se hayan llamado los mocks
        expect(MockedUserRepository.findByEmailForLogin).toHaveBeenCalledWith(email);
        expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, mockuser.hash_password);
        expect(MockedUserRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    test('should throw an error if user email is not verified', async () => {

        const email="jest@gmail.com";
        const password="Somepassword_1";

        //Mockeamos respuesta del repositorio
        const mockuser = {
            username: "UserJest",
            email: email,
            hash_password: "hashedpassword",
            role: "user",
            verification_token: "some_token",
            token_expiry_at: new Date(Date.now()),
            is_verified: false
        }

        MockedUserRepository.findByEmailForLogin.mockResolvedValue(mockuser);

        await expect(userService.login(email, password)).rejects.toThrow('User email is not verified');

        //Verificamos que se hayan llamado los mocks
        expect(MockedUserRepository.findByEmailForLogin).toHaveBeenCalledWith(email);


    })

});

//Test de createUser
describe('UserService - createUser', () => {

    let userService: UserService;

    beforeEach(() => {
        jest.clearAllMocks();
        userService = new UserService(MockedUserRepository as UserRepositoryInterface);
    });

    test('Should throw error if email format is invalid', async () => {

        const invalidEmail = "invalidemailformat";
        const username = "TestUser";
        const password = "Validpassword_1";
        const role = "user";

        const mockCreateUserDTO = {
            username: username,
            email: invalidEmail,
            password: password,
            role: role
        };

        await expect(userService.createUser(mockCreateUserDTO)).rejects.toThrow('Invalid email format');
    });

    test('Should throw error if password format is invalid', async () => {

        const email = "test@example.com";
        const username = "TestUser";
        const invalidPassword = "short";
        const role = "user";

        const mockCreateUserDTO = {
            username: username,
            email: email,
            password: invalidPassword,
            role: role
        };

        await expect(userService.createUser(mockCreateUserDTO)).rejects.toThrow('Password must be 8-64 characters and include uppercase, lowercase, number, and symbols');
    });

    test('Should throw error if role is invalid', async () => {

        const email = "test@example.com";
        const username = "TestUser";
        const password = "Validpassword_1";
        const invalidRole = "invalidRole";

        const mockCreateUserDTO = {
            username: username,
            email: email,
            password: password,
            role: invalidRole
        };

        await expect(userService.createUser(mockCreateUserDTO)).rejects.toThrow('Invalid role. Allowed roles are: admin, user');
    });

    test('Should create user successfully with valid data', async () => {

        const email = "test@example.com";
        const username = "TestUser";
        const password = "Validpassword_1";
        const role = "user";

        const mockCreateUserDTO = {
            username: username,
            email: email,
            password: password,
            role: role
        };

        //Mockeamos bcrypt.hash
        const hashedPassword = "hashedValidpassword_1";
        mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
        const mockVerificationToken = "verification_token_123";
        mockedBcrypt.randomBytes.mockReturnValue);


});


