// Mock data generator for Temenos Transaction Simulator
import type {
  Customer,
  Account,
  Payment,
  CustomerPayload,
  AccountPayload,
  PaymentPayload
} from '../demo/types'

/**
 * Generate a unique customer ID in Temenos format
 * Format: CUST + timestamp + random
 */
export const generateCustomerId = (): string => {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `CUST${timestamp}${random}`
}

/**
 * Generate a unique account ID in Temenos format
 * Format: ACC + timestamp + random
 */
export const generateAccountId = (): string => {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `ACC${timestamp}${random}`
}

/**
 * Generate a unique transaction/payment ID in Temenos format
 * Format: TXN + timestamp + random
 */
export const generateTransactionId = (): string => {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `TXN${timestamp}${random}`
}

/**
 * Generate a unique event ID
 * Format: EVT + timestamp + random
 */
export const generateEventId = (): string => {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `EVT${timestamp}${random}`
}

/**
 * Generate mock customer response from payload
 */
export const generateCustomerResponse = (payload: CustomerPayload): Customer => {
  const now = new Date().toISOString()

  return {
    customerId: generateCustomerId(),
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    address: payload.address,
    status: 'ACTIVE',
    createdAt: now,
    lastModified: now
  }
}

/**
 * Generate mock account response from payload
 * Uses hardcoded values matching Temenos API (CURRENT.ACCOUNT, USD)
 */
export const generateAccountResponse = (payload: AccountPayload): Account => {
  const now = new Date().toISOString()

  return {
    accountId: generateAccountId(),
    customerId: payload.customerId,
    accountType: 'CURRENT.ACCOUNT', // Matches Temenos productId
    balance: 0,
    currency: 'USD', // Matches Temenos currencyId
    status: 'ACTIVE',
    openedAt: now
  }
}

/**
 * Generate mock payment response from payload
 */
export const generatePaymentResponse = (payload: PaymentPayload): Payment => {
  const now = new Date().toISOString()

  return {
    paymentId: generateTransactionId(),
    fromAccount: payload.fromAccount,
    toAccount: payload.toAccount,
    amount: payload.amount,
    currency: payload.currency,
    reference: payload.reference,
    status: 'COMPLETED',
    timestamp: now
  }
}

/**
 * Generate sample customer payload for testing - European market focus
 * Ensures consistency: names match gender, cities match countries, addresses match locations
 */
