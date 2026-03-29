
export class LoginPayload{
    firstName: string | null;
    lastName: string | null;
    usernameOrEmail: string | null;
    password: string | null;
    token: string | null;
    active: boolean | null = null;
    privileges: Array<string> = new Array<string>();
    
    // Super admin flag
    superAdmin: boolean = false;
    
    // Store info
    posId: number | null;
    posCode: string | null;
    posName: string | null;
    
    // Error handling
    errorCode: string | null;
    errorMessage: string | null;

    constructor(){
        this.firstName = null;
        this.lastName = null;
        this.usernameOrEmail = null;
        this.password = null;
        this.token = null;
        this.superAdmin = false;
        this.posId = null;
        this.posCode = null;
        this.posName = null;
        this.errorCode = null;
        this.errorMessage = null;
    }
}
