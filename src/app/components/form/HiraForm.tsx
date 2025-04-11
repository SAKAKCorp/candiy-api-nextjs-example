import { JSX } from "react";
import React, { useState, useEffect } from "react";
import { FormDataType } from "../../types/hira";
import BaseForm from "./BaseForm";

interface HiraFormProps {
    formData: FormDataType;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
    renderInputField: (
        name: keyof FormDataType,
        type: string,
        placeholder: string,
        value: string
    ) => JSX.Element;
    renderLoginTypeLevelField: (
        name: keyof FormDataType,
        value: string,
        options: { key: string; value: string }[]
    ) => JSX.Element;
    renderTelecomSelectField: (
        name: keyof FormDataType,
        value: string,
        options: { key: string; value: string }[]
    ) => JSX.Element;
    showLoginTypeLevel?: boolean;
}

const HiraForm: React.FC<HiraFormProps> = ({
                                               formData,
                                               setFormData,
                                               renderInputField,
                                               renderLoginTypeLevelField,
                                               renderTelecomSelectField,
                                           }) => {
    const [showLoginTypeLevel, setShowLoginTypeLevel] = useState(formData.loginType === "1");

    useEffect(() => {
        setShowLoginTypeLevel(formData.loginType === "1");
    }, [formData.loginType]);

    const handleLoginTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // 부모 상태 업데이트
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // 로컬 상태 업데이트
        setShowLoginTypeLevel(value === "1");
    };

    const renderRadioField = (): JSX.Element => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">인증 방법 선택</label>
            <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="loginType"
                        value="1"
                        checked={formData.loginType === "1"}
                        onChange={handleLoginTypeChange}
                    />
                    <span className="text-white">간편인증</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="loginType"
                        value="2"
                        checked={formData.loginType === "2"}
                        onChange={handleLoginTypeChange}
                    />
                    <span className="text-white">휴대폰 문자 인증</span>
                </label>
            </div>
        </div>
    );

    const additionalFields = (
        <div className="mb-4 flex gap-4">
            <div className="flex-1">
                {renderInputField("identity1", "text", "주민번호 앞자리", formData.identity1)}
            </div>
            <div className="flex-1">
                {renderInputField("identity2", "password", "주민번호 뒷자리", formData.identity2)}
            </div>
        </div>
    );

    return (
        <BaseForm<FormDataType>
            formData={formData}
            renderRadioField={renderRadioField()}
            renderInputField={renderInputField}
            {...(showLoginTypeLevel && {
                renderLoginTypeLevelField: renderLoginTypeLevelField,
            })}
            renderTelecomSelectField={renderTelecomSelectField}
            additionalFields={additionalFields}
            showLoginTypeLevel={showLoginTypeLevel}
        />
    );
};

export default HiraForm;
