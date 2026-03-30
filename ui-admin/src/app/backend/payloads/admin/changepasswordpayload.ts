
export class ChangePasswordPayload{
    oldPassword: string;
    newPassword: string;
    newPasswordConfirmed: string;
    
    constructor(){
        this.oldPassword = null;
        this.newPassword = null;
        this.newPasswordConfirmed = null;
    }
}