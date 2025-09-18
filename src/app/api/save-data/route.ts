import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-northeast-2",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

export async function POST(req: NextRequest) {
    try {
        const { requestData, responseData, email } = await req.json();

        // Request 파일 저장
        const requestKey = `temp/user-data/${email}-request.json`;
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || "",
            Key: requestKey,
            Body: JSON.stringify(requestData, null, 2),
            ContentType: 'application/json'
        }));

        // Response 파일 저장
        const responseKey = `temp/user-data/${email}-response.json`;
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || "",
            Key: responseKey,
            Body: JSON.stringify(responseData, null, 2),
            ContentType: 'application/json'
        }));

        console.log(`Files saved to S3: ${requestKey}, ${responseKey}`);

        return NextResponse.json({
            success: true,
            message: `데이터가 S3에 ${email}-request.json, ${email}-response.json으로 저장되었습니다.`,
            requestKey: requestKey,
            responseKey: responseKey
        });

    } catch (error) {
        console.error("Error saving data to S3:", error);
        return NextResponse.json({
            success: false,
            error: "S3 파일 저장 중 오류가 발생했습니다."
        }, { status: 500 });
    }
}