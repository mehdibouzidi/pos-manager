export class CommonCriteria {
    pages: number;
    size: number;
    sort: string;
    sortColumn: string;

    constructor(){
    this.pages = 0;
    this.size = 10;
    this.sort = "DESC";
    this.sortColumn = "updatedAt";
    }
}
