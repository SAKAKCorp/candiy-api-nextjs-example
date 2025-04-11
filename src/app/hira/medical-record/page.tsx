"use client";
import { useState } from "react";
import { FormDataType, MultiFactorInfo, FormError } from "@/app/types/hira";
import Button from "@/app/components/Button";
import HiraForm from "@/app/components/form/HiraForm";
import { validateField, validateForm } from "@/app/utils/hira-validation";

export default function NhisPage() {
    const [formData, setFormData] = useState<FormDataType>({
        id: "unique_user_id",
        loginType: "2",
        loginTypeLevel: "1",
        legalName: "",
        identity1: "",
        identity2: "",
        phoneNo: "",
        telecom: "",
        identity: "",
        smsAuthNo: ""
    });

    const [multiFactorInfo, setMultiFactorInfo] = useState<MultiFactorInfo | null>(null);
    const [responseData, setResponseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<FormError>({});
    const [timer, setTimer] = useState(180); // 3분
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    const startTimer = () => {
        if (intervalId) clearInterval(intervalId);

        const id = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(id);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        setIntervalId(id);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        validateField(name, value, formData, setError);
    };

    const sendInitialRequest = async () => {
        if (error.id || !validateForm(formData, setError)) return;
        setLoading(true);
        try {
            const response = await fetch("/api/hira/medical-record", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const responseObject = await response.json();
            console.log("responseObject: ", responseObject);
            if (response.status === 500) throw new Error(`Server error occurred, please try again later. \nstatus: ${response.status}, message: ${responseObject?.message || "Unknown error"}`);
            if (responseObject.status !== 'success') throw new Error(`Client errror occurred, message: ${responseObject?.message || "Unknown error"}`);

            const data = responseObject.data;
            setMultiFactorInfo({
                transactionId: data.transactionId,
                jobIndex: data.jobIndex,
                threadIndex: data.threadIndex,
                multiFactorTimestamp: data.multiFactorTimestamp,
            });

            setTimer(180); // reset timer
            startTimer();  // start

        } catch (err) {
            setError({ id: `Failed to fetch data: ${(err as Error).message}` });
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const min = String(Math.floor(seconds / 60)).padStart(2, '0');
        const sec = String(seconds % 60).padStart(2, '0');
        return `${min}:${sec}`;
    };

    const sendVerificationRequest = async () => {
        let finalRequestBody = {};
        // 간편인증
        if (formData.loginType === "2") {

            if (!formData.smsAuthNo) {
                setError({ smsAuthNo: "인증번호를 입력해주세요." });
                return;
            }

            finalRequestBody = {
                ...formData,
                isContinue: "1",
                smsAuthNo: formData.smsAuthNo
            };
        }else {

            if (!multiFactorInfo) {
                setError({id: "먼저 인증 요청을 진행해주세요."});
                return;
            }

            finalRequestBody = {
                ...formData,
                isContinue: "1",
                multiFactorInfo,
            };
        }
        try {
            const response = await fetch("/api/hira/medical-record", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalRequestBody),
            });

            const responseObject = await response.json();
            if (response.status === 500) throw new Error(`Server error occurred, please try again later. \nstatus: ${response.status}, message: ${responseObject?.message || "Unknown error"}`);
            if (responseObject.status !== 'success') throw new Error(`Client errror occurred, message: ${responseObject?.message || "Unknown error"}`);

            setResponseData(responseObject);
        } catch (err) {
            setError({ id: err instanceof Error ? err.message : "알 수 없는 오류 발생" });
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
            <h1 className="text-2xl font-bold mb-4 text-center">Candiy API 예제  - 내 진료 정보 열람</h1>
            <div className="space-y-3 max-w-lg mx-auto">
                <HiraForm
                    formData={formData}
                    handleChange={handleChange}
                    setFormData={setFormData}
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
                        {(formData.loginType === "1") && (
                            <div className="text-center">
                                <p>인증 요청이 완료되었습니다. <br/>휴대전화에서 인증을 완료한 후 인증 확인을 클릭해주세요.</p>
                            </div>
                        )}
                        {(formData.loginType === "2") && (
                            <>
                                <div className="text-center">
                                    <p >인증 요청이 완료되었습니다. <br/> 휴대전화 문자메세지로 온 인증번호를 입력해주세요.</p>
                                </div>
                                <form
                                    name="sms"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        sendVerificationRequest();
                                    }}
                                >
                                    <div className="mb-4 flex items-center gap-4">
                                        <input
                                            type="text"
                                            name="smsAuthNo"
                                            value={formData.smsAuthNo}
                                            onChange={handleChange}
                                            placeholder="인증번호"
                                            className="w-full p-2 border rounded"
                                        />
                                        <div className="text-sm text-gray-700 w-20 text-center">
                                            {timer > 0 ? (
                                                <span className="text-red-500 font-bold">{formatTime(timer)}</span>
                                            ) : (
                                                <span className="text-red-500">시간 초과</span>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </>
                        )}
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
