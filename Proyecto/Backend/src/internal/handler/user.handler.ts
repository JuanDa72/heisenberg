import {Router, Request, Response, NextFunction} from 'express';
import { UserServiceInterface  } from '../service/user.service';
import UserDTO, { CreateUserDTO, UpdateUserDTO, PasswordUpdateDTO } from '../dto/user.dto';
import ResponseDTO from '../dto/response.dto';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const USER_UPDATE_FIELDS = ['username', 'email', 'role', 'is_verified'];
const USER_PASSWORD_UPDATE_FIELDS = ['current_password', 'new_password'];

export interface userHandlerInterface {
    setUpRoutes(): void;
    getRouter(): Router;
}

function invalidFields(providedFields: string[], allowedFields: string[]): string[] {
    return providedFields.filter(
        key => !allowedFields.includes(key)
    );
}

export class UserHandler implements userHandlerInterface {


    private userService: UserServiceInterface;
    private router: Router;

    constructor(userService: UserServiceInterface) {
        this.userService = userService;
        this.router = Router();
    }

    public setUpRoutes(): void {
        this.router.get('/auth/google', passport.authenticate('google', { 
            scope: ['profile', 'email'], 
            session: false}));
        this.router.get('/auth/google/callback', this.googleAuthCallback.bind(this));
        this.router.get('/email/', this.getUserByEmail.bind(this));
        this.router.get('/verify-email/', this.verifyUser.bind(this));
        this.router.get('/', this.getAllUsers.bind(this));
        this.router.get('/:id', this.getUserById.bind(this));
        this.router.post('/', this.createUser.bind(this));
        this.router.put('/:id', this.updateUser.bind(this));
        this.router.put('/:id/password', this.updatePassword.bind(this));
        this.router.delete('/:id', this.deleteUser.bind(this));
        this.router.post('/login', this.login.bind(this));
        this.router.post('/resend-verification-email/', this.resendVerificationEmail.bind(this));
    }

