
export class LoginPayload{
    firstName: string | null;
    lastName: string | null;
    usernameOrEmail: string | null;
    password: string | null;
    storeCodeInput: string | null;
    token: string | null;
    active: boolean | null = null;
    privileges: Array<string> = new Array<string>();
    
    // Super admin flag
    superAdmin: boolean = false;
    
    // Store info
    storeId: number | null;
    storeCode: string | null;
    storeName: string | null;
    
    // Error handling
    errorCode: string | null;
    errorMessage: string | null;

    constructor(){
        this.firstName = null;
        this.lastName = null;
        this.usernameOrEmail = null;
        this.password = null;
        this.storeCodeInput = null;
        this.token = null;
        this.superAdmin = false;
        this.storeId = null;
        this.storeCode = null;
        this.storeName = null;
        this.errorCode = null;
        this.errorMessage = null;
    }
}
