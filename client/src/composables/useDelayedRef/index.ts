import { customRef } from 'vue'

export default function useDelayedRef<T>(value: T, delay = 200) {
  let timeout: NodeJS.Timeout | undefined
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      },
    }
  })
}