    private async getAllUsers(req: Request, res: Response): Promise<void> {
        let response: ResponseDTO<UserDTO[]>;
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
            const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
            
            // Validate pagination
            if (limit !== undefined && (isNaN(limit) || limit <= 0 || limit > 100)) {
                response = {
                    status: 400,
                    message: 'Limit parameter must be a number between 1 and 100',
                };
                res.status(400).json(response);
                return;
            }

            if (offset !== undefined && (isNaN(offset) || offset < 0)) {
                response = {
                    status: 400,
                    message: 'Offset parameter must be a number greater than or equal to 0',
                };
                res.status(400).json(response);
                return;
            }

            const users = await this.userService.getAllUsers(limit, offset);

            response = {
                status: 200,
                message: 'Users retrieved successfully',
                data: users
            };
            res.status(200).json(response);
        }

        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            response = {
                status: 500,
                message: `Error getAllUsers: ${errorMessage}`,
            };
            res.status(500).json(response);
        }

    }

    private async getUserById(req: Request, res: Response): Promise<void> {

        let response: ResponseDTO<UserDTO>;

        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                response = {
                    status: 400,
                    message: 'ID parameter must be a positive integer',
                };
                res.status(400).json(response);
                return;
            }

            const user = await this.userService.getUser(id);

            response = {
                status: 200,
                message: `User with ID ${id} retrieved successfully`,
                data: user
            };
            res.status(200).json(response);
        }

        catch (error) {

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            if(errorMessage.includes('not found')){
                response = {
                    status: 404,
                    message: errorMessage,
                };
                res.status(404).json(response);
                return;
            }

            response = {
                status: 500,
                message: `Error getUserById: ${errorMessage}`,
            };

            res.status(404).json(response);

        }
        
    }


    private async createUser(req: Request, res: Response): Promise<void> {

    let response: ResponseDTO<UserDTO>;

    try {
        const userData: CreateUserDTO = req.body;
        const newUser = await this.userService.createUser(userData);

        response = {
            status: 201,
            message: 'User created successfully',
            data: newUser
        };
        res.status(201).json(response);
    }

    catch (error) {

        const message = error instanceof Error ? error.message : 'Unknown error';

        const badRequestErrors = [
            'Invalid email format',
            'Password must be',
            'Invalid role',
            'already exists',          // email único
            'validation error',        // errores de Sequelize
        ];

        const isBadRequest =
            badRequestErrors.some(e => message.includes(e));

        if (isBadRequest) {
            const response: ResponseDTO<never> = {
                status: 400,
                message
            };
            res.status(400).json(response);
            return;
        }

        const response: ResponseDTO<never> = {
            status: 500,
            message: `Error creating user: ${message}`,
        };
        res.status(500).json(response);
    }
}





    private async updateUser(req: Request, res: Response): Promise <void> {

        let response: ResponseDTO<UserDTO>;
        try {
            const id = parseInt(req.params.id!);

            if (isNaN(id) || id <= 0){

                response = {
                    status: 400,
                    message: 'Invalid ID. Must be a positive integer ',
                };
                res.status(400).json(response);
                return;

                    }

            //Validate at least one field to update
            if (Object.keys(req.body).length===0){

                response = {
                status: 400,
                message: "Must provide at least one field to update",
                };

                res.status(400).json(response);
                return;
                
            }


            //Validate only allowed fields
            const invalidF = invalidFields(
                Object.keys(req.body),
                USER_UPDATE_FIELDS
            );

            if (invalidF.length > 0){

                response = {
                    status: 400,
                    message: `Invalid fields for update: ${invalidF.join(', ')}`,
                };

                res.status(400).json(response);
                return;
            }


            const userData: UpdateUserDTO = req.body;
            const updatedUser = await this.userService.updateUser(id, userData);

            response = {
                status: 200,
                message: 'User update successfully',
                data: updatedUser,
            };

            res.status(200).json(response);


        } catch (error) {

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            //If error is "not found", return 404
            if (errorMessage.includes('not found')) {
                response = {
                    status: 404,
                    message: errorMessage,
                };
                res.status(404).json(response);
                return;
            }

            //Business validation errors
            if (errorMessage.includes('already exists') ||
                errorMessage.includes('validation error') || 
                errorMessage.includes('cannot be before')) {
                response = {
                    status: 400,
                    message: errorMessage,
                };
                res.status(400).json(response);
                return;
            }

            response = {
                status: 500,
                message: `Error updating user: ${errorMessage}`,
            };
            res.status(500).json(response);
        }

    }


    private async updatePassword(req: Request, res: Response): Promise<void> {

        let response: ResponseDTO<never>;
        
        try {
            const id = parseInt(req.params.id!);
            const passwordData: PasswordUpdateDTO = req.body;

            if (isNaN(id) || id <= 0) {
                response = {
                    status: 400,
                    message: 'Invalid ID. Must be a positive integer',
                };
                res.status(400).json(response);
                return;
            }

            if (!passwordData.current_password || !passwordData.new_password) {
                response = {
                    status: 400,
                    message: 'Both current_password and new_password are required',
                };
                res.status(400).json(response);
                return;
            }

            //Validate only allowed fields
            const invalidF = invalidFields(
                Object.keys(req.body),
                USER_PASSWORD_UPDATE_FIELDS
            );

            if (invalidF.length > 0){

                response = {
                    status: 400,
                    message: `Invalid fields for update: ${invalidF.join(', ')}`,
                };

                res.status(400).json(response);
                return;
            }


            await this.userService.updatePassword(id, passwordData);
            
            response = {
                status: 200,
                message: 'Password updated successfully',
            };
            res.status(200).json(response);
        }

        catch( error) {

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            //Business validation errors
            if (errorMessage.includes('not found') ||
                errorMessage.includes('incorrect') ||
                errorMessage.includes('Password must be')) {
                response = {
                    status: 400,
                    message: errorMessage,
                };
                res.status(400).json(response);
                return;
            }

            response = {
                status: 500,
                message: `Error updatePassword: ${errorMessage}`,
            };
            res.status(500).json(response);
        }
    }



    private async deleteUser(req: Request, res: Response): Promise <void> {

        let response: ResponseDTO<never>;
        try {
            const id = parseInt(req.params.id!);

            if (isNaN(id) || id <= 0){
                response = {
                    status: 400,
                    message: 'Invalid ID. Must be a positive integer',
                };
                res.status(400).json(response);
                return;
            }

            const deleted = await this.userService.deleteUser(id);

            //Service delete devuelve true si se borro, false si no existia
            if(deleted){
                response = {
                    status: 200,
                    message: 'User deleted successfully',
                };
                res.status(200).json(response);
            } else {
                response = {
                    status: 404,
                    message: `User with ID ${id} not found`,
                };
                res.status(404).json(response);
            }
        }

        catch (error) {

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            response = {
                status: 500, 
                message: `Error deleteUser: ${errorMessage}`,
            };
            res.status(500).json(response);
        }


    }


    private async getUserByEmail(req: Request, res: Response): Promise<void> {

        let response: ResponseDTO<UserDTO>;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        try {
            const email = req.query.email as string;
            
            if (!email || email.trim() === '') {
                response = {
                    status: 400,
                    message: 'Email parameter must be a non-empty string',
                };
                res.status(400).json(response);
                return;
            }

            if (!emailRegex.test(email)) {

                response = {
                    status: 400,
                    message: 'Invalid email format',
                };
                res.status(400).json(response);
                return;
            }
                
            const user = await this.userService.findByEmail(email);

            response = {
                status: 200, 
                message: `User with email "${email}" retrieved successfully`,
                data: user
            };
            res.status(200).json(response);
        }

        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            if (errorMessage.includes('not found')) {
                response = {
                    status: 404,
                    message: errorMessage,
                };
                res.status(404).json(response);
                return;
            }

            response = {
                status: 500,
                message: `Error getUserByEmail: ${errorMessage}`,
            };
            res.status(500).json(response);
        }
    }

    private async login(req: Request, res: Response): Promise<void>{

        let response: ResponseDTO<UserDTO>;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        try {
            const { email, password } = req.body;

            if (!email || email.trim() === '' || !password || password.trim() === '') {
                response = {
                    status: 400,
                    message: 'Email and password are required',
                };
                res.status(400).json(response);
                return;
            }

            if (!emailRegex.test(email)) {
                response = {
                    status: 400,
                    message: 'Invalid email format',
                };
                res.status(400).json(response);
                return;
            }

            const user = await this.userService.login(email, password);

            response = {
                status: 200,
                message: 'Login successful',
                data: user
            };
            res.status(200).json(response);
        }

        catch (error) {

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            if (errorMessage.includes('not found') ||
                errorMessage.includes('not verified') ||
                errorMessage.includes('Invalid password')) {
                response = {
                    status: 400,
                    message: errorMessage,
                };
                res.status(400).json(response);
                return;
            }

            response = {
                status: 500,
                message: `Error login: ${errorMessage}`,
            };
            res.status(500).json(response);
        }

    }


    public getRouter(): Router {
        return this.router;
    }  


    private async verifyUser(req: Request, res: Response): Promise <void> {
        
        let response: ResponseDTO<never>;
        const token = req.query.token as string;

        try {

            if (!token || token.trim() === '') {
                response = {
                    status: 400,
                    message: 'Token parameter must be a non-empty string',
                };
                res.status(400).json(response);
                return;
            }

            await this.userService.verifyUser(token);
            
            response = {
                status: 200,
                message: 'User verified successfully',
            };
            res.status(200).json(response);
        }

        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            if (errorMessage.includes('not found')) {
                response = {
                    status: 404,
                    message: errorMessage,
                };
                res.status(404).json(response);
                return;
            }

            response = {
                status: 500,
                message: `Error verifyUser: ${errorMessage}`,
            };
            res.status(500).json(response);
        }
    }

    private async googleAuthCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
        
        passport.authenticate('google', { 
            session: false,
            failureRedirect: 'http://localhost:4200/login/error'
        }, 
        (err: Error | null, user: UserDTO, _info: unknown) => {

            if (err) {
                return res.redirect(`http://localhost:4200/login/error?message=${encodeURIComponent(err.message)}`);
            }

            if (!user) {
                return res.redirect(`http://localhost:4200/login/error?message=Google%20login%20cancelled`);
            }

            try {
                const jwtSecret = process.env.JWT_SECRET;

                if (!jwtSecret) {
                    console.error('FATAL ERROR: JWT_SECRET is not defined in .env');
                    return res.redirect(`http://localhost:4200/login/error?message=Server%20configuration%20error`);
                }
                
                // Creamos nuestro propio Token de Sesión (JWT)
                const token = jwt.sign(
                    { id: user.id, email: user.email, role: user.role },
                    jwtSecret,
                    { expiresIn: '8h' } 
                );

                res.redirect(`http://localhost:4200/auth/callback?token=${token}`);

            } catch (jwtError) {
                console.error("Error creating JWT:", jwtError);
                res.redirect(`http://localhost:4200/login/error?message=Server%20error%20creating%20session`);
            }

        })(req, res, next); // ¡Importante! Llama al middleware de Passport
    }


    private async resendVerificationEmail(req: Request, res: Response): Promise<void> {
        
        let response: ResponseDTO<never>;
        const email = req.query.email as string;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        try {

            if (!email || email.trim() === '') {
                response = {
                    status: 400,
                    message: 'Email parameter must be a non-empty string',
                };
                res.status(400).json(response);
                return;
            }

            if (!emailRegex.test(email)) {
                response = {
                    status: 400,
                    message: 'Invalid email format',
                };
                res.status(400).json(response);
                return;
            }

            await this.userService.resendVerificationEmail(email);

            response = {
                status: 200,
                message: 'Verification email resent successfully',
            };
            res.status(200).json(response);
        }

        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            if (errorMessage.includes('not found')) {
                response = {
                    status: 404,
                    message: errorMessage,
                };
                res.status(404).json(response);
                return;
            }

            response = {
                status: 500,
                message: `Error resendVerificationEmail: ${errorMessage}`,
            };
            res.status(500).json(response);
        }
    }


}




