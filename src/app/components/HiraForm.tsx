import { JSX } from "react";
import { FormDataType } from "../types/hira";

interface HiraFormProps {
    formData: FormDataType;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    renderInputField: (
        name: keyof FormDataType,
        type: string,
        placeholder: string,
        value: string
    ) => JSX.Element;
    renderSelectField: (
        name: keyof FormDataType, 
        value: string, 
        options: { key: string; value: string }[]
    ) => JSX.Element;
}

const HiraForm: React.FC<HiraFormProps> = ({
    formData,
    renderInputField,
    renderSelectField,
}) => {
    return (
        <div className="space-y-3 max-w-lg mx-auto">
            {renderSelectField("loginTypeLevel", formData.loginTypeLevel, [
                { key: "간편인증 선택", value: "" },
                { key: "카카오톡", value: "1" },
                { key: "페이코", value: "2" },
                { key: "삼성패스", value: "3" },
                { key: "국민은행(국민인증서)", value: "4" },
                { key: "통신사(PASS)", value: "5" },
                { key: "네이버", value: "6" },
                { key: "신한은행(신한인증서)", value: "7" },
                { key: "토스", value: "8" },
                { key: "뱅크샐러드", value: "9" },
                { key: "하나은행(하나인증서)", value: "10" },
                { key: "NH모바일인증서", value: "11" },
            ])}

            {renderInputField("id", "text", "사용자 ID", formData.id)}
            {renderInputField("legalName", "text", "이름", formData.legalName)}
            {renderInputField("birthdate", "text", "생년월일 (예: 19801212)", formData.birthdate)}
            {renderInputField("identity", "password", "주민번호 뒷자리", formData.identity)}
            {renderInputField("phoneNo", "text", "전화번호 (예: 01012345678)", formData.phoneNo)}

            {renderSelectField("telecom", formData.telecom, [
                { key: "통신사 선택", value: "" },
                { key: "SKT(SKT알뜰폰)", value: "0" },
                { key: "KT(KT알뜰폰)", value: "1" },
                { key: "LG U+(LG U+알뜰폰)", value: "2" },
            ])}
        </div>
    );
};

export default HiraForm;
