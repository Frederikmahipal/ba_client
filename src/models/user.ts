// src/user.ts
export interface User {
    name: string;
    email: string;
    password?: string;
    spotifyId?: string;
    accessToken?: string;
}