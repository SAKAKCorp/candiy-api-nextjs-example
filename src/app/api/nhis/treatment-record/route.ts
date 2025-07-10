import { NextRequest, NextResponse } from  "next/server";

export async function POST(req: NextRequest) {
    try {

        const CANDIY_API_URL= process.env.NEXT_PUBLIC_CANDIY_API_URL || "https://api.candiy.io/v1"
        const body = await req.json();

        const candiyResponse = await fetch( CANDIY_API_URL + "/nhis/treatment_record", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.NEXT_PUBLIC_CANDIY_API_KEY || "", // 환경 변수로 관리
            },
            body: JSON.stringify(body),
        });
        const data = await candiyResponse.json();

        // 500은 구조 자체가 달라지는 문제가 있음.
        if (candiyResponse.status === 500) {
            throw new Error(`Candiy API Error: ${candiyResponse.statusText}`);
        }

        //database 저장


        return NextResponse.json(data);
    } catch (error) {
        // error가 Error 객체인지 체크
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
        }
    }
}
