import { NextResponse } from "next/server";

/**
 * GET /api/tipo-cambio
 * Devuelve el tipo de cambio USD → CRC desde la API oficial del
 * Ministerio de Hacienda de Costa Rica (datos del BCCR).
 * https://api.hacienda.go.cr/indicadores/tc/
 */
export async function GET() {
    try {
        const res = await fetch("https://api.hacienda.go.cr/indicadores/tc/", {
            next: { revalidate: 3600 }, // cache Next.js por 1 hora
        });
        if (!res.ok) throw new Error("Error fetching exchange rate");
        const data = await res.json();
        // La API devuelve { dolar: { venta: { valor: 520 }, compra: { valor: 515 } } }
        // Usamos el tipo de venta (lo que pagás al comprar dólares)
        const crc = data?.dolar?.venta?.valor as number | undefined;
        if (!crc) throw new Error("CRC rate not found");
        return NextResponse.json({ crc, updatedAt: new Date().toISOString() });
    } catch (err) {
        console.error("tipo-cambio error:", err);
        // Fallback si la API falla
        return NextResponse.json({ crc: 515, updatedAt: null, fallback: true });
    }
}
