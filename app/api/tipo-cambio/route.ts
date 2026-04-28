import { NextResponse } from "next/server";

/**
 * GET /api/tipo-cambio
 * Devuelve el tipo de cambio USD → CRC desde open.er-api.com (gratis, sin key).
 * Se hace server-side para evitar CORS y para poder cachear en el futuro.
 */
export async function GET() {
    try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD", {
            next: { revalidate: 3600 }, // cache Next.js por 1 hora
        });
        if (!res.ok) throw new Error("Error fetching exchange rate");
        const data = await res.json();
        const crc = data?.rates?.CRC as number | undefined;
        if (!crc) throw new Error("CRC rate not found");
        return NextResponse.json({ crc, updatedAt: data.time_last_update_utc ?? new Date().toISOString() });
    } catch (err) {
        console.error("tipo-cambio error:", err);
        // Fallback conservador si la API falla
        return NextResponse.json({ crc: 515, updatedAt: null, fallback: true });
    }
}
