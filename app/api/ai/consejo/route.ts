import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                max_tokens: 1024,
                messages: [{ role: "user", content: prompt }],
            }),
        });

        const data = await res.json();
        const text = data.choices?.[0]?.message?.content ?? "No se pudo obtener consejo.";
        return NextResponse.json({ text });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}