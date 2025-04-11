"use client";
import { useState } from "react";
import { FormDataType, MultiFactorInfo, FormError } from "@/app/types/nhis";
import Button from "@/app/components/Button";
import NhisForm from "@/app/components/form/NhisForm";
import { validateField, validateForm } from "@/app/utils/nhis-validation";

export default function NhisPage() {
    const [formData, setFormData] = useState<FormDataType>({
        id: "unique_user_id",
        loginTypeLevel: "",
        legalName: "",
        birthdate: "",
        phoneNo: "",
        telecom: "",
    });

    const [multiFactorInfo, setMultiFactorInfo] = useState<MultiFactorInfo | null>(null);
    const [responseData, setResponseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<FormError>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        validateField(name, value, formData, setError);
    };

    const sendInitialRequest = async () => {
        if (error.id || !validateForm(formData, setError)) return;
        setLoading(true);
        try {
            const response = await fetch("/api/nhis/treatment-record", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const responseObject = await response.json();
            if (response.status === 500) throw new Error(`Server error occurred, please try again later. \nstatus: ${response.status}, message: ${responseObject?.message || "Unknown error"}`);
            if (responseObject.status !== 'success') throw new Error(`Client errror occurred, message: ${responseObject?.message || "Unknown error"}`);

            const data = responseObject.data;

            setMultiFactorInfo({
                transactionId: data.transactionId,
                jobIndex: data.jobIndex,
                threadIndex: data.threadIndex,
                multiFactorTimestamp: data.multiFactorTimestamp,
            });
        } catch (err) {
            setError({ id: `${(err as Error).message}` });
        } finally {
            setLoading(false);
        }
    };

    const sendVerificationRequest = async () => {
        if (!multiFactorInfo) {
            setError({ id: "먼저 인증 요청을 진행해주세요." });
            return;
        }

        const finalRequestBody = {
            ...formData,
            isContinue: "1",
            multiFactorInfo,
        };

        try {
            const response = await fetch("/api/nhis/treatment-record", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalRequestBody),
            });

            const responseObject = await response.json();
            if (response.status === 500) throw new Error(`Server error occurred, please try again later. \nstatus: ${response.status}, message: ${responseObject?.message || "Unknown error"}`);
            if (responseObject.status !== 'success') throw new Error(`Client errror occurred, message: ${responseObject?.message || "Unknown error"}`);

            setResponseData(responseObject);
        } catch (err) {
            setError({ id: `${(err as Error).message}` });
        }
    };


    const renderErrorMessages = () => {
        return Object.keys(error).map((key) => {
            const errorMessage = error[key as keyof FormError];
            return errorMessage ? (
                <p key={key} className="text-red-500">{errorMessage}</p>
            ) : null;
        });
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-center">Candiy API 예제 - 진료 및 투약정보</h1>
            <div className="space-y-3 max-w-lg mx-auto">
                <NhisForm
                    formData={formData}
                    handleChange={handleChange}
                    renderInputField={(name, type, placeholder, value) => (
                        <input
                            type={type}
                            name={name}
                            value={value}
                            onChange={handleChange}
                            placeholder={placeholder}
                            className="w-full p-2 border rounded"
                        />
                    )}
                    renderLoginTypeLevelField={(name, value, options) => (
                        <select
                            name={name}
                            value={value}
                            onChange={handleChange}
                            className="w-full h-10 border rounded"
                        >
                            {options.map((option, index) => (
                                <option key={index} value={option.value}>
                                    {option.key}
                                </option>
                            ))}
                        </select>
                    )}
                    renderTelecomSelectField={
                        (name, value, options) => (
                            <select
                                name={name}
                                value={value}
                                onChange={handleChange}
                                className="w-full h-10 border rounded"
                            >
                                {options.map((option, index) => (
                                    <option key={index} value={option.value}>
                                        {option.key}
                                    </option>
                                ))}
                            </select>
                        )
                    }
                />

                {!multiFactorInfo && (
                    <Button onClick={sendInitialRequest} label="인증 요청" disabled={loading} />
                )}

                {multiFactorInfo && (
                    <>
                        <div className="text-center">
                            <p>인증 요청이 완료되었습니다. <br/>휴대전화에서 인증을 완료한 후 인증 확인을 클릭해주세요.</p>
                        </div>
                        <Button
                            onClick={sendVerificationRequest}
                            label="인증 확인"
                            disabled={loading}
                        />
                    </>
                )}
            </div>

            <div className="max-w-lg mx-auto">
                {loading && <p>로딩 중...</p>}
                {renderErrorMessages()}  {/* 에러 메시지를 출력 */}
            </div>

            {responseData && (
                <pre className="bg-gray-100 p-4 mt-4 rounded-md text-gray-500">
                    {JSON.stringify(responseData, null, 2)}
                </pre>
            )}
        </div>
    );
}
