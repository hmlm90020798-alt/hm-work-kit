import { useState, useCallback } from 'react'

export function useToast() {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)

  const showToast = useCallback((m) => {
    setMsg(m)
    setVisible(true)
    setTimeout(() => setVisible(false), 2400)
  }, [])

  return { msg, visible, showToast }
}
