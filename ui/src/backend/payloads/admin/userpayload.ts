import { AdminAddressPayload } from "./adminaddresspayload";
import { ProfilPayload } from "./profilpayload";

export class UserPayload {
  id: number | null;

  username: string | null;
  password: string | null;

  firstName: string | null;
  lastName: string | null;
  sexe: string | null;
  phoneNumber: string | null;
  email: string | null;
  address: AdminAddressPayload;
  picture: any;
  disableDisplay: boolean = false;
  active: boolean = true;

  profils: Array<ProfilPayload> | null;
  
  // Store info
  storeId: number | null;
  storeCode: string | null;
  storeName: string | null;
  
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
    
    this.storeId = null;
    this.storeCode = null;
    this.storeName = null;
    this.superAdmin = false;
  }
}
