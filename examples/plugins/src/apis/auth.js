import axios from "axios";

let casesServiceUrl = "http://localhost:8000/apps/cases/api/v2/"

export function getLoginCode(phoneNumber) {
    const data = new FormData();
    data.append("phone_number", phoneNumber);
    return axios.post(
        casesServiceUrl + "identify/phone-number.json",
        data
    );
}

export function getAuthToken(userId, emailCode) {
    const data = new FormData();
    data.append("user_id", userId);
    data.append("email_code", emailCode);
    return axios.post(casesServiceUrl + "login.json", data);
}
