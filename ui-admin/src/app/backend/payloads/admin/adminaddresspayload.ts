import { GlobalUserDatePayload } from "../global/GlobalUserDatePayload";

export class AdminAddressPayload  extends GlobalUserDatePayload  {
    address: string;
    city: string;
    town: string;
    country: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    
    constructor(){
        super();
        this.address = null;
        this.city = null;
        this.town = null;
        this.country = null;
        this.postalCode = null;
        this.latitude = null;
        this.longitude = null;
    }
}