# Threefold Connect Login TypeScript

## Install
npm

`npm install --save @devmagic/threefold-login-ts`


## Usage

Login with your Threefold Connect credentials, or register new Threefold Connect account
```ts

const THREEFOLD_BOT_API_URL_PRODUCTION = "https://login.threefold.me/api";
const THREEFOLD_BOT_API_URL_STAGING = "https://login.staging.jimber.org/api";
const THREEFOLD_BOT_API_URL_TESTING = "https://login.testing.jimber.org/api";
const PKID_API_URL_PRODUCTION = "https://pkid.jimber.org/v1";
const PKID_API_URL_STAGING = "https://pkid.staging.jimber.org/v1";
const PKID_API_URL_TESTING = "https://pkid.testing.jimber.org/v1";

var threefoldLogin = new ThreefoldLogin(
	THREEFOLD_BOT_API_URL_STAGING,
	PKID_API_URL_STAGING,
	{
		showWarnings : false, //default: false
	}
);

//Login

var loggedInUser = await threefoldLogin.recover(
	"YOUR_USER_NAME", //username without ".3bot"
	"SEED_PHRASE"
);

console.log(loggedInUser);

//Output:

{
  doublename: 'YOUR_USER_NAME.3bot',
  publicKey: '******',
  email: 'john.doe@email.com',
  phone: '+55',
  privateKey: '******'
}

//Create account

var register = await threefoldLogin.register(
	"NEW_ACCOUNT_USER_NAME", //username without ".3bot"
	"NEW_ACCOUNT_EMAIL",
	"SEED_PHRASE", //mnemonic
);

//Account creation does not have an output. 
//If there is an error, an exception will be thrown.

```