import { CommonCriteria } from "../commoncriteria";

export class ProductCriteria extends CommonCriteria{
    id: number | null;
    code: string | null;
    name: string | null;
    gammeId: number | null;
    gammeName: string | null;
    gammes: Array<string> | null;
    categoryId: number | null;
    categoryName: string | null;
    categories: Array<string> | null;
    subCategoryId: number | null;
    subCategoryName: string | null;
    unitId: number | null;
    unitName: string | null;
    typeId: number | null;
    typeName: string | null;

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