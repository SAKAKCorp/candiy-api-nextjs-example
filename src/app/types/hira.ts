export interface FormDataType {
    id: string;
    loginType: string;
    loginTypeLevel?: string;
    legalName: string;
    identity1: string;
    identity2: string;
    phoneNo: string;
    telecom: string;
    identity?: string;
    smsAuthNo?: "",
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