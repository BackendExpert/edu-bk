import { Types } from "mongoose";

export interface JwtPayload {
    sub: string;
    sessionId: string;
    user?: {
        id: Types.ObjectId;
        email: string;
        roleId: Types.ObjectId;
        role: string;
        institutionId: Types.ObjectId | null;
        accountStatus: string;
        emailVerified: boolean;
    };
}