"use client";
import { useState } from "react";
import { FormDataType, MultiFactorInfo } from "@/app/types/nhis";

export default function NhisPage() {
    const [formData, setFormData] = useState<FormDataType>({
        id: "",
        loginTypeLevel: "1",
        legalName: "",
        birthdate: "",
        phoneNo: "",
        telecom: "0",
        startDate: "2015",
        endDate: "2025",
    });

    const [multiFactorInfo, setMultiFactorInfo] = useState<MultiFactorInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
    const [isConsentChecked, setIsConsentChecked] = useState(false);
    const [showConsentPopup, setShowConsentPopup] = useState(false);

    const validateField = (name: string, value: string) => {
        const errors = { ...validationErrors };

        switch (name) {
            case 'id':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) {
                    errors.id = '이메일을 입력해주세요.';
                } else if (!emailRegex.test(value)) {
                    errors.id = '올바른 이메일 형식이 아닙니다.';
                } else {
                    delete errors.id;
                }
                break;

            case 'legalName':
                const nameRegex = /^[가-힣]{2,10}$/;
                if (!value) {
                    errors.legalName = '이름을 입력해주세요.';
                } else if (!nameRegex.test(value)) {
                    errors.legalName = '2-10자의 한글 이름을 입력해주세요.';
                } else {
                    delete errors.legalName;
                }
                break;

            case 'phoneNo':
                const phoneRegex = /^010\d{8}$/;
                if (!value) {
                    errors.phoneNo = '전화번호를 입력해주세요.';
                } else if (!phoneRegex.test(value)) {
                    errors.phoneNo = '010으로 시작하는 11자리 숫자를 입력해주세요.';
                } else {
                    delete errors.phoneNo;
                }
                break;

            case 'birthdate':
                const birthdateRegex = /^\d{8}$/;
                if (!value) {
                    errors.birthdate = '생년월일을 입력해주세요.';
                } else if (!birthdateRegex.test(value)) {
                    errors.birthdate = '8자리 숫자로 입력해주세요. (예: 19801212)';
                } else {
                    // 날짜 유효성 검증
                    const year = parseInt(value.substr(0, 4));
                    const month = parseInt(value.substr(4, 2));
                    const day = parseInt(value.substr(6, 2));
                    const currentYear = new Date().getFullYear();

                    if (year < 1900 || year > currentYear) {
                        errors.birthdate = '올바른 연도를 입력해주세요.';
                    } else if (month < 1 || month > 12) {
                        errors.birthdate = '올바른 월을 입력해주세요.';
                    } else if (day < 1 || day > 31) {
                        errors.birthdate = '올바른 일을 입력해주세요.';
                    } else {
                        delete errors.birthdate;
                    }
                }
                break;
        }

        setValidationErrors(errors);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const sendInitialRequest = async () => {
        // 모든 필드 검증
        validateField('id', formData.id);
        validateField('legalName', formData.legalName);
        validateField('phoneNo', formData.phoneNo);
        validateField('birthdate', formData.birthdate);

        // 검증 에러가 있으면 중단
        if (Object.keys(validationErrors).length > 0 ||
            !formData.id || !formData.legalName || !formData.phoneNo || !formData.birthdate) {
            setErrorMessage('모든 필드를 올바르게 입력해주세요.');
            setShowErrorPopup(true);
            return;
        }

        // 동의 체크 확인
        if (!isConsentChecked) {
            setErrorMessage('개인정보 수집·이용에 동의해주세요.');
            setShowErrorPopup(true);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/nhis/checkup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const responseObject = await response.json();
            if (response.status === 500) throw new Error(`Server error occurred, please try again later. \nstatus: ${response.status}, message: ${responseObject?.message || "Unknown error"}`);
            if (responseObject.status !== 'success') {
              if (responseObject.code === 'SE-001') {
                throw new Error("입력 정보를 다시 한번 확인해주세요.")
              } else {
                  throw new Error(`${responseObject?.message || "Unknown error"}`);
              }
            }
            const data = responseObject.data;

            setMultiFactorInfo({
                transactionId: data.transactionId,
                jobIndex: data.jobIndex,
                threadIndex: data.threadIndex,
                multiFactorTimestamp: data.multiFactorTimestamp,
            });
        } catch (err) {
          console.log(err);
            setErrorMessage(`${(err as Error).message}`);
            setShowErrorPopup(true);
        } finally {
            setLoading(false);
        }
    };

    const sendVerificationRequest = async () => {
        if (!multiFactorInfo) {
            setErrorMessage("먼저 인증 요청을 진행해주세요.");
            setShowErrorPopup(true);
            return;
        }

        const finalRequestBody = {
            ...formData,
            isContinue: "1",
            multiFactorInfo,
        };

        setLoading(true);

        try {
            const response = await fetch("/api/nhis/checkup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalRequestBody),
            });

            const responseObject = await response.json();
            if (response.status === 500) throw new Error(`Server error occurred, please try again later. \nstatus: ${response.status}, message: ${responseObject?.message || "Unknown error"}`);
            if (responseObject.status !== 'success') {
              throw new Error(`${responseObject?.message || "Unknown error"}`);
            }

            // 성공 시 데이터를 파일로 저장
            const saveResponse = await fetch("/api/save-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestData: finalRequestBody,
                    responseData: responseObject,
                    email: formData.id
                })
            });

            const saveResult = await saveResponse.json();

            if (saveResult.success) {
                setSuccessMessage(`데이터가 성공적으로 수집되었습니다!\n참여해주셔서 감사합니다.`);
                setShowSuccessPopup(true);

                // 폼 리셋
                setFormData({
                    id: "",
                    loginTypeLevel: "1",
                    legalName: "",
                    birthdate: "",
                    phoneNo: "",
                    telecom: "0",
                    startDate: "2015",
                    endDate: "2025",
                });
                setMultiFactorInfo(null);
            } else {
                throw new Error("파일 저장에 실패했습니다.");
            }
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "알 수 없는 오류 발생");
            setShowErrorPopup(true);
        } finally {
            setLoading(false);
        }
    };


    const closeErrorPopup = () => {
        setShowErrorPopup(false);
        setErrorMessage("");
    };

    const closeSuccessPopup = () => {
        setShowSuccessPopup(false);
        setSuccessMessage("");
    };

    const openConsentPopup = () => {
        setShowConsentPopup(true);
    };

    const closeConsentPopup = () => {
        setShowConsentPopup(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* 메인 카드 */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* 헤더 */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                        <h1 className="text-2xl font-bold text-white text-center">DB생명 참여</h1>
                        <p className="text-blue-100 text-center mt-2 text-sm">건강검진 정보 수집</p>
                    </div>

                    {/* 폼 영역 */}
                    <div className="px-8 py-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                                <input
                                    type="email"
                                    name="id"
                                    value={formData.id}
                                    onChange={handleChange}
                                    placeholder="이메일을 입력하세요"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 outline-none text-black ${
                                        validationErrors.id
                                            ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                            : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                />
                                {validationErrors.id && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                                <input
                                    type="text"
                                    name="legalName"
                                    value={formData.legalName}
                                    onChange={handleChange}
                                    placeholder="실명을 입력하세요"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 outline-none text-black ${
                                        validationErrors.legalName
                                            ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                            : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                />
                                {validationErrors.legalName && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.legalName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                                <input
                                    type="tel"
                                    name="phoneNo"
                                    value={formData.phoneNo}
                                    onChange={handleChange}
                                    placeholder="01012345678"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 outline-none text-black ${
                                        validationErrors.phoneNo
                                            ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                            : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                />
                                {validationErrors.phoneNo && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.phoneNo}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">생년월일</label>
                                <input
                                    type="text"
                                    name="birthdate"
                                    value={formData.birthdate}
                                    onChange={handleChange}
                                    placeholder="19801212"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 outline-none text-black ${
                                        validationErrors.birthdate
                                            ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                            : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                />
                                {validationErrors.birthdate && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.birthdate}</p>
                                )}
                            </div>

                            {/* 인증 방법 표시 */}
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-blue-700">카카오톡 간편인증</span>
                                </div>
                            </div>

                            {/* 동의 체크박스 */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        id="consent"
                                        checked={isConsentChecked}
                                        onChange={(e) => setIsConsentChecked(e.target.checked)}
                                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <div className="flex-1">
                                        <label htmlFor="consent" className="text-sm text-gray-700">
                                            <span className="font-medium">개인정보 수집·이용</span>에 동의합니다.
                                        </label>
                                        <button
                                            type="button"
                                            onClick={openConsentPopup}
                                            className="block text-xs text-blue-600 hover:text-blue-800 mt-1 underline"
                                        >
                                            전문보기
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 버튼 영역 */}
                            {!multiFactorInfo && (
                                <button
                                    onClick={sendInitialRequest}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>처리중...</span>
                                        </div>
                                    ) : (
                                        '인증 요청'
                                    )}
                                </button>
                            )}

                            {multiFactorInfo && (
                                <>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="font-medium text-green-700">인증 요청 완료</span>
                                        </div>
                                        <p className="text-sm text-green-600">
                                            휴대전화에서 카카오톡 인증을 완료한 후<br/>
                                            아래 버튼을 클릭해주세요.
                                        </p>
                                    </div>
                                    <button
                                        onClick={sendVerificationRequest}
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>인증 확인중...</span>
                                            </div>
                                        ) : (
                                            '인증 확인'
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 에러 팝업 */}
            {showErrorPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-red-500 px-6 py-4">
                            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span>오류 발생</span>
                            </h2>
                        </div>
                        <div className="px-6 py-4">
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{errorMessage}</p>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end">
                            <button
                                onClick={closeErrorPopup}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-medium"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 성공 팝업 */}
            {showSuccessPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-green-500 px-6 py-4">
                            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>수집 완료</span>
                            </h2>
                        </div>
                        <div className="px-6 py-4">
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{successMessage}</p>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end">
                            <button
                                onClick={closeSuccessPopup}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 font-medium"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 동의서 팝업 */}
            {showConsentPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
                        <div className="bg-blue-600 px-6 py-4">
                            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                                </svg>
                                <span>개인정보 수집·이용 동의서</span>
                            </h2>
                        </div>
                        <div className="px-6 py-4 overflow-y-auto max-h-96">
                            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">1. 개인정보의 수집 및 이용 목적</h3>
                                    <p>DB생명 헬스코디네이터 데모서비스 제공을 위해 개인정보를 수집·이용합니다.</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">2. 수집하는 개인정보의 항목</h3>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>이메일 주소</li>
                                        <li>성명</li>
                                        <li>생년월일</li>
                                        <li>휴대전화번호</li>
                                        <li>건강검진 관련 정보</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">3. 개인정보의 보유 및 이용기간</h3>
                                    <p>수집된 개인정보는 DB생명 헬스코디네이터 데모서비스를 위해서만 사용되며, 서비스 종료 후 안전하게 폐기됩니다.</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">4. 개인정보 제3자 제공</h3>
                                    <p>수집된 개인정보는 제3자에게 제공되지 않습니다.</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">5. 동의를 거부할 권리</h3>
                                    <p>개인정보 수집·이용에 대한 동의를 거부할 수 있으나, 동의를 거부하시는 경우 해당 서비스를 이용할 수 없습니다.</p>
                                </div>

                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <p className="text-blue-800 font-medium text-center">
                                        위 내용에 동의하시면 체크박스를 선택해주세요.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                            <button
                                onClick={closeConsentPopup}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 transition-all duration-200 font-medium"
                            >
                                닫기
                            </button>
                            <button
                                onClick={() => {
                                    setIsConsentChecked(true);
                                    closeConsentPopup();
                                }}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-medium"
                            >
                                동의하고 닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
