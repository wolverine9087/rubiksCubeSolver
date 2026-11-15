import { request } from './api.js'

export async function checkBackendHealth() {
  return request('/health')
}
