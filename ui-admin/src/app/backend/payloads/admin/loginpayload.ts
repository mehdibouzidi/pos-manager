
export class LoginPayload{
    firstName: string;
    lastName: string;
    usernameOrEmail: string;
    password: string;
    storeCodeInput: string; // Store code entered by user at login (for non-superadmin)
    token: string;
    active: boolean;
    privileges: Array<string> = new Array<string>();
    
    // Super admin flag
    superAdmin: boolean;
    
    // Store info
    storeId: number;
    storeCode: string;
    storeName: string;
    
    // Error handling
    errorCode: string;
    errorMessage: string;

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
