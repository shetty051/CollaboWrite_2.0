export interface User {
  id: string
  name: string
  email: string
}

export interface Document {
  id: string
  title: string
  content: string
  owner: User | string
  collaborators: User[]
  createdAt: string
  updatedAt: string
}

export interface HealthCheckResponse {
  status: string
  timestamp: string
  uptime: number
  database: string
}
