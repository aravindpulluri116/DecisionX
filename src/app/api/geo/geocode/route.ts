import { geocodeAddress } from "@/lib/services/geo/geo-service";
import { z } from "zod";

const geocodeSchema = z.object({
  location: z.string().min(1).max(500),
});

/** Fast Nominatim geocode — returns coords for map preview without Overpass POI fetch. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = geocodeSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const geo = await geocodeAddress(parsed.data.location);
    if (!geo) {
      return Response.json({ error: "Could not geocode location" }, { status: 404 });
    }

    return Response.json(geo);
  } catch {
    return Response.json({ error: "Geocode failed" }, { status: 500 });
  }
}
