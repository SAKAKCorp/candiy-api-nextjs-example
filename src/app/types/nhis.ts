export interface FormDataType {
    id: string;
    loginType?: string;
    loginTypeLevel: string;
    legalName: string;
    birthdate: string;
    phoneNo: string;
    telecom: string;
    startDate: string;
    endDate: string;
}

export interface MultiFactorInfo {
    transactionId: string;
    jobIndex: number;
    threadIndex: number;
    multiFactorTimestamp: number;
}

export interface FormError {
    [key: string]: string | null;
}