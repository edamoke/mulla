import { streamText, tool, convertToModelMessages, UIMessage } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const { messages } = await req.json() as { messages: UIMessage[] }
  const supabase = await createClient()

  // Define tools for the shopping assistant
  const searchProductsFn = async ({ query, category, maxPrice }: { query: string, category: string | null, maxPrice: number | null }) => {
    let queryBuilder = supabase
      .from("products")
      .select("id, name, slug, short_description, price, thumbnail_url, badge")
      .eq("is_active", true)
      .ilike("name", `%${query}%`)
      .limit(5)

    if (maxPrice) {
      queryBuilder = queryBuilder.lte("price", maxPrice)
    }

    const { data: products } = await queryBuilder

    if (!products || products.length === 0) {
      return { found: false, message: "No products found matching your search." }
    }

    return {
      found: true,
      products: products.map((p) => ({
        name: p.name,
        price: `KES ${p.price.toLocaleString()}`,
        description: p.short_description,
        url: `/product/${p.slug}`,
        badge: p.badge,
      })),
    }
  }

  const getProductDetailsFn = async ({ productSlug }: { productSlug: string }) => {
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("slug", productSlug)
      .single()

    if (!product) {
      return { found: false, message: "Product not found." }
    }

    return {
      found: true,
      product: {
        name: product.name,
        price: `KES ${product.price.toLocaleString()}`,
        description: product.description,
        materials: product.materials,
        sizes: product.sizes,
        inStock: product.stock_quantity > 0,
        stockQuantity: product.stock_quantity,
        url: `/product/${product.slug}`,
      },
    }
  }

  const searchApartmentsFn = async ({ minBedrooms, maxPrice, guests }: { minBedrooms: number | null, maxPrice: number | null, guests: number | null }) => {
    let queryBuilder = supabase
      .from("apartments")
      .select("id, name, slug, short_description, price_per_night, bedrooms, max_guests, thumbnail_url")
      .eq("is_active", true)

    if (minBedrooms) {
      queryBuilder = queryBuilder.gte("bedrooms", minBedrooms)
    }
    if (maxPrice) {
      queryBuilder = queryBuilder.lte("price_per_night", maxPrice)
    }
    if (guests) {
      queryBuilder = queryBuilder.gte("max_guests", guests)
    }

    const { data: apartments } = await queryBuilder.limit(4)

    if (!apartments || apartments.length === 0) {
      return { found: false, message: "No apartments found matching your criteria." }
    }

    return {
      found: true,
      apartments: apartments.map((a) => ({
        name: a.name,
        pricePerNight: `KES ${a.price_per_night.toLocaleString()}`,
        bedrooms: a.bedrooms === 0 ? "Studio" : `${a.bedrooms} bedroom(s)`,
        maxGuests: a.max_guests,
        description: a.short_description,
        url: `/apartments/${a.slug}`,
      })),
    }
  }

  const getCategoriesFn = async () => {
    const { data: categories } = await supabase
      .from("categories")
      .select("name, slug, description")
      .eq("is_active", true)
      .order("sort_order")

    return {
      categories: categories?.map((c) => ({
        name: c.name,
        description: c.description,
        url: `/shop?category=${c.slug}`,
      })) || [],
    }
  }

  const getStoreInfoFn = async () => {
    return {
      name: "Mulla",
      tagline: "Curated Luxury. Imported Elegance.",
      location: "Malindi, Kenya",
      description: "Mulla is a premium boutique offering curated luxury fashion, imported furniture, elegant decor, and fine jewelry. We also offer exclusive apartment rentals in Malindi for visitors seeking a luxurious coastal getaway.",
      services: [
        "Luxury Fashion & Apparel",
        "Imported Furniture",
        "Home Decor",
        "Fine Jewelry & Accessories",
        "Luxury Apartment Rentals"
      ],
      contact: {
        phone: "+254 XXX XXX XXX",
        email: "hello@mulla.ke",
      }
    }
  }

  // Fallback streaming engine when GEMINI_API_KEY is not configured
  const hasApiKey = !!process.env.GEMINI_API_KEY
  if (!hasApiKey) {
    const lastMsg: any = messages[messages.length - 1]
    const lastUserMessage = typeof lastMsg?.content === 'string'
      ? lastMsg.content
      : (Array.isArray(lastMsg?.parts) ? lastMsg.parts.find((p: any) => p.type === 'text')?.text : "") || "hello"

    let responseText = ""
    const queryLower = lastUserMessage.toLowerCase()

    if (queryLower.includes("apartment") || queryLower.includes("room") || queryLower.includes("stay") || queryLower.includes("booking")) {
      const result = await searchApartmentsFn({ minBedrooms: null, maxPrice: null, guests: null })
      if (result.found && result.apartments) {
        responseText = "I found these beautiful luxury apartments for you in Malindi:\n\n" +
          result.apartments.map(a => `🏡 **${a.name}**\n${a.description}\nRate: ${a.pricePerNight} per night | Bedrooms: ${a.bedrooms}\n[View details](${a.url})\n`).join("\n") +
          "\nWould you like me to help you check availability for specific dates or assist with booking?"
      } else {
        responseText = "Mulla offers luxury apartments in Malindi with beach proximity and premium amenities. Could you tell me more about your travel dates and preferred number of guests so I can find the perfect home away from home for you?"
      }
    } else if (queryLower.includes("product") || queryLower.includes("furniture") || queryLower.includes("sofa") || queryLower.includes("gold") || queryLower.includes("jewelry") || queryLower.includes("bag") || queryLower.includes("decor")) {
      const keyword = queryLower.includes("sofa") ? "sofa" : queryLower.includes("gold") ? "gold" : queryLower.includes("jewelry") ? "jewelry" : queryLower.includes("bag") ? "bag" : "luxury"
      const result = await searchProductsFn({ query: keyword, category: null, maxPrice: null })
      if (result.found && result.products) {
        responseText = `Here are some of our finest luxury pieces matching "${keyword}":\n\n` +
          result.products.map(p => `✨ **${p.name}** (${p.badge || 'Premium'})\nPrice: ${p.price}\n${p.description}\n[Explore Piece](${p.url})\n`).join("\n") +
          "\nAll of our boutique items are handcrafted or imported exclusively. Would you like details on sizes, customization, or M-Pesa home delivery?"
      } else {
        responseText = "Mulla is proud to offer curated fashion, imported furniture, exquisite home decor, and fine gold jewelry. I can help you search our catalog! Tell me what you are looking for (e.g., 'white luxury sofa', 'wedding jewelry')."
      }
    } else if (queryLower.includes("category") || queryLower.includes("shop") || queryLower.includes("boutique")) {
      const result = await getCategoriesFn()
      responseText = "We invite you to explore our exquisite boutique categories:\n\n" +
        result.categories.map(c => `• **${c.name}**: ${c.description || 'Exclusive collections'} [Shop Category](${c.url})`).join("\n") +
        "\n\nWe offer secure payments via M-Pesa STK Push and card, and free premium delivery within Malindi."
    } else if (queryLower.includes("mulla") || queryLower.includes("info") || queryLower.includes("location") || queryLower.includes("contact")) {
      const info = await getStoreInfoFn()
      responseText = `Welcome to **${info.name}** - *${info.tagline}*\n\nLocated in beautiful **${info.location}**, ${info.description}\n\n**Our Services:**\n` +
        info.services.map(s => `• ${s}`).join("\n") +
        `\n\n**Contact Us:**\n📧 Email: ${info.contact.email}\n📞 Phone/WhatsApp: ${info.contact.phone}\n\nHow may I assist your luxury experience today?`
    } else {
      responseText = "Hello! I am your Mulla Luxury Sales & Concierge Assistant.\n\nI am here to guide you through our curated fashion collections, imported furniture showroom, or premium coastal apartments in Malindi.\n\nFeel free to ask me:\n• *'Show me apartments near the beach'*\n• *'Do you have any gold jewelry or luxury sofas?'*\n• *'Tell me about Mulla services and contacts'*"
    }

    // Return custom streaming response
    const encoder = new TextEncoder()
    const customStream = new ReadableStream({
      async start(controller) {
        // Stream text in small chunks to simulate typing
        const chunks = responseText.split(" ")
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk + " "))
          await new Promise(resolve => setTimeout(resolve, 40))
        }
        controller.close()
      }
    })

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked'
      }
    })
  }

  // Vercel AI SDK execution when GEMINI_API_KEY is configured
  const tools = {
    searchProducts: tool({
      description: "Search for products in the Mulla store catalog by name, category, or description",
      inputSchema: z.object({
        query: z.string().describe("Search query for products"),
        category: z.string().nullable().describe("Optional category filter: fashion, furniture, decor, jewelry, accessories"),
        maxPrice: z.number().nullable().describe("Optional maximum price filter in KES"),
      }),
      execute: searchProductsFn,
    }),

    getProductDetails: tool({
      description: "Get detailed information about a specific product",
      inputSchema: z.object({
        productSlug: z.string().describe("The slug/ID of the product to get details for"),
      }),
      execute: getProductDetailsFn,
    }),

    searchApartments: tool({
      description: "Search for available apartments for rent in Malindi",
      inputSchema: z.object({
        minBedrooms: z.number().nullable().describe("Minimum number of bedrooms"),
        maxPrice: z.number().nullable().describe("Maximum price per night in KES"),
        guests: z.number().nullable().describe("Number of guests"),
      }),
      execute: searchApartmentsFn,
    }),

    getCategories: tool({
      description: "Get all available product categories",
      inputSchema: z.object({}),
      execute: getCategoriesFn,
    }),

    getStoreInfo: tool({
      description: "Get general information about Mulla boutique",
      inputSchema: z.object({}),
      execute: getStoreInfoFn,
    }),
  }

  const result = streamText({
    model: "google/gemini-2.0-flash" as any,
    system: `You are Mulla's friendly shopping assistant. You help customers discover products, find apartments for rent, and answer questions about the store.

Key facts about Mulla:
- Premium boutique in Malindi, Kenya
- Offers curated luxury fashion, imported furniture, decor, and jewelry
- Also has luxury apartments available for short-term rental
- Currency is Kenyan Shillings (KES)

Guidelines:
- Be warm, helpful, and conversational
- Use the available tools to search for products and apartments
- When showing products, include prices and links
- If customers are looking for something specific, use the search tools
- For apartment inquiries, ask about dates, number of guests, and preferences
- Keep responses concise but informative`,
    messages: await convertToModelMessages(messages),
    tools,
    maxSteps: 5,
  } as any)

  return result.toUIMessageStreamResponse()
}
