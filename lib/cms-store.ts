export interface CMSBadge {
  icon: string
  title: string
  description: string
}

export interface CMSHero {
  subtitle: string
  title_line1: string
  title_line2: string
  description: string
  button_text: string
  video_url: string
}

export interface CMSCTABanner {
  title: string
  subtitle: string
  bg_image: string
  bullet1: string
  bullet2: string
  bullet3: string
}

export interface CMSPageHeader {
  title: string
  subtitle: string
}

export interface CMSProductGrid {
  badge: string
  title: string
  description: string
}

export interface CMSFeature {
  icon: string
  title: string
  description: string
}

export interface CMSFeatureSection {
  // Bento Left
  bento_left_video: string
  bento_left_title_1: string
  bento_left_title_2: string
  bento_left_desc: string
  
  // Bento Top Right
  bento_right_top_bg: string
  bento_right_top_title: string
  bento_right_top_subtitle: string
  bento_right_top_bullet1: string
  bento_right_top_bullet2: string
  bento_right_top_bullet3: string

  // Bento Bottom Right
  bento_right_bottom_video: string
  bento_right_bottom_title: string
  bento_right_bottom_subtitle: string

  // Why Mulla Row
  why_video: string
  why_badge: string
  why_title: string
  why_description: string
  why_features: CMSFeature[]
}

export interface CMSTestimonialItem {
  id: number
  name: string
  location: string
  rating: number
  text: string
  product: string
}

export interface CMSTestimonials {
  badge: string
  title: string
  items: CMSTestimonialItem[]
}

export interface CMSNewsletter {
  title: string
  description: string
  disclaimer: string
}

export interface CMSFooter {
  description: string
}

export interface CMSData {
  home: {
    hero: CMSHero
    trust_badges: CMSBadge[]
    product_grid: CMSProductGrid
    feature_section: CMSFeatureSection
    testimonials: CMSTestimonials
    cta_banner: CMSCTABanner
    newsletter: CMSNewsletter
  }
  shop: {
    header: CMSPageHeader
  }
  apartments: {
    header: CMSPageHeader
  }
  footer: CMSFooter
}

