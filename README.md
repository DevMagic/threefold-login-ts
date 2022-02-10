# Threefold Connect Login TypeScript

## Install
npm

`npm install --save @devmagic/threefold-login-ts`


## Usage

Login with your Threefold Connect credentials
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

threefoldLogin.recover(
	"username", //username without ".3bot"
	"seedphrase"
);

//Response example:

{
  doublename: 'YOUR_USER_NAME.3bot',
  publicKey: '******',
  email: 'john.doe@email.com',
  phone: '+55',
  privateKey: '******'
}

```