import fs from 'fs'
import path from 'path'

export interface AdminSettings {
  store_name: string
  store_email: string
  store_phone: string
  store_address: string
  currency: string
  tax_rate: string
  enable_guest_checkout: boolean
  enable_email_notifications: boolean
  enable_sms_notifications: boolean
  low_stock_threshold: string
  maintenance_mode: boolean
  etims_pin: string
  etims_device_id: string
  etims_server_url: string
  mpesa_shortcode: string
  mpesa_consumer_key: string
  mpesa_consumer_secret: string
  mpesa_passkey: string
  enable_online_pos_purchase: boolean
}

export const DEFAULT_SETTINGS: AdminSettings = {
  store_name: "Boty",
  store_email: "info@boty.co.ke",
  store_phone: "+254 700 000 000",
  store_address: "Nairobi, Kenya",
  currency: "KES",
  tax_rate: "16",
  enable_guest_checkout: true,
  enable_email_notifications: true,
  enable_sms_notifications: false,
  low_stock_threshold: "10",
  maintenance_mode: false,
  etims_pin: "P051234567A",
  etims_device_id: "DEV-MULLA-2026",
  etims_server_url: "https://etims-api.kra.go.ke/v1",
  mpesa_shortcode: "174379",
  mpesa_consumer_key: "CON_KEY_MULLA_2026",
  mpesa_consumer_secret: "CON_SEC_MULLA_2026",
  mpesa_passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
  enable_online_pos_purchase: true,
}

const getFilePath = () => {
  return path.join(process.cwd(), 'lib', 'settings-data.json')
}

export function getAdminSettings(): AdminSettings {
  try {
    const filePath = getFilePath()
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8')
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) }
    }
  } catch (error) {
    console.error('Error reading admin settings:', error)
  }
  return DEFAULT_SETTINGS
}

export function saveAdminSettings(settings: Partial<AdminSettings>): AdminSettings {
  try {
    const filePath = getFilePath()
    const current = getAdminSettings()
    const updated = { ...current, ...settings }
    
    // Ensure parent dir exists
    const dirPath = path.dirname(filePath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8')
    return updated
  } catch (error) {
    console.error('Error saving admin settings:', error)
    return { ...DEFAULT_SETTINGS, ...settings } as AdminSettings
  }
}
