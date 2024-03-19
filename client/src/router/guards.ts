import { useUserStore } from '@/stores/users'

export const authenticate = () => {
  // Pinia stores need to be called inside guards
  const store = useUserStore()
  if (store.userRole === null) return { name: 'Home' }

  return true
}

export const authenticateAdmin = () => {
  const store = useUserStore()
  if (store.userRole !== 'admin') return { name: 'Home' }

  return true
}
