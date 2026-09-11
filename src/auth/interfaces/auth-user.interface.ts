import { Types } from 'mongoose';

export interface AuthUser {
    userId: string;
    roleId: string;
    sessionId: string;
}