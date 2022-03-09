export class ThreefoldUtils {

    static isValidDoubleName(doubleName : string) {
        return doubleName.match(/^[a-zA-Z0-9]+$/);
    }

    static isValidEmail(email : string) {
        return email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?)*/);
    }

    static strEncodeUTF16(str : string) : Uint16Array {
        var buf = new ArrayBuffer(str.length*2);
        var bufView = new Uint16Array(buf);
        for (var i=0, strLen=str.length; i < strLen; i++) {
          bufView[i] = str.charCodeAt(i);
        }
        return bufView;
    }

}