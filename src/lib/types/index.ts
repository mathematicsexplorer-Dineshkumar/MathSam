export interface Course {
  id: string
  title: string
  description: string
  price: number
  original_price: number
  exam_type: string
  total_lectures: number
  total_hours: number
  thumbnail_url: string
  is_published: boolean
  created_at: string
}

export interface PDF {
  id: string
  title: string
  description: string
  exam_type: string
  price: number
  pages: number
  file_url: string
  preview_url: string
  is_published: boolean
  created_at: string
}

export interface Test {
  id: string
  title: string
  exam_type: string
  difficulty: string
  total_questions: number
  duration_minutes: number
  price: number
  is_published: boolean
  created_at: string
}

export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string
  avatar_url: string
  role: string
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  item_id: string
  item_type: string
  amount: number
  status: string
  created_at: string
}