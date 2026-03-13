import { CommonCriteria } from "../commoncriteria";

export class ProductCriteria extends CommonCriteria{
    id: number;
    code: string;
    name: string;
    gammeId: number;
    gammeName: string;
    gammes: Array<string>;
    categoryId: number;
    categoryName: string;
    categories: Array<string>;
    subCategoryId: number;
    subCategoryName: string;
    unitId: number;
    unitName: string;
    typeId: number;
    typeName: string;

    constructor(){
        super();
        this.id = null;
        this.code = null;
        this.name = null;
        this.gammeId = null;
        this.gammeName = null;
        this.gammes = null;
        this.categoryId = null;
        this.categoryName = null;
        this.categories = null;
        this.subCategoryId = null;
        this.subCategoryName = null;
        this.unitId = null;
        this.unitName = null;
        this.typeId = null;
        this.typeName = null;
    }
}