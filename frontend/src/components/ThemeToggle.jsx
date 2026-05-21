import { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <Button
      variant={dark ? 'outline-light' : 'outline-dark'}
      size="sm"
      className="me-2"
      onClick={() => setDark(!dark)}
    >
      {dark ? 'Светлая' : 'Тёмная'}
    </Button>
  )
}
