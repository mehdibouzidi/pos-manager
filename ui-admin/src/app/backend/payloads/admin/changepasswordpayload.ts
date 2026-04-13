
export class ChangePasswordPayload{
    oldPassword: string | null;
    newPassword: string | null;
    newPasswordConfirmed: string | null;
    
    constructor(){
        this.oldPassword = null;
        this.newPassword = null;
        this.newPasswordConfirmed = null;
    }
}