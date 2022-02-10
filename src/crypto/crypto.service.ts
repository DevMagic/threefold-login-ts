import * as bip39 from 'bip39';
const sodium = require('libsodium-wrappers');
import { encodeUTF8, decodeBase64, encodeBase64 } from 'tweetnacl-util';
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

import * as Axios from 'axios';
const axios = Axios.default;

export class CryptoService {

  apiUrl : string;
  pKidUrl : string;

  constructor(
      apiUrl : string,
      pKidUrl : string,
      ) {
      this.apiUrl = apiUrl;
      this.pKidUrl = pKidUrl;
  }

  private verifyPKidData(message : string, encodedPublicKey : Uint8Array) : Uint8Array {
    var signedMessage = decodeBase64(message);
    return sodium.crypto_sign_open(signedMessage, encodedPublicKey);
  }

  async getPKidDoc(keyword : string, keyPair : { 
    publicKey : Uint8Array, 
    privateKey : Uint8Array, 
  }) {
    var publicKeyHex = this.toHexString(keyPair['publicKey']);

    let result = (await axios.get(`${this.pKidUrl}/documents/${publicKeyHex}/${keyword}`, { 
      headers: {
        "Content-type": "application/json",
      }
    })).data;

    var verified = await this.verifyPKidData(result.data, keyPair['publicKey']);
    var decodedData = JSON.parse(decoder.end(verified));

    if (decodedData["is_encrypted"] == 0) {
      let data = JSON.parse(decodedData["payload"]);
      return {
        "keyword" : keyword,
        "value" : data[keyword],
        "data" : data,
        "data_version" : decodedData["data_version"]
      };
    }

    let decryptedData = await this.decryptPkid(decodedData["payload"], keyPair.publicKey, keyPair.privateKey);
    let data = JSON.parse(decryptedData);
    return {
      "success" : true,
      "keyword" : keyword,
      "value" : data[keyword],
      "data" : data,
      "decrypted" : true,
      "data_version" : decodedData["data_version"]
    };

  }
  
  private async decryptPkid(cipherText : string, bobPublicKey : Uint8Array, bobPrivateKey : Uint8Array) : Promise<string> {
    var cipherEncodedText : Uint8Array = decodeBase64(cipherText);
    var publicKey : Uint8Array = sodium.crypto_sign_ed25519_pk_to_curve25519(bobPublicKey);
    var privateKey : Uint8Array = sodium.crypto_sign_ed25519_sk_to_curve25519(bobPrivateKey);
    var decrypted : Uint8Array = sodium.crypto_box_seal_open(cipherEncodedText, publicKey, privateKey);
    return String.fromCharCode(...decrypted);
  }

  private toHex(input : string) {
    var length = input.length / 2;
    var bytes = new Uint8Array(Math.ceil(length));
  
    for (var i = 0; i < bytes.length; i++) {
      var x = input.substring(i * 2, i * 2 + 2);
      bytes[i] = parseInt(x, 16);
    }
  
    return bytes;
  }

  async generateKeysFromSeedPhrase(seedPhrase : string) : Promise<{ 
    publicKey : string, 
    privateKey : string, 
  }> {
    await sodium.ready;
    this.checkSeedLength(seedPhrase);

    var entropy : string = bip39.mnemonicToEntropy(seedPhrase);
    let result : any = sodium.crypto_sign_seed_keypair(this.toHex(entropy));
    
    return { 
      publicKey : encodeBase64(result.publicKey), 
      privateKey : encodeBase64(result.privateKey),
    };
  }
  
  async generateKeyPairFromSeedPhrase(seedPhrase : string) : Promise<{ 
    publicKey : Uint8Array, 
    privateKey : Uint8Array, 
  }> {
    await sodium.ready;
    this.checkSeedLength(seedPhrase);

    var entropy : string = bip39.mnemonicToEntropy(seedPhrase);
    let result : any = sodium.crypto_sign_seed_keypair(this.toHex(entropy));
    
    return { 
      publicKey : result.publicKey, 
      privateKey : result.privateKey,
    };
  }
  
  getEdPkInCurve(publicKey : Uint8Array) : string {
    const signingKey = sodium.crypto_sign_ed25519_pk_to_curve25519(publicKey);
    return encodeBase64(signingKey);
  }
  
  private checkSeedLength(seedPhrase  : string) {
    var seedLength = seedPhrase.split(" ").length;
    if (seedLength <= 23) {
      throw new Error('Seed phrase is too short');
    } else if (seedLength > 24) {
      throw new Error('Seed phrase is too long');
    }
  }

  private toHexString(byteArray : Uint8Array) : string {
    return Array.from(byteArray, function(byte : any) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  }

  async getThreefoldUserInfo(doubleName : string) {
    let result = await axios.get(`${this.apiUrl}/users/${doubleName}.3bot`, { 
      headers: {
        "Content-type": "application/json",
      }
    });
    return result.data;
  }
  
}