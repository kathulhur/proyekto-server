import { Schema, model, } from 'mongoose';
import { Client } from './_types/clients'
import { ProjectDocument } from './_types/projects'
import { UserDocument } from './_types/users';
import { ClientDocument } from './_types/clients';

const ClientSchema = new Schema<ClientDocument>({
    name: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

const ProjectSchema = new Schema<ProjectDocument>({
    name: {
        type: String
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['NEW', 'PROGRESS', 'COMPLETED']
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
    
});

const UserSchema = new Schema<UserDocument>({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['ADMIN', 'USER'], default: 'USER' },
    secretCode: { type: String, required: true },
    twoFactorAuthEnabled: { type: Boolean, default: false },
    twoFactorAuthQrLink: { type: String, default: null }
});


const Client = model<ClientDocument>('Client', ClientSchema);
const Project = model<ProjectDocument>('Project', ProjectSchema);
const User = model<UserDocument>('User', UserSchema);


export default { Client, Project, User };