import { NextResponse } from "next/server";

type PlacesTextSearchResponse = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    websiteUri?: string;
    nationalPhoneNumber?: string;
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    types?: string[];
  }>;
};

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "A integração com o Google ainda não está configurada no servidor." },
      { status: 500 }
    );
  }

  let body: { city?: string; state?: string; segment?: string; status?: string; pageToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Não foi possível ler os filtros da pesquisa." }, { status: 400 });
  }

  const city = String(body.city ?? "").trim().slice(0, 100);
  const state = String(body.state ?? "").trim().slice(0, 2).toUpperCase();
  const segment = String(body.segment ?? "").trim().slice(0, 100);
  const status = String(body.status ?? "todos");
  const pageToken = typeof body.pageToken === "string" ? body.pageToken.slice(0, 1000) : "";

  if (!city || !state || !segment) {
    return NextResponse.json({ error: "Informe cidade, estado e segmento." }, { status: 400 });
  }

  const query = `${segment} em ${city}, ${state}, Brasil`;

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.googleMapsUri,places.types",
      },
      body: JSON.stringify({
        textQuery: query,
        pageSize: 20,
        ...(pageToken ? { pageToken } : {}),
        languageCode: "pt-BR",
        regionCode: "BR",
      }),
      cache: "no-store",
    });

    const data = (await response.json()) as PlacesTextSearchResponse & { error?: { message?: string } };

    if (!response.ok) {
      console.error("Google Places API error:", data.error?.message ?? response.status);
      return NextResponse.json(
        { error: "O Google não conseguiu concluir a pesquisa. Verifique se a Places API e o faturamento estão ativos no Google Cloud." },
        { status: response.status === 400 ? 400 : 502 }
      );
    }

    const places = (data.places ?? []).map((place) => ({
      id: place.id ?? "",
      name: place.displayName?.text ?? "Empresa sem nome informado",
      address: place.formattedAddress ?? "Endereço não informado",
      website: place.websiteUri ?? null,
      phone: place.nationalPhoneNumber ?? null,
      rating: place.rating ?? null,
      reviews: place.userRatingCount ?? 0,
      mapsUrl: place.googleMapsUri ?? null,
      types: place.types ?? [],
      googleProfileFound: true,
      websiteListed: Boolean(place.websiteUri),
      menuOnlineStatus: "nao_verificado",
      ecommerceStatus: "nao_verificado",
      inventorySystemStatus: "nao_verificado",
      crmStatus: "nao_verificado",
      financialSystemStatus: "nao_verificado",
    }));

    const filtered = places.filter((place) => {
      if (status === "sem-site") return !place.website;
      if (status === "com-site") return Boolean(place.website);
      return true;
    });

    return NextResponse.json({
      results: filtered,
      totalFound: places.length,
      totalShown: filtered.length,
      nextPageToken: (data as PlacesTextSearchResponse & { nextPageToken?: string }).nextPageToken ?? null,
      query,
      source: "Google Places",
      note: "A busca localiza perfis públicos. Cardápio, e-commerce e sistemas internos não são confirmados por esta consulta."
    });
  } catch (error) {
    console.error("Places search failed:", error);
    return NextResponse.json(
      { error: "Não foi possível conectar ao Google agora. Tente novamente em instantes." },
      { status: 502 }
    );
  }
}
