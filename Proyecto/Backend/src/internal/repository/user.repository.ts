import User from "../domain/user.model";
import UserDTO, {UpdateUserDTO, ServiceUserDTO, VerificationTokenDTO, GoogleUserDTO } from "../dto/user.dto";
import { FindOptions, Op, UniqueConstraintError, ValidationError} from "sequelize";

export interface UserRepositoryInterface {
    findById(id: number): Promise<UserDTO|null>;
    fullFindById(id: number): Promise<VerificationTokenDTO | null>;
    findAll(limit?: number, offset?: number): Promise<UserDTO[]>;
    create(ServiceUserDTO: ServiceUserDTO): Promise<UserDTO>;
    update(id: number, userData: UpdateUserDTO): Promise<UserDTO|null>;
    delete(id: number): Promise<boolean>;
    existsById(id: number): Promise<boolean>;
    findByEmail(email: string): Promise<UserDTO|null>;
    findByEmailForLogin(email: string): Promise<ServiceUserDTO | null>;
    findByVerificationToken(token: string): Promise<VerificationTokenDTO | null>;
    updatePassword(id: number, hash_password: string): Promise<void>;
    findByGoogleId(google_id: string): Promise<UserDTO | null>;
    createUserFromGoogle(googleUserData: GoogleUserDTO): Promise<UserDTO>;
    findForResendVerificationEmail(email: string): Promise<VerificationTokenDTO | null>;
}    

export class UserRepository{

    async findById(id: number): Promise<UserDTO | null> {

        try {
            const user=await User.findByPk(id);

            if(!user){
                return null;
            }

            const plain = user?.get({plain:true});
            delete plain.hash_password;
            return plain as UserDTO;
        }

        catch (error){
            console.error('Error findById:', error);
            throw error;
        }
    }

    async fullFindById(id: number): Promise<VerificationTokenDTO | null> {

        try {
            const user=await User.findByPk(id);

            if(!user){
                return null;
            }

            const plain = user?.get({plain:true});
            return plain as VerificationTokenDTO;
        }

        catch (error){
            console.error('Error fullFindById:', error);
            throw error;
        }
    }


    async findAll(limit ?: number, offset?: number): Promise<UserDTO[]> {

        try {

            const options: FindOptions = {
                order: [['created_at', 'DESC']]
            };

            if (limit !== undefined) options.limit = limit;
            if (offset !== undefined) options.offset = offset;

            const users=await User.findAll(options);
            return users.map(u => {
            const plain = u.get({ plain: true });
            delete plain.hash_password;
            return plain as UserDTO;
        });

        } catch (error) {
            console.error('Error findAll:', error);
            throw error;
        }
    }


    async create(userData: ServiceUserDTO): Promise<UserDTO> {

        try{
            const user=await User.create(userData as any);
            const plain = user.get({ plain: true });
            delete plain.hash_password;
            return plain as UserDTO;
        }
    
        catch (error){

            if(error instanceof UniqueConstraintError){
                throw new Error(`User with email "${userData.email}" already exists in database`);
            }

            if(error instanceof ValidationError){
                throw new Error(`Database validation error: ${error.message}`);
            }

            console.error('Error create:', error);
            throw new Error('Error creating user in database');

        }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
    }

    async createUserFromGoogle(googleUserData: GoogleUserDTO): Promise<UserDTO> {

        try {
            const user = await User.create(googleUserData as any);
            const plain = user.get({ plain: true });
            delete plain.hash_password;
            return plain as UserDTO;
        }

        catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new Error(`User with email "${googleUserData.email}" already exists in database`);
            }

            if (error instanceof ValidationError) {
                throw new Error(`Database validation error: ${error.message}`);
            }

            console.error('Error createUserFromGoogle:', error);
            throw new Error('Error creating user from Google in database');
        }

    }

    async update(id: number, userData: UpdateUserDTO): Promise<UserDTO | null> {

        try {
            const user=await User.findByPk(id);
            if(!user){
                return null;
            }

            await user.update(userData as any);
            const plain = user?.get({plain:true});
            delete plain.hash_password;
            return plain as UserDTO;

        }


        catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new Error(`User with email "${userData.email}" already exists in database`);
            }

            if(error instanceof ValidationError){
                throw new Error(`Database validation error: ${error.message}`);
            }

            console.error('Error update:', error);
            throw new Error('Error updating user in database');


        }

    }

    
    async updatePassword(id: number, hash_password: string): Promise<void> {

        try {
            const user=await User.findByPk(id);
            if(!user){
                throw new Error(`User with ID ${id} not found`);
            }

            await user.update({hash_password} as any);
        }

        catch (error) {
            console.error('Error updatePassword:', error);
            throw new Error('Error updating user password in database');
        }

    }


    async delete(id: number): Promise<boolean> {

        try {
            const deletedCount=await User.destroy({
                where: {id}
            });

            return deletedCount>0;
        }

        catch (error) {
            console.error('Error delete:', error);
            throw new Error('Error deleting user from database');
        }


    }


    async existsById(id: number): Promise<boolean> {

        try {
            const count=await User.count({
                where: {id}
            });
            
            return count>0;
        }

        catch (error) {
            console.error('Error existsById:', error);
            throw error;
        }
    
    }

    //Ahora metodos adiciionales :)

    //Encontrar por email 
    async findByEmail(email: string): Promise<UserDTO | null> {

        try {
            const user=await User.findOne({
                where: {email: {[Op.eq] : email}}
            });

            if(!user){
                return null;
            }

            const plain = user.get({plain:true});
            delete plain.hash_password;
            return plain as UserDTO;
        }

        catch (error) {
            console.error('Error findByEmail:', error);
            throw error;
        }

    }

    async findByEmailForLogin(email: string): Promise<ServiceUserDTO | null> {

        try {
            const user=await User.findOne({
                where: {email: {[Op.eq] : email}}
            });

            return user?.get({plain:true}) as ServiceUserDTO;
        }

        catch (error) {
            console.error('Error findByEmailForLogin:', error);
            throw error;
        }

    }

    async findForResendVerificationEmail(email: string): Promise<VerificationTokenDTO | null> {

        try {
            const user = await User.findOne({
                where: { email: { [Op.eq]: email } }
            });

            if (!user) {
                return null;
            }

            return user.get({ plain: true }) as VerificationTokenDTO;   
        }

        catch (error) {
            console.error('Error findForResendVerificationEmail:', error);
            throw error;
        }
    }

    async findByVerificationToken(token: string): Promise<VerificationTokenDTO | null> {
        
        try {
            const user = await User.findOne({
                where: { verification_token: { [Op.eq]: token } }
            });

            return user ? (user.get({ plain: true }) as VerificationTokenDTO) : null;

        }

        catch (error) {
            console.error('Error findByVerificationToken:', error);
            throw error;
        }

    }


    async findByGoogleId(google_id: string): Promise<UserDTO | null> {

        try {

            const user=await User.findOne({
                where: {google_id: {[Op.eq] : google_id}}
            });

            if(!user){
                return null;
            }

            return user.get({plain:true}) as UserDTO;

          }

        catch (error) {
            console.error('Error findByGoogleId:', error);
            throw error;
        }

    }



}
