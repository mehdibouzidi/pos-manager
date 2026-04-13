import { Request } from "../../payloads/Request";
import { RequestsConstants } from "./RequestsConstants";

export class RequestsLists {
    static readonly GET: string = 'GET';
    static readonly POST: string = 'POST';
    static readonly PUT: string = 'PUT';
    static readonly DELETE: string = 'DELETE';

    static readonly REQ_WITHOUT_BEARER: Request[] = [
        new Request(RequestsLists.POST, RequestsConstants.LOGIN_REQ),
    ];

    static readonly REQ_WITH_BEARER: Request[] = [

        // PRODUCT
        new Request(RequestsLists.GET, RequestsConstants.PRODUCT_REQ),
        new Request(RequestsLists.POST, RequestsConstants.PRODUCT_ADD_REQ),
        new Request(RequestsLists.PUT, RequestsConstants.PRODUCT_UPDATE_REQ),
        new Request(RequestsLists.DELETE, RequestsConstants.PRODUCT_DELETE_REQ),
        new Request(RequestsLists.GET, RequestsConstants.PRODUCT_FINDALL_REQ),
        new Request(RequestsLists.POST, RequestsConstants.PRODUCT_FINDALL_CRITERIA_REQ),
        new Request(RequestsLists.POST, RequestsConstants.PRODUCT_IMPORT_REQ),

        // PRODUCT CATEGORY
        new Request(RequestsLists.GET, RequestsConstants.PRODUCT_CATEGORY_REQ),
        new Request(RequestsLists.POST, RequestsConstants.PRODUCT_CATEGORY_ADD_REQ),
        new Request(RequestsLists.PUT, RequestsConstants.PRODUCT_CATEGORY_UPDATE_REQ),
        new Request(RequestsLists.DELETE, RequestsConstants.PRODUCT_CATEGORY_DELETE_REQ),
        new Request(RequestsLists.GET, RequestsConstants.PRODUCT_CATEGORY_FINDALL_REQ),
        new Request(RequestsLists.POST, RequestsConstants.PRODUCT_CATEGORY_FINDALL_CRITERIA_REQ),

        // ADMIN - Privilege
        new Request(RequestsLists.GET, RequestsConstants.PRIVILEGE_REQ),
        new Request(RequestsLists.POST, RequestsConstants.PRIVILEGE_ADD_REQ),
        new Request(RequestsLists.PUT, RequestsConstants.PRIVILEGE_UPDATE_REQ),
        new Request(RequestsLists.DELETE, RequestsConstants.PRIVILEGE_DELETE_REQ),
        new Request(RequestsLists.GET, RequestsConstants.PRIVILEGE_FINDALL_REQ),
        new Request(RequestsLists.POST, RequestsConstants.PRIVILEGE_FINDALL_CRITERIA_REQ),

        // ADMIN - Profil
        new Request(RequestsLists.GET, RequestsConstants.PROFIL_REQ),
        new Request(RequestsLists.POST, RequestsConstants.PROFIL_ADD_REQ),
        new Request(RequestsLists.PUT, RequestsConstants.PROFIL_UPDATE_REQ),
        new Request(RequestsLists.DELETE, RequestsConstants.PROFIL_DELETE_REQ),
        new Request(RequestsLists.GET, RequestsConstants.PROFIL_FINDALL_REQ),
        new Request(RequestsLists.POST, RequestsConstants.PROFIL_FINDALL_CRITERIA_REQ),

        // ADMIN - User
        new Request(RequestsLists.POST, RequestsConstants.SIGNIN_REQ),
        new Request(RequestsLists.GET, RequestsConstants.USER_REQ),
        new Request(RequestsLists.POST, RequestsConstants.USER_ADD_REQ),
        new Request(RequestsLists.PUT, RequestsConstants.USER_UPDATE_REQ),
        new Request(RequestsLists.PUT, RequestsConstants.CHANGE_PASSWORD_REQ),
        new Request(RequestsLists.PUT, RequestsConstants.USER_DISABLE_REQ),
        new Request(RequestsLists.DELETE, RequestsConstants.USER_DELETE_REQ),
        new Request(RequestsLists.POST, RequestsConstants.USER_FINDALL_REQ),
        new Request(RequestsLists.POST, RequestsConstants.USER_FINDALL_CRITERIA_REQ),

        // ADMIN - POS
        new Request(RequestsLists.GET, RequestsConstants.POS_REQ),
        new Request(RequestsLists.POST, RequestsConstants.POS_ADD_REQ),
        new Request(RequestsLists.PUT, RequestsConstants.POS_UPDATE_REQ),
        new Request(RequestsLists.DELETE, RequestsConstants.POS_DELETE_REQ),
        new Request(RequestsLists.GET, RequestsConstants.POS_FINDALL_REQ),
        new Request(RequestsLists.POST, RequestsConstants.POS_FINDALL_CRITERIA_REQ),

        // ADMIN - API Key
        new Request(RequestsLists.GET, RequestsConstants.API_KEY_REQ),
        new Request(RequestsLists.POST, RequestsConstants.API_KEY_ADD_REQ),
        new Request(RequestsLists.PUT, RequestsConstants.API_KEY_UPDATE_REQ),
        new Request(RequestsLists.DELETE, RequestsConstants.API_KEY_DELETE_REQ),
        new Request(RequestsLists.GET, RequestsConstants.API_KEY_FINDALL_REQ),
        new Request(RequestsLists.POST, RequestsConstants.API_KEY_FINDALL_CRITERIA_REQ),
        new Request(RequestsLists.POST, RequestsConstants.API_KEY_REGENERATE_REQ),

        // ADMIN - Session Log
        new Request(RequestsLists.GET, RequestsConstants.SESSION_LOG_REQ),
        new Request(RequestsLists.GET, RequestsConstants.SESSION_LOG_FINDALL_REQ),
        new Request(RequestsLists.POST, RequestsConstants.SESSION_LOG_FINDALL_CRITERIA_REQ),

        // BUSINESS - Stock Movement
        new Request(RequestsLists.GET, RequestsConstants.STOCK_MOVEMENT_REQ),
        new Request(RequestsLists.POST, RequestsConstants.STOCK_MOVEMENT_ADD_REQ),
        new Request(RequestsLists.PUT, RequestsConstants.STOCK_MOVEMENT_UPDATE_REQ),
        new Request(RequestsLists.DELETE, RequestsConstants.STOCK_MOVEMENT_DELETE_REQ),
        new Request(RequestsLists.GET, RequestsConstants.STOCK_MOVEMENT_FINDALL_REQ),
        new Request(RequestsLists.POST, RequestsConstants.STOCK_MOVEMENT_FINDALL_CRITERIA_REQ),

        // BUSINESS - Dashboard
        new Request(RequestsLists.GET, RequestsConstants.DASHBOARD_STATS_REQ),

        // BUSINESS - Caisse Session
        new Request(RequestsLists.POST, RequestsConstants.CAISSE_SESSION_FINDALL_CRITERIA_REQ),
    ];
}
