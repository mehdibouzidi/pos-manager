import { AddressPayload } from "../business/addresspayload";

export class GlobalPersonPayload {
    id: number;
    firstName: string;
    lastName: string;
    sexe: string;
    phoneNumber: string;
    email: string;
    address: AddressPayload;
    picture: any;
    
    // Audit fields
    createdAt: string;
    updatedAt: string;
    createdById: number;
    createdByUsername: string;
    updatedById: number;
    updatedByUsername: string;
    
    // Store information for multi-tenancy
    storeId: number;
    storeCode: string;
    storeName: string;
}
