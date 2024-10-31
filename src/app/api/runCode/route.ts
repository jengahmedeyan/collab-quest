import { NextResponse } from 'next/server';

interface CodeRequest {
    code: string;
}

export async function POST(request: Request) {
    const { code }: CodeRequest = await request.json();

    try {
        const result = new Function(code)();
        return NextResponse.json({ result });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
}
