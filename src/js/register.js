import { register, sendRegisterAuthCode } from "./api";
import {
	addEvent,
	validateUserName,
	validatePwd,
	validateEmail,
	userNameTips,
	passWordTips,
	message,
} from "./utils/index";
import "../scss/register.scss";

const form = document.querySelector("#form");

const userNameDom = document.querySelector("input[name=userName]");
const emailDom = document.querySelector("input[name=email]");
const authCodeDom = document.querySelector("input[name=authCode]");
const inviteCodeDom = document.querySelector("input[name=inviteCode]");
const passWordDom = document.querySelector("input[name=passWord]");
const rePasswordDom = document.querySelector("input[name=rePassword]");
const nickNameDom = document.querySelector("input[name=nickName]");

const getAuthCodeBtn = document.querySelector("#get_auth_code");
addEvent(form, "submit", (evt) => {
	evt.preventDefault();
	let userName = userNameDom.value;
	let email = emailDom.value;
	let authCode = authCodeDom.value;
	let inviteCode = inviteCodeDom.value;
	let passWord = passWordDom.value;
	let rePassword = rePasswordDom.value;
	let nickName = nickNameDom.value;

	if (!authCode) return message("请输入验证码", "info");
	if (!inviteCode) return message("请输入邀请码", "info");
	if (rePassword !== passWord)
		return message("两次输入的密码不一致，请重新输入", "info");
	if (!validateUserName(userName)) return message(userNameTips, "info");
	if (!validatePwd(passWord)) return message(passWordTips, "info");

	register({
		userName,
		passWord,
		authCode,
		email,
		inviteCode,
		nickName,
	})
		.then((res) => {
			if (res.status) {
				form.reset();
			}
		})
		.catch((e) => {});
});

let coolTime = 60;
function refreshCoolTime() {
	getAuthCodeBtn.innerHTML = coolTime + `s后再次获取`;
	coolTime--;
	if (coolTime >= 0) {
		setTimeout(refreshCoolTime, 1000);
	} else {
		getAuthCodeBtn.innerHTML = "获取验证码";
		requesting = false;
	}
}

let requesting = false;
addEvent(getAuthCodeBtn, "click", (evt) => {
	evt.preventDefault();
	if (requesting || coolTime < 60) return;
	let email = emailDom.value;
	if (!email) return message("请输入绑定邮箱", "info");
	if (!validateEmail(email)) return message("邮箱格式不正确", "info");
	requesting = true;
	sendRegisterAuthCode(email)
		.then((res) => {
			coolTime = 60;
			refreshCoolTime();
		})
		.catch((e) => {});
});
