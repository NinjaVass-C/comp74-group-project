export class TokenPayload {
    [key: string]: any;
    
    public user: {
        id: number;
        username: string;
    }

    constructor(user: { id: number; username: string }) {
        this.user = user;
    }
}
