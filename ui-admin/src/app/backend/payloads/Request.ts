export class Request{
    method: string;
    url: string;

    constructor(method: string, url: string){
        this.method = method;
        this.url = url;
    }
}