export const generateSampleCustomerPayload = (): CustomerPayload => {
  // European data with proper mappings for consistency
  const europeanData = [
    {
      country: { name: 'Germany', code: 'DE', phonePrefix: '+49' },
      cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'],
      streets: ['Hauptstraße', 'Bahnhofstraße', 'Friedrichstraße', 'Unter den Linden', 'Kurfürstendamm'],
      postalCodeFormat: (min: number, max: number) => Math.floor(min + Math.random() * (max - min)).toString().padStart(5, '0'),
      maleNames: ['Hans', 'Klaus', 'Michael', 'Thomas', 'Andreas', 'Stefan', 'Martin', 'Wolfgang'],
      femaleNames: ['Anna', 'Maria', 'Sabine', 'Petra', 'Susanne', 'Julia', 'Nicole', 'Katrin'],
      lastNames: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker']
    },
    {
      country: { name: 'France', code: 'FR', phonePrefix: '+33' },
      cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'],
      streets: ['Rue de la République', 'Avenue des Champs-Élysées', 'Boulevard Saint-Germain', 'Rue de Rivoli', 'Avenue Montaigne'],
      postalCodeFormat: (min: number, max: number) => Math.floor(min + Math.random() * (max - min)).toString().padStart(5, '0'),
      maleNames: ['Pierre', 'Jean', 'François', 'Michel', 'Philippe', 'Nicolas', 'Antoine', 'Laurent'],
      femaleNames: ['Marie', 'Sophie', 'Isabelle', 'Catherine', 'Anne', 'Julie', 'Camille', 'Claire'],
      lastNames: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit', 'Durand', 'Leroy']
    },
    {
      country: { name: 'Italy', code: 'IT', phonePrefix: '+39' },
      cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Florence'],
      streets: ['Via Roma', 'Corso Vittorio Emanuele', 'Via del Corso', 'Via Garibaldi', 'Via Dante'],
      postalCodeFormat: (min: number, max: number) => Math.floor(min + Math.random() * (max - min)).toString().padStart(5, '0'),
      maleNames: ['Giovanni', 'Marco', 'Alessandro', 'Francesco', 'Luca', 'Andrea', 'Matteo', 'Stefano'],
      femaleNames: ['Sofia', 'Giulia', 'Francesca', 'Chiara', 'Valentina', 'Elena', 'Martina', 'Alessia'],
      lastNames: ['Rossi', 'Ferrari', 'Russo', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino']
    },
    {
      country: { name: 'Spain', code: 'ES', phonePrefix: '+34' },
      cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao'],
      streets: ['Calle Mayor', 'Gran Vía', 'Paseo de la Castellana', 'Rambla de Catalunya', 'Calle de Alcalá'],
      postalCodeFormat: (min: number, max: number) => Math.floor(min + Math.random() * (max - min)).toString().padStart(5, '0'),
      maleNames: ['Carlos', 'Miguel', 'Javier', 'Antonio', 'Francisco', 'Manuel', 'José', 'Luis'],
      femaleNames: ['Elena', 'Carmen', 'María', 'Laura', 'Ana', 'Isabel', 'Patricia', 'Sandra'],
      lastNames: ['García', 'López', 'González', 'Rodríguez', 'Fernández', 'Martínez', 'Sánchez', 'Pérez']
    },
    {
      country: { name: 'Netherlands', code: 'NL', phonePrefix: '+31' },
      cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
      streets: ['Kalverstraat', 'Damrak', 'Leidsestraat', 'Rokin', 'Nieuwendijk'],
      postalCodeFormat: () => {
        const part1 = Math.floor(1000 + Math.random() * 9000)
        const part2 = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26))
        return `${part1} ${part2}`
      },
      maleNames: ['Jan', 'Pieter', 'Willem', 'Henk', 'Dirk', 'Maarten', 'Sander', 'Rik'],
      femaleNames: ['Emma', 'Sophie', 'Anna', 'Lisa', 'Eva', 'Julia', 'Sanne', 'Fleur'],
      lastNames: ['De Jong', 'Jansen', 'De Vries', 'Van den Berg', 'Van Dijk', 'Bakker', 'Visser', 'Smit']
    },
    {
      country: { name: 'Sweden', code: 'SE', phonePrefix: '+46' },
      cities: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Linköping'],
      streets: ['Drottninggatan', 'Kungsgatan', 'Sveavägen', 'Birger Jarlsgatan', 'Storgatan'],
      postalCodeFormat: (min: number, max: number) => Math.floor(min + Math.random() * (max - min)).toString().padStart(5, '0'),
      maleNames: ['Lars', 'Anders', 'Erik', 'Johan', 'Mikael', 'Daniel', 'Fredrik', 'Magnus'],
      femaleNames: ['Ingrid', 'Anna', 'Maria', 'Elin', 'Emma', 'Sara', 'Hanna', 'Klara'],
      lastNames: ['Johansson', 'Andersson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 'Olsson', 'Persson']
    },
    {
      country: { name: 'Austria', code: 'AT', phonePrefix: '+43' },
      cities: ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck'],
      streets: ['Kärntner Straße', 'Mariahilfer Straße', 'Ringstraße', 'Landstraßer Hauptstraße', 'Favoritenstraße'],
      postalCodeFormat: (min: number, max: number) => Math.floor(min + Math.random() * (max - min)).toString().padStart(4, '0'),
      maleNames: ['Thomas', 'Michael', 'Andreas', 'Stefan', 'Markus', 'Christian', 'Daniel', 'Florian'],
      femaleNames: ['Anna', 'Maria', 'Julia', 'Sarah', 'Lisa', 'Laura', 'Sophie', 'Katharina'],
      lastNames: ['Gruber', 'Huber', 'Bauer', 'Wagner', 'Müller', 'Pichler', 'Steiner', 'Hofer']
    },
    {
      country: { name: 'Switzerland', code: 'CH', phonePrefix: '+41' },
      cities: ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne'],
      streets: ['Bahnhofstrasse', 'Limmatquai', 'Rue du Rhône', 'Rue de la Confédération', 'Spitalgasse'],
      postalCodeFormat: (min: number, max: number) => Math.floor(min + Math.random() * (max - min)).toString().padStart(4, '0'),
      maleNames: ['Hans', 'Peter', 'Thomas', 'Michael', 'Andreas', 'Stefan', 'Markus', 'Daniel'],
      femaleNames: ['Anna', 'Maria', 'Sandra', 'Nicole', 'Sabrina', 'Patricia', 'Monika', 'Claudia'],
      lastNames: ['Müller', 'Schmid', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker']
    }
  ]

  // Select a random country data set
  const countryData = europeanData[Math.floor(Math.random() * europeanData.length)]
  
  // Select a random city from that country
  const city = countryData.cities[Math.floor(Math.random() * countryData.cities.length)]
  
  // Select a random street from that country
  const street = countryData.streets[Math.floor(Math.random() * countryData.streets.length)]
  
  // Generate gender first, then select appropriate name
  const genders: Array<'MALE' | 'FEMALE'> = ['MALE', 'FEMALE']
  const gender = genders[Math.floor(Math.random() * genders.length)]
  
  // Select name based on gender
  const firstName = gender === 'MALE' 
    ? countryData.maleNames[Math.floor(Math.random() * countryData.maleNames.length)]
    : countryData.femaleNames[Math.floor(Math.random() * countryData.femaleNames.length)]
  
  const lastName = countryData.lastNames[Math.floor(Math.random() * countryData.lastNames.length)]
  const fullName = `${firstName} ${lastName}`
  
  const streetNumber = Math.floor(1 + Math.random() * 200)
  const postalCode = countryData.postalCodeFormat(1000, 99999)

  // Customer sector/segment - Valid Temenos sector codes
  // 1001=Individual, 1002=Staff, 1003=Director, 1004=Director, 1005=Principal Shareholder, 1006=Executive Officer
  const validSectorIds = [1001, 1002, 1003, 1004, 1005, 1006]
  const sectorId = validSectorIds[Math.floor(Math.random() * validSectorIds.length)]

  const streetAddress = `${street} ${streetNumber}`
  const fullAddress = `${streetAddress}, ${postalCode} ${city}, ${countryData.country.name}`

  return {
    name: fullName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[üöäÜÖÄ]/g, (m) => ({ ü: 'u', ö: 'o', ä: 'a', Ü: 'u', Ö: 'o', Ä: 'a' })[m] || m)}@example.${countryData.country.code.toLowerCase()}`,
    phone: `${countryData.country.phonePrefix} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000000 + Math.random() * 9000000)}`,
    address: fullAddress,
    // Extended fields for Temenos API
    nationality: countryData.country.code,
    gender,
    sectorId,
    street: streetAddress,
    city,
    country: countryData.country.code,
    postalCode
  }
}

/**
 * Generate account payload - only customerId is needed
 * Actual Temenos API values (productId, currencyId, effectiveDate) are hardcoded in the API adapter
 */
export const generateSampleAccountPayload = (customerId: string): AccountPayload => {
  return {
    customerId
  }
}

/**
 * Generate sample payment payload for testing
 * Values match what's actually sent to Temenos API (paymentCurrency: USD)
 */
export const generateSamplePaymentPayload = (fromAccount: string): PaymentPayload => {
  const toAccount = generateAccountId() // Generate random recipient account

  return {
    fromAccount,
    toAccount,
    amount: Math.floor(100 + Math.random() * 1900),
    currency: 'USD', // Matches Temenos paymentCurrency: USD
    reference: `Payment REF-${Date.now()}`
  }
}

/**
 * Simulate random API error (for testing error scenarios)
 * Returns null if no error, or an error message if error should occur
 */
export const simulateRandomError = (failureRate: number = 0.05): string | null => {
  if (Math.random() < failureRate) {
    const errors = [
      'Network timeout - please try again',
      'Invalid customer data - verification failed',
      'Insufficient funds for transaction',
      'Account temporarily locked',
      'Service temporarily unavailable'
    ]
    return errors[Math.floor(Math.random() * errors.length)]
  }
  return null
}

/**
 * Mock Data Generator - Main export object
 */
export const mockDataGenerator = {
  // ID Generators
  generateCustomerId,
  generateAccountId,
  generateTransactionId,
  generateEventId,

  // Response Generators
  generateCustomerResponse,
  generateAccountResponse,
  generatePaymentResponse,

  // Sample Payload Generators
  generateSampleCustomerPayload,
  generateSampleAccountPayload,
  generateSamplePaymentPayload,

  // Error Simulation
  simulateRandomError
}
