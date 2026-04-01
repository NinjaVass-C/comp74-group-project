
export interface IDatabaseService {
    getConnection(): Promise<any>;
}