import { environment } from "src/environments/environment";
import { BusinessConstants } from "./BusinessConstants";
import { UtilStatic } from "./UtilStatic";
import { AdminConstants } from "./AdminConstants";


export class RequestsConstants{
    static readonly API_SOURCE: string = environment.api_source;


//ADMIN
    static readonly SIGNIN_REQ = RequestsConstants.API_SOURCE + AdminConstants.SIGNIN;
    static readonly LOGIN_REQ = RequestsConstants.API_SOURCE + AdminConstants.LOGIN;

 //BUSINESS
    //PRODUCT
    static readonly PRODUCT_REQ = RequestsConstants.API_SOURCE + BusinessConstants.PRODUCT;
    static readonly PRODUCT_ADD_REQ = RequestsConstants.PRODUCT_REQ + UtilStatic.SLASH + UtilStatic.ADD;
    static readonly PRODUCT_UPDATE_REQ = RequestsConstants.PRODUCT_REQ + UtilStatic.SLASH + UtilStatic.UPDATE;
    static readonly PRODUCT_DELETE_REQ = RequestsConstants.PRODUCT_REQ ;
    static readonly PRODUCT_FINDALL_REQ = RequestsConstants.PRODUCT_REQ + UtilStatic.SLASH + UtilStatic.FIND_ALL;
    static readonly PRODUCT_FINDALL_CRITERIA_REQ = RequestsConstants.PRODUCT_REQ + UtilStatic.SLASH + UtilStatic.FIND_ALL_BY_CRITERIA;
    static readonly PRODUCT_IMPORT_REQ = RequestsConstants.PRODUCT_REQ + UtilStatic.SLASH + UtilStatic.IMPORT;

    // ADMIN
     //Privilege
     static readonly PRIVILEGE_REQ = RequestsConstants.API_SOURCE + AdminConstants.PRIVILEGE;
     static readonly PRIVILEGE_ADD_REQ = RequestsConstants.PRIVILEGE_REQ + UtilStatic.SLASH + UtilStatic.ADD;
     static readonly PRIVILEGE_UPDATE_REQ = RequestsConstants.PRIVILEGE_REQ + UtilStatic.SLASH + UtilStatic.UPDATE;
     static readonly PRIVILEGE_DELETE_REQ = RequestsConstants.PRIVILEGE_REQ ;
     static readonly PRIVILEGE_FINDALL_REQ = RequestsConstants.PRIVILEGE_REQ + UtilStatic.SLASH + UtilStatic.FIND_ALL;
     static readonly PRIVILEGE_FINDALL_CRITERIA_REQ = RequestsConstants.PRIVILEGE_REQ + UtilStatic.SLASH + UtilStatic.FIND_ALL_BY_CRITERIA;

     //Profil
     static readonly PROFIL_REQ = RequestsConstants.API_SOURCE + AdminConstants.PROFIL;
     static readonly PROFIL_ADD_REQ = RequestsConstants.PROFIL_REQ + UtilStatic.SLASH + UtilStatic.ADD;
     static readonly PROFIL_UPDATE_REQ = RequestsConstants.PROFIL_REQ + UtilStatic.SLASH + UtilStatic.UPDATE;
     static readonly PROFIL_DELETE_REQ = RequestsConstants.PROFIL_REQ ;
     static readonly PROFIL_FINDALL_REQ = RequestsConstants.PROFIL_REQ + UtilStatic.SLASH + UtilStatic.FIND_ALL;
     static readonly PROFIL_FINDALL_CRITERIA_REQ = RequestsConstants.PROFIL_REQ + UtilStatic.SLASH + UtilStatic.FIND_ALL_BY_CRITERIA;


     //User
     static readonly USER_REQ = RequestsConstants.API_SOURCE + AdminConstants.USER;
     static readonly USER_ADD_REQ = RequestsConstants.USER_REQ + UtilStatic.SLASH + UtilStatic.ADD;
     static readonly USER_UPDATE_REQ = RequestsConstants.USER_REQ + UtilStatic.SLASH + UtilStatic.UPDATE;
     static readonly CHANGE_PASSWORD_REQ = RequestsConstants.USER_REQ + UtilStatic.SLASH + AdminConstants.CHANGE_PASSWORD;
     static readonly USER_DELETE_REQ = RequestsConstants.USER_REQ ;
     static readonly USER_DISABLE_REQ = RequestsConstants.USER_REQ + UtilStatic.SLASH + AdminConstants.DISABLE;
     static readonly USER_FINDALL_REQ = RequestsConstants.USER_REQ + UtilStatic.SLASH + UtilStatic.FIND_ALL;
     static readonly USER_FINDALL_CRITERIA_REQ = RequestsConstants.USER_REQ + UtilStatic.SLASH + UtilStatic.FIND_ALL_BY_CRITERIA;

     //Store
     static readonly STORE_REQ = RequestsConstants.API_SOURCE + AdminConstants.STORE;
     static readonly STORE_ADD_REQ = RequestsConstants.STORE_REQ + UtilStatic.SLASH + UtilStatic.ADD;
     static readonly STORE_UPDATE_REQ = RequestsConstants.STORE_REQ + UtilStatic.SLASH + UtilStatic.UPDATE;
     static readonly STORE_DELETE_REQ = RequestsConstants.STORE_REQ;
     static readonly STORE_FINDALL_REQ = RequestsConstants.STORE_REQ + UtilStatic.SLASH + UtilStatic.FIND_ALL;
     static readonly STORE_FINDALL_CRITERIA_REQ = RequestsConstants.STORE_REQ + UtilStatic.SLASH + UtilStatic.FIND_ALL_BY_CRITERIA;
}

