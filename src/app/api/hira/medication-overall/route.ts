import { NextRequest, NextResponse } from  "next/server";

export async function POST(req: NextRequest) {

    function getDateYearsAgo(yearsAgo = 5) {
        const date = new Date();
        date.setFullYear(date.getFullYear() - yearsAgo);
        date.setDate(date.getDate() +1);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
    try {
        const body = await req.json();
        const modifiedBody = {
            ...body,
            identity: `${body.identity1}${body.identity2}`,
            startDate: getDateYearsAgo(5)
        };

        const candiyResponse = await fetch("https://1api.candiy.io/v1/hira/medication_overall", {
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
