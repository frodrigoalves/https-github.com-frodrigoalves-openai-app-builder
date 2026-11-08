export type Category =
  | 'Mineralien'
  | 'Edelsteine'
  | 'Schmuck'
  | 'Wohnen & Geschenke'
  | 'Ski & Outdoor'

export type Availability = 'Auf Lager' | 'In Anlieferung' | 'Nicht verfügbar'

export interface Product {
  id: string
  name: string
  category: Category
  price: number
  quantity: number
  image: string
  images?: string[]
  imageIsIllustrative?: boolean
  description: string
  mineral?: string
  weight?: string
  dimensions?: string
  color?: string
  sku: string
  tags: string[]
  published: boolean
  archived: boolean
  uniquePiece: boolean
  availability: Availability
}

export interface CartLine {
  productId: string
  quantity: number
}

export interface StockMovement {
  id: string
  productName: string
  quantity: number
  kind: 'Wareneingang' | 'Bestandskorrektur'
  date: string
}
