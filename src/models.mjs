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
    }
});

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    secretCode: { type: String, required: true },
    twoFactorAuthEnabled: { type: Boolean, default: false },
});


const Client = mongoose.model('Client', ClientSchema);
const Project = mongoose.model('Project', ProjectSchema);
const User = mongoose.model('User', UserSchema);


export default { Client, Project, User };