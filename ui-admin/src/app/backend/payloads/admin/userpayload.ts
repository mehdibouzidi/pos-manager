import { AdminAddressPayload } from "./adminaddresspayload";
import { ProfilPayload } from "./profilpayload";

export class UserPayload {
  id: number;

  username: string;
  password: string;

  firstName: string;
  lastName: string;
  sexe: string;
  phoneNumber: string;
  email: string;
  address: AdminAddressPayload;
  picture: any;
  disableDisplay: boolean = false;
  active: boolean = true;

  profils: Array<ProfilPayload>;
  
  // POS info
  posId: number;
  posCode: string;
  posName: string;
  
  // Super admin flag
  superAdmin: boolean = false;

  constructor() {
    this.id = null;
    
    this.username = null;
    this.password = null;
    
    this.firstName = null;
    this.lastName = null;
    this.sexe = null;
    this.phoneNumber = null;
    this.email = null;
    this.address = new AdminAddressPayload();
    this.picture = null;
    this.disableDisplay = false;
    this.profils = null;
    
    this.posId = null;
    this.posCode = null;
    this.posName = null;
    this.superAdmin = false;
  }
}
