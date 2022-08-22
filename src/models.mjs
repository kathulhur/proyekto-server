import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const ProjectSchema = new mongoose.Schema({
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
    
});

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['ADMIN', 'USER'], default: 'USER' },
    secretCode: { type: String, required: true },
    twoFactorAuthEnabled: { type: Boolean, default: false },
    twoFactorAuthQrLink: { type: String, default: null }
});


const Client = mongoose.model('Client', ClientSchema);
const Project = mongoose.model('Project', ProjectSchema);
const User = mongoose.model('User', UserSchema);


export default { Client, Project, User };