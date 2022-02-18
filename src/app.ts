import { ThreefoldErrorException } from "./core/threefold-error-exception";
import { ThreefoldLogin } from "./core/threefold-login";
import { ThreefoldUtils } from "./core/threefold-utils";
import { CryptoService } from "./crypto/crypto.service";

// export {
// 	ThreefoldLogin,
// 	CryptoService,
//	ThreefoldErrorException,
// };

async function init() {
	console.log("init!");
	var threefoldLogin = new ThreefoldLogin(
		"https://login.threefold.me/api",
		"https://pkid.jimber.org/v1",
		{
			showWarnings : true, //default: false
		}
	);

	try {
	
		var register = await threefoldLogin.register(
			"claudiolivthreefold", //username without ".3bot"
			"claudio@devmagic.com.br",
			"",
			//"execute fetch develop endorse away solid verb action tortoise judge wrap kiwi custom rapid husband advance cloud inflict toddler alien install scatter swift gauge"
		);

		console.log("register", register);

	}catch(error : any) {
		if (error as ThreefoldErrorException) {
			console.log("error message", error.message);
		}
	}
}
init();