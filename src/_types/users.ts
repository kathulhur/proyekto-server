import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken'

export interface User {
    id?: ObjectId;
    username?: string;
    password?: string;
    role?: string;
    secretCode?: string;
    twoFactorAuthEnabled?: boolean;
    twoFactorAuthQrLink?: string;
}


export type AuthPayload = User & JwtPayload

export type UserDocument = User & Document


export interface CreateUserArgs {
    username: string;
    password: string;
    
}

export interface UpdateUserArgs  {
    id: ObjectId;
    username?: string;
    password?: string;
    role?: string;
    secretCode?: string;
    twoFactorAuthEnabled?: boolean;
    twoFactorAuthQrLink?: string;
}

export interface DeleteUserArgs {
    id: string;
}


export interface UserArgs {
    id: string;
}


export interface SignInArgs {
    username: string;
    password: string;
}

export interface ValidateCodeArgs {
    code: string;
    userId: ObjectId;
}


export interface getTwoFactorAuthQrLinkArgs {
    googleAuthApiKey: string
    appName: string
    username: string
    secretCode: string

}


export interface validateTwoFactorAuthArgs {
    googleAuthApiKey: string
    secretCode: string
    code: string
}