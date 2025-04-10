import { NextRequest, NextResponse } from  "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // FIXME: birthdate에 '19' 접두사 추가
        const modifiedBody = {
            ...body,
            birthdate: `19${body.birthdate}`
        };

        const candiyResponse = await fetch("https://api.candiy.io/v1/hira/medical_record", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.CANDIY_API_KEY || "", // 환경 변수로 관리
            },
            body: JSON.stringify(modifiedBody),
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
