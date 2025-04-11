import { FormDataType, FormError } from "../types/hira";

export const validateField = (name: string, value: string, formData: FormDataType, setError: React.Dispatch<React.SetStateAction<FormError>>) => {
    let errorMsg: string | null = null;

    if (!value) {
        errorMsg = `${name} 필드는 필수 입력값입니다.`;
    } else if (name === "birthdate" && !/^\d{6}$/.test(value)) {
        errorMsg = "주민번호 앞자리는 YYMMDD 형식이어야 합니다.";
    } else if (name === "phoneNo" && !/^010\d{8}$/.test(value)) {
        errorMsg = "올바른 휴대폰 번호를 입력하세요.";
    }

    setError((prev) => ({ ...prev, [name]: errorMsg }));
};

export const validateForm = (formData: FormDataType, setError: React.Dispatch<React.SetStateAction<FormError>>) => {
    let valid = true;
    const newError: FormError = {};

    for (const key in formData) {
        let errorMsg: string | null = null;

        // 제외할 필드는 건너뛰기
        if (key === "birthdate" || key === "identity" || key === "smsAuthNo") {
            continue;
        }

        if (!formData[key as keyof FormDataType]) {
            switch (key) {
                case "loginTypeLevel":
                    if (String(formData.loginType) === "1" && !formData.loginTypeLevel) {
                        errorMsg = "간편인증 선택은 필수 입력값입니다.";
                    }
                    break;
                case "telecom":
                    errorMsg = "통신사는 필수 입력값입니다.";
                    break;
                case "id":
                    errorMsg = "사용자 ID는 필수 입력값입니다.";
                    break;
                case "legalName":
                    errorMsg = "이름은 필수 입력값입니다.";
                    break;
                case "identity1":
                    errorMsg = "주민등록번호 앞자리는 필수 입력값입니다.";
                    break;
                case "identity2":
                    errorMsg = "주민등록번호 앞자리는 필수 입력값입니다.";
                    break;
                case "phoneNo":
                    errorMsg = "전화번호는 필수 입력값입니다.";
                    break;
                default:
                    errorMsg = `${key} 필드는 필수 입력값입니다.`;
            }

            if (errorMsg) {
                newError[key] = errorMsg;
                valid = false;
            }
        }
    }
    console.log("newError", newError);
    console.log(formData)
    setError(newError);
    return valid;
};