export const DEFAULT_CMS: CMSData = {
  home: {
    hero: {
      subtitle: "Luxury Lifestyle in Malindi",
      title_line1: "Live elegantly.",
      title_line2: "Uniquely you.",
      description: "Discover curated fashion, imported furniture, and exquisite decor. Premium collections for the discerning coastal lifestyle.",
      button_text: "Shop Collection",
      video_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/f3d8cad2-8091-4809-aac0-eaac74b0be7c-Z4XUCz3CRR7qjaOsoq6rFmbJfIRdgs.mp4"
    },
    trust_badges: [
      {
        icon: "Crown",
        title: "Premium Quality",
        description: "Handpicked luxury items"
      },
      {
        icon: "Truck",
        title: "Global Imports",
        description: "Sourced from the finest"
      },
      {
        icon: "Sparkles",
        title: "Exclusive Collections",
        description: "Unique curated pieces"
      },
      {
        icon: "ShieldCheck",
        title: "Authenticity Guaranteed",
        description: "100% genuine products"
      }
    ],
    product_grid: {
      badge: "Our Collection",
      title: "Curated collections",
      description: "Thoughtfully selected pieces for your luxury coastal lifestyle"
    },
    feature_section: {
      bento_left_video: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c4baaf67-b900-4b90-af2a-daf25a5a4b78-5un5eTbj9Z67qEtEdsQwlYrte9dZM9.mp4",
      bento_left_title_1: "100%",
      bento_left_title_2: "Imported",
      bento_left_desc: "Exclusively curated collections sourced from the finest global artisans and designers.",
      bento_right_top_bg: "/images/products/0ed61900-dd29-4dd2-bc2d-abc2db54c352.png",
      bento_right_top_title: "Luxury Lifestyle",
      bento_right_top_subtitle: "Malindi Living",
      bento_right_top_bullet1: "Premium Collections",
      bento_right_top_bullet2: "Authentic Luxury Items",
      bento_right_top_bullet3: "Globally Sourced",
      bento_right_bottom_video: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a0b7c364-afa9-4afa-9716-45718578cc01-Ih8UaqQr1bl8aoNlbRha4FgaQ65eXX.mp4",
      bento_right_bottom_title: "Authentic",
      bento_right_bottom_subtitle: "Guaranteed",
      why_video: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0c826034-d4f2-4d4f-8e99-50e94e4ce63f-dG1CBOjR36xFPTbhcROrHbomGXtlTQ.mp4",
      why_badge: "Why Mulla",
      why_title: "Style that speaks.",
      why_description: "We believe luxury should be accessible. Every piece is carefully selected to bring elegance and sophistication to your coastal lifestyle.",
      why_features: [
        {
          icon: "Truck",
          title: "Worldwide Imports",
          description: "Premium products from across the globe"
        },
        {
          icon: "Gem",
          title: "Authentic Luxury",
          description: "Handpicked exclusive collections"
        },
        {
          icon: "Sparkles",
          title: "Premium Quality",
          description: "Only the finest materials and craftsmanship"
        },
        {
          icon: "Globe",
          title: "Global Sourcing",
          description: "Curated from the world's best artisans"
        }
      ]
    },
    testimonials: {
      badge: "Client Stories",
      title: "Trusted by many",
      items: [
        {
          id: 1,
          name: "Amina K.",
          location: "Malindi",
          rating: 5,
          text: "The quality of the imported furniture exceeded my expectations. My living room looks absolutely stunning now.",
          product: "Italian Sofa"
        },
        {
          id: 2,
          name: "James M.",
          location: "Mombasa",
          rating: 5,
          text: "Finally found a boutique that understands luxury. The jewelry collection is exquisite and unique.",
          product: "Gold Necklace"
        },
        {
          id: 3,
          name: "Sarah O.",
          location: "Nairobi",
          rating: 5,
          text: "Mulla Apartments was perfect for our coastal getaway. The interior design was impeccable.",
          product: "Luxury Suite"
        },
        {
          id: 4,
          name: "David N.",
          location: "Watamu",
          rating: 5,
          text: "The decor pieces I bought transformed my beach house. Truly premium quality imports.",
          product: "Decor Set"
        },
        {
          id: 5,
          name: "Grace W.",
          location: "Lamu",
          rating: 5,
          text: "Outstanding customer service and authentic luxury items. Mulla is my go-to boutique now.",
          product: "Designer Bag"
        },
        {
          id: 6,
          name: "Peter K.",
          location: "Malindi",
          rating: 5,
          text: "The apartment exceeded all expectations. Perfect location and stunning interior design.",
          product: "Beach Apartment"
        },
        {
          id: 7,
          name: "Lucy A.",
          location: "Kilifi",
          rating: 5,
          text: "Every piece from Mulla tells a story of craftsmanship. The attention to detail is remarkable.",
          product: "Handcrafted Vase"
        },
        {
          id: 8,
          name: "Michael T.",
          location: "Nairobi",
          rating: 5,
          text: "Worth every shilling. The fashion collection is sophisticated and unique to the Kenyan coast.",
          product: "Linen Shirt"
        },
        {
          id: 9,
          name: "Fatima H.",
          location: "Mombasa",
          rating: 5,
          text: "Mulla brought my dream home to life with their curated furniture and decor selections.",
          product: "Dining Set"
        }
      ]
    },
    cta_banner: {
      title: "Luxury Living",
      subtitle: "Coastal Style",
      bg_image: "/images/bf965cf4-e728-4e72-ab1b-16b1cd8f1822.png",
      bullet1: "Premium Collections",
      bullet2: "Authentic Luxury Items",
      bullet3: "Globally Sourced"
    },
    newsletter: {
      title: "Join the experience",
      description: "Subscribe for exclusive offers, new arrivals, and updates on Mulla Apartments availability.",
      disclaimer: "Unsubscribe anytime. We respect your inbox."
    }
  },
  shop: {
    header: {
      title: "Luxury Shop",
      subtitle: "Discover our curated fashion & luxury decor"
    }
  },
  apartments: {
    header: {
      title: "Luxury Apartments",
      subtitle: "Premium rentals in Malindi"
    }
  },
  footer: {
    description: "Luxury fashion and lifestyle boutique in Malindi. Curated collections for those who appreciate the finer things in coastal living."
  }
}

import staticCmsData from "./cms-data.json"

const getFilePath = () => {
  if (typeof window !== 'undefined') return ''
  const path = eval("require")('path')
  return path.join(process.cwd(), 'lib', 'cms-data.json')
}

export function getCMSData(): CMSData {
  if (typeof window !== 'undefined') {
    // Client-side fallback: safely use static import
    return {
      ...DEFAULT_CMS,
      ...staticCmsData,
      home: {
        ...DEFAULT_CMS.home,
        ...(staticCmsData.home || {}),
        hero: { ...DEFAULT_CMS.home.hero, ...(staticCmsData.home?.hero || {}) },
        trust_badges: (staticCmsData.home as any)?.trust_badges || DEFAULT_CMS.home.trust_badges,
        product_grid: { ...DEFAULT_CMS.home.product_grid, ...(staticCmsData.home?.product_grid || {}) },
        feature_section: {
          ...DEFAULT_CMS.home.feature_section,
          ...(staticCmsData.home?.feature_section || {}),
          why_features: (staticCmsData.home as any)?.feature_section?.why_features || DEFAULT_CMS.home.feature_section.why_features
        },
        testimonials: {
          ...DEFAULT_CMS.home.testimonials,
          ...(staticCmsData.home?.testimonials || {}),
          items: (staticCmsData.home as any)?.testimonials?.items || DEFAULT_CMS.home.testimonials.items
        },
        cta_banner: { ...DEFAULT_CMS.home.cta_banner, ...(staticCmsData.home?.cta_banner || {}) },
        newsletter: { ...DEFAULT_CMS.home.newsletter, ...(staticCmsData.home?.newsletter || {}) }
      },
      shop: {
        ...DEFAULT_CMS.shop,
        ...(staticCmsData.shop || {}),
        header: { ...DEFAULT_CMS.shop.header, ...(staticCmsData.shop?.header || {}) }
      },
      apartments: {
        ...DEFAULT_CMS.apartments,
        ...(staticCmsData.apartments || {}),
        header: { ...DEFAULT_CMS.apartments.header, ...(staticCmsData.apartments?.header || {}) }
      },
      footer: {
        ...DEFAULT_CMS.footer,
        ...(staticCmsData.footer || {})
      }
    } as CMSData
  }

  try {
    const fs = eval("require")('fs')
    const filePath = getFilePath()
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8')
      const parsed = JSON.parse(data)
      return {
        ...DEFAULT_CMS,
        ...parsed,
        home: {
          ...DEFAULT_CMS.home,
          ...(parsed.home || {}),
          hero: { ...DEFAULT_CMS.home.hero, ...(parsed.home?.hero || {}) },
          trust_badges: parsed.home?.trust_badges || DEFAULT_CMS.home.trust_badges,
          product_grid: { ...DEFAULT_CMS.home.product_grid, ...(parsed.home?.product_grid || {}) },
          feature_section: {
            ...DEFAULT_CMS.home.feature_section,
            ...(parsed.home?.feature_section || {}),
            why_features: parsed.home?.feature_section?.why_features || DEFAULT_CMS.home.feature_section.why_features
          },
          testimonials: {
            ...DEFAULT_CMS.home.testimonials,
            ...(parsed.home?.testimonials || {}),
            items: parsed.home?.testimonials?.items || DEFAULT_CMS.home.testimonials.items
          },
          cta_banner: { ...DEFAULT_CMS.home.cta_banner, ...(parsed.home?.cta_banner || {}) },
          newsletter: { ...DEFAULT_CMS.home.newsletter, ...(parsed.home?.newsletter || {}) }
        },
        shop: {
          ...DEFAULT_CMS.shop,
          ...(parsed.shop || {}),
          header: { ...DEFAULT_CMS.shop.header, ...(parsed.shop?.header || {}) }
        },
        apartments: {
          ...DEFAULT_CMS.apartments,
          ...(parsed.apartments || {}),
          header: { ...DEFAULT_CMS.apartments.header, ...(parsed.apartments?.header || {}) }
        },
        footer: {
          ...DEFAULT_CMS.footer,
          ...(parsed.footer || {})
        }
      }
    }
  } catch (error) {
    console.error('Error reading CMS settings:', error)
  }
  return DEFAULT_CMS
}

export function saveCMSData(cms: Partial<CMSData>): CMSData {
  if (typeof window !== 'undefined') {
    return { ...DEFAULT_CMS, ...cms } as CMSData
  }

  try {
    const fs = eval("require")('fs')
    const path = eval("require")('path')
    const filePath = getFilePath()
    const current = getCMSData()
    const updated = {
      ...current,
      ...cms,
      home: {
        ...current.home,
        ...(cms.home || {}),
        hero: { ...current.home.hero, ...(cms.home?.hero || {}) },
        trust_badges: cms.home?.trust_badges || current.home.trust_badges,
        product_grid: { ...current.home.product_grid, ...(cms.home?.product_grid || {}) },
        feature_section: {
          ...current.home.feature_section,
          ...(cms.home?.feature_section || {}),
          why_features: cms.home?.feature_section?.why_features || current.home.feature_section.why_features
        },
        testimonials: {
          ...current.home.testimonials,
          ...(cms.home?.testimonials || {}),
          items: cms.home?.testimonials?.items || current.home.testimonials.items
        },
        cta_banner: { ...current.home.cta_banner, ...(cms.home?.cta_banner || {}) },
        newsletter: { ...current.home.newsletter, ...(cms.home?.newsletter || {}) }
      },
      shop: {
        ...current.shop,
        ...(cms.shop || {}),
        header: { ...current.shop.header, ...(cms.shop?.header || {}) }
      },
      apartments: {
        ...current.apartments,
        ...(cms.apartments || {}),
        header: { ...current.apartments.header, ...(cms.apartments?.header || {}) }
      },
      footer: {
        ...current.footer,
        ...(cms.footer || {})
      }
    }
    
    const dirPath = path.dirname(filePath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8')
    return updated
  } catch (error) {
    console.error('Error saving CMS settings:', error)
    return { ...DEFAULT_CMS, ...cms } as CMSData
  }
}
