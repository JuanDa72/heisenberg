import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { UserServiceInterface } from "../service/user.service";
import { UserRepositoryInterface } from "../repository/user.repository";
import {config} from 'dotenv';

import { UserRepository } from "../repository/user.repository";
import { UserService } from "../service/user.service";
import UserDTO, { GoogleUserDTO } from "../dto/user.dto";

config();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

//Configuración de la estrategia de Google OAuth2
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: "http://localhost:3000/users/auth/google/callback",
    scope: ['profile', 'email'],
    },

    async (accessToken, refreshToken, profile, done) => {
    
        try {
            const googleId = profile.id;
            const email = profile.emails && profile.emails[0].value;
            const username = profile.displayName;
        

        if(!email){
            return done(new Error('No email found in Google profile'), false);
        }

        //Ya conoce el google id
        let user: UserDTO | null = await userRepository.findByGoogleId(googleId);
        if(user){
            return done(null, user);
        }

        //No conoce el google id, pero puede que conozca el email
        user = await userRepository.findByEmail(email);
        if(user){
            return done(new Error('Este correo ya está registrado. Por favor, inicia sesión con tu contraseña.'), undefined);
        }

        //Usuario nuevo
        const googleUserData: GoogleUserDTO = {
            google_id: googleId,
            email:  email,
            username: username,
            role: 'user',
            is_verified: true,
            provider: 'google',
        };

        const newUser = await userService.createUserFromGoogle(googleUserData);
        return done(null, newUser);

        } catch (error) {
            console.error('Error in GoogleStrategy:', error);
            return done(error as Error, false);
        }   


    }));