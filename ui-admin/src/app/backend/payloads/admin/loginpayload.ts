
export class LoginPayload{
    firstName: string;
    lastName: string;
    usernameOrEmail: string;
    password: string;
    storeCodeInput: string; // Store code entered by user at login (for non-superadmin)
    token: string;
    tokenExpiry: number | null;
    active: boolean;
    privileges: Array<string> = new Array<string>();
    
    // Super admin flag
    superAdmin: boolean;
    
    // Store info
    storeId: number;
    storeCode: string;
    storeName: string;
    // Sent by the API (LoginPayload.posId / posCode / posName)
    posId: number;
    posCode: string;
    posName: string;
    
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
        this.tokenExpiry = null;
        this.superAdmin = false;
        this.storeId = null;
        this.storeCode = null;
        this.storeName = null;
        this.posId = null;
        this.posCode = null;
        this.posName = null;
        this.errorCode = null;
        this.errorMessage = null;
    }
}
