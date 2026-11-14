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

  let body: { city?: string; state?: string; segment?: string; status?: string; pageToken?: string; demoMode?: boolean };
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

  if (body.demoMode === true) {
    const samples = [
      { id: "demo-cafe-horizonte", name: "[DEMO] Café Horizonte", address: "Rua das Acácias, 120, Centro, Juiz de Fora/MG", website: "https://cafe-horizonte.exemplo.invalid", phone: "(32) 99000-1001", rating: 4.6, reviews: 87, types: ["cafe"], menuOnlineStatus: "nao_identificado", ecommerceStatus: "nao_identificado", inventorySystemStatus: "nao_verificado", crmStatus: "nao_verificado", financialSystemStatus: "nao_verificado" },
      { id: "demo-pet-amigo", name: "[DEMO] Pet Amigo", address: "Av. Brasil, 450, Juiz de Fora/MG", website: null, phone: "(32) 99000-1002", rating: 4.8, reviews: 132, types: ["pet_store"], menuOnlineStatus: "nao_se_aplica", ecommerceStatus: "nao_identificado", inventorySystemStatus: "nao_verificado", crmStatus: "nao_verificado", financialSystemStatus: "nao_verificado" },
      { id: "demo-studio-bella", name: "[DEMO] Studio Bella", address: "Rua Halfeld, 80, Juiz de Fora/MG", website: "https://studio-bella.exemplo.invalid", phone: "(32) 99000-1003", rating: 4.9, reviews: 56, types: ["beauty_salon"], menuOnlineStatus: "nao_se_aplica", ecommerceStatus: "nao_se_aplica", inventorySystemStatus: "nao_verificado", crmStatus: "nao_verificado", financialSystemStatus: "nao_verificado" },
      { id: "demo-mercado-bom-preco", name: "[DEMO] Mercado Bom Preço", address: "Rua Rio Branco, 900, Juiz de Fora/MG", website: "https://mercado-bom-preco.exemplo.invalid", phone: "(32) 99000-1004", rating: 4.3, reviews: 211, types: ["grocery_store"], menuOnlineStatus: "nao_se_aplica", ecommerceStatus: "nao_identificado", inventorySystemStatus: "nao_verificado", crmStatus: "nao_verificado", financialSystemStatus: "nao_verificado" },
      { id: "demo-oficina-central", name: "[DEMO] Oficina Central", address: "Av. dos Andradas, 210, Juiz de Fora/MG", website: null, phone: "(32) 99000-1005", rating: 4.5, reviews: 74, types: ["car_repair"], menuOnlineStatus: "nao_se_aplica", ecommerceStatus: "nao_se_aplica", inventorySystemStatus: "nao_verificado", crmStatus: "nao_verificado", financialSystemStatus: "nao_verificado" },
    ].map(item => ({ ...item, mapsUrl: null, googleProfileFound: false, websiteListed: Boolean(item.website) }));
    const filtered = samples.filter(item => status === "sem-site" ? !item.website : status === "com-site" ? Boolean(item.website) : true);
    return NextResponse.json({ results: filtered, totalFound: samples.length, totalShown: filtered.length, nextPageToken: null, query, source: "Arcany Demo", demoMode: true, note: "Dados inteiramente fictícios. Não representam empresas reais e não devem ser contatados." });
  }

  if (!apiKey) {
    return NextResponse.json({ error: "A integração com o Google ainda não está configurada no servidor. Ative o modo de demonstração para testar sem empresas reais." }, { status: 503 });
  }

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
