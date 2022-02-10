import { CryptoService } from "../crypto/crypto.service";

export class ThreefoldLogin {

  private apiUrl : string;
  private pKidUrl : string;
  private cryptoService : CryptoService;
  private showWarnings : boolean = false;

  constructor(
      apiUrl : string,
      pKidUrl : string,
      options? : {
        showWarnings? : boolean
      }
    ) {
    this.apiUrl = apiUrl;
    this.pKidUrl = pKidUrl;

    this.showWarnings = options?.showWarnings == true;
    
    this.cryptoService = new CryptoService(
        this.apiUrl,
        this.pKidUrl,
    );
  }

  async recover(doubleName : string, seedPhrase : string) : Promise<{
      doublename : string,
      publicKey : string,
      email? : string,
      phone? : string,
      identity? : string,
      privateKey? : string,
    }> {
    var keys = await this.cryptoService.generateKeysFromSeedPhrase(seedPhrase);
    var keyPair = await this.cryptoService.generateKeyPairFromSeedPhrase(seedPhrase);

    let userInfo = await this.cryptoService.getThreefoldUserInfo(doubleName);

    if (!userInfo) {
      throw new Error(`Name was not found.`);
    }

    if (userInfo.publicKey != keys.publicKey) {
      throw new Error(`Seed phrase does not match with ${doubleName}`);
    }

    var keyWords = ['email', 'phone', 'identity'];

    for (let i = 0; i < keyWords.length; i++) {
      let key = keyWords[i];
      try {
        let pKidResult = await this.cryptoService.getPKidDoc(key, keyPair);
        userInfo[key] = pKidResult["value"];
      }catch(err : any) {
        // do nothing, maybe the user not set the $key
        if (this.showWarnings){
          console.log("[THREEFOLD_LOGIN] Warning: could not get " + key + ".\nDetails:", err.response?.data);
        }
      }
    }

    userInfo["privateKey"] = keys.privateKey;

    return userInfo;

  }

}