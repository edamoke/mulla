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

export interface CMSData {
  home: {
    hero: CMSHero
    trust_badges: CMSBadge[]
    cta_banner: CMSCTABanner
  }
  shop: {
    header: CMSPageHeader
  }
  apartments: {
    header: CMSPageHeader
  }
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
    cta_banner: {
      title: "Luxury Living",
      subtitle: "Coastal Style",
      bg_image: "/images/bf965cf4-e728-4e72-ab1b-16b1cd8f1822.png",
      bullet1: "Premium Collections",
      bullet2: "Authentic Luxury Items",
      bullet3: "Globally Sourced"
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
  }
}

const getFilePath = () => {
  const path = require('path')
  return path.join(process.cwd(), 'lib', 'cms-data.json')
}

export function getCMSData(): CMSData {
  try {
    const fs = require('fs')
    const filePath = getFilePath()
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8')
      // deep merge / parse safely
      const parsed = JSON.parse(data)
      return {
        ...DEFAULT_CMS,
        ...parsed,
        home: {
          ...DEFAULT_CMS.home,
          ...(parsed.home || {}),
          hero: { ...DEFAULT_CMS.home.hero, ...(parsed.home?.hero || {}) },
          trust_badges: parsed.home?.trust_badges || DEFAULT_CMS.home.trust_badges,
          cta_banner: { ...DEFAULT_CMS.home.cta_banner, ...(parsed.home?.cta_banner || {}) }
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
        }
      }
    }
  } catch (error) {
    console.error('Error reading CMS settings:', error)
  }
  return DEFAULT_CMS
}

export function saveCMSData(cms: Partial<CMSData>): CMSData {
  try {
    const fs = require('fs')
    const path = require('path')
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
        cta_banner: { ...current.home.cta_banner, ...(cms.home?.cta_banner || {}) }
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
