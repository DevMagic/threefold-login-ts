import { CryptoService } from "../crypto/crypto.service";
import * as Axios from 'axios';
import { ThreefoldErrorException } from "./threefold-error-exception";
import { ThreefoldUtils } from "./threefold-utils";
const axios = Axios.default;

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

    let userInfo = await this.getUserInfo(doubleName + ".3bot");

    if (!userInfo) {
      throw new ThreefoldErrorException(`USER_NOT_FOUND`);
    }

    if (userInfo.publicKey != keys.publicKey) {
      throw new ThreefoldErrorException(`SEED_PHRASE_DOES_NOT_MATCH`);
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

  async register(doubleNameWithout3bot : string, email : string, seedPhrase : string, sid : string = "random") : Promise<void> {

    if (!ThreefoldUtils.isValidDoubleName(doubleNameWithout3bot)) {
      throw new ThreefoldErrorException('INVALID_DOUBLENAME');
    }

    if (!ThreefoldUtils.isValidEmail(email)) {
      throw new ThreefoldErrorException('INVALID_EMAIL');
    }

    var doubleName = doubleNameWithout3bot + ".3bot";

    if (await this.userAlreadyExists(doubleName)) {
      throw new ThreefoldErrorException('USER_ALREADY_EXISTS');
    }

    var keys = await this.cryptoService.generateKeysFromSeedPhrase(seedPhrase);

    await axios.post(`${this.apiUrl}/mobileregistration`, {
      "doubleName" : doubleName,
      "sid" : sid,
      "email" : email.toLowerCase().trim(),
      "public_key" : keys.publicKey,
    }, { 
      headers: {
        "Content-type": "application/json",
      }
    });

  }

  async getUserInfo(doubleNameWith3bot : string) {

    let result = await axios.get(`${this.apiUrl}/users/${doubleNameWith3bot}`, { 
      headers: {
        "Content-type": "application/json",
      }
    });
    return result.data;

  }

  async userAlreadyExists(doubleNameWith3bot : string) : Promise<boolean> {
    try {
      let result = await axios.get(`${this.apiUrl}/users/${doubleNameWith3bot}`, { 
        headers: {
          "Content-type": "application/json",
        }
      });
      return result.status == 200;
    }catch(err) {
      return false;
    }
  };

}