import { AddressPayload } from "../addresspayload";

export class GlobalPersonPayload {
    firstName: string;
    lastName: string;
    sexe: string;
    phoneNumber: string;
    address: AddressPayload;
    picture: any;
}