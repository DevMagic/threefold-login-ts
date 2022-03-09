export interface ThreefoldError {
    message : string;
}

export class ThreefoldErrorException implements ThreefoldError {

    message : string = "";

    constructor(message : string) {
        this.message = message;
    }

}