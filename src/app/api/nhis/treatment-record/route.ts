import { NextRequest, NextResponse } from  "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const candiyResponse = await fetch("https://api.candiy.io/v1/nhis/treatment_record", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.CANDIY_API_KEY || "", // 환경 변수로 관리
            },
            body: JSON.stringify(body),
        });

        if (!candiyResponse.ok) {
            throw new Error(`Candiy API Error: ${candiyResponse.statusText}`);
        }

        const data = await candiyResponse.json();

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
