import { GlobalUserDatePayload } from "../global/GlobalUserDatePayload";

export class AdminAddressPayload  extends GlobalUserDatePayload  {
    address: string | null;
    city: string | null;
    town: string | null;
    country: string | null;
    postalCode: string | null;
    latitude: number | null;
    longitude: number | null;
    
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