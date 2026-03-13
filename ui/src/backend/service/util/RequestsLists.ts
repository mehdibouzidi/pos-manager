import { Request } from "../../payloads/Request";
import { BusinessConstants } from "./BusinessConstants";
import { RequestsConstants } from "./RequestsConstants";
import { UtilStatic } from "./UtilStatic";

export class RequestsLists{
    static readonly GET: string = 'GET';
    static readonly POST: string = 'POST';
    static readonly PUT: string = 'PUT';
    static readonly DELETE: string = 'DELETE';

    static readonly REQ_WITHOUT_BEARER:Request[]= [
        new Request(RequestsLists.POST, RequestsConstants.LOGIN_REQ),
    ];

   static readonly REQ_WITH_BEARER:Request[]= [

        // PRODUCT
        new Request(RequestsLists.GET, RequestsConstants.PRODUCT_REQ),
        new Request(RequestsLists.POST, RequestsConstants.PRODUCT_ADD_REQ),
        new Request(RequestsLists.PUT, RequestsConstants.PRODUCT_UPDATE_REQ),
        new Request(RequestsLists.DELETE, RequestsConstants.PRODUCT_DELETE_REQ),
        new Request(RequestsLists.GET, RequestsConstants.PRODUCT_FINDALL_REQ),
        new Request(RequestsLists.POST, RequestsConstants.PRODUCT_FINDALL_CRITERIA_REQ),
        new Request(RequestsLists.POST, RequestsConstants.PRODUCT_IMPORT_REQ),

        // Admin
        //PRIVILEGE
        new Request(RequestsLists.GET, RequestsConstants.PRIVILEGE_REQ),
        new Request(RequestsLists.POST, RequestsConstants.PRIVILEGE_ADD_REQ),
        new Request(RequestsLists.PUT, RequestsConstants.PRIVILEGE_UPDATE_REQ),
        new Request(RequestsLists.DELETE, RequestsConstants.PRIVILEGE_DELETE_REQ),
        new Request(RequestsLists.GET, RequestsConstants.PRIVILEGE_FINDALL_REQ),
        new Request(RequestsLists.POST, RequestsConstants.PRIVILEGE_FINDALL_CRITERIA_REQ),

        //PROFIL
        new Request(RequestsLists.GET, RequestsConstants.PROFIL_REQ),
        new Request(RequestsLists.POST, RequestsConstants.PROFIL_ADD_REQ),
        new Request(RequestsLists.PUT, RequestsConstants.PROFIL_UPDATE_REQ),
        new Request(RequestsLists.DELETE, RequestsConstants.PROFIL_DELETE_REQ),
        new Request(RequestsLists.GET, RequestsConstants.PROFIL_FINDALL_REQ),
        new Request(RequestsLists.POST, RequestsConstants.PROFIL_FINDALL_CRITERIA_REQ),

        //USER
        new Request(RequestsLists.POST, RequestsConstants.SIGNIN_REQ),

        new Request(RequestsLists.GET, RequestsConstants.USER_REQ),
        new Request(RequestsLists.POST, RequestsConstants.USER_ADD_REQ),
        new Request(RequestsLists.PUT, RequestsConstants.USER_UPDATE_REQ),
        new Request(RequestsLists.PUT, RequestsConstants.CHANGE_PASSWORD_REQ),
        new Request(RequestsLists.PUT, RequestsConstants.USER_DISABLE_REQ),
        new Request(RequestsLists.DELETE, RequestsConstants.USER_DELETE_REQ),
        new Request(RequestsLists.POST, RequestsConstants.USER_FINDALL_REQ),
        new Request(RequestsLists.POST, RequestsConstants.USER_FINDALL_CRITERIA_REQ),

        //STORE
        new Request(RequestsLists.GET, RequestsConstants.STORE_REQ),
        new Request(RequestsLists.POST, RequestsConstants.STORE_ADD_REQ),
        new Request(RequestsLists.PUT, RequestsConstants.STORE_UPDATE_REQ),
        new Request(RequestsLists.DELETE, RequestsConstants.STORE_DELETE_REQ),
        new Request(RequestsLists.GET, RequestsConstants.STORE_FINDALL_REQ),
        new Request(RequestsLists.POST, RequestsConstants.STORE_FINDALL_CRITERIA_REQ),
    ];



}

