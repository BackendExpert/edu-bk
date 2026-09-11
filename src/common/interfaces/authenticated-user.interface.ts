export interface AuthenticatedUser {
    id: string;
    email: string;
    roleId: string;
    role: string;
    accountStatus: string;
    emailVerified: boolean;
    sessionId: string;
}