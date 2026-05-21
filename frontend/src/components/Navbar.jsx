import { Nav, Navbar as BSNavbar, Container, Button } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  if (!user) return null

  return (
    <BSNavbar bg="light" expand="lg" className="mb-3">
      <Container fluid>
        <BSNavbar.Brand as={Link} to="/">EduAssist</BSNavbar.Brand>
        <BSNavbar.Toggle />
        <BSNavbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={location.pathname === '/'}>Панель</Nav.Link>
            <Nav.Link as={Link} to="/summary" active={location.pathname === '/summary'}>Конспект</Nav.Link>
            <Nav.Link as={Link} to="/flashcards" active={location.pathname === '/flashcards'}>Карточки</Nav.Link>
            <Nav.Link as={Link} to="/quiz" active={location.pathname === '/quiz'}>Тест</Nav.Link>
            <Nav.Link as={Link} to="/keywords" active={location.pathname === '/keywords'}>Ключевые слова</Nav.Link>
            <Nav.Link as={Link} to="/history" active={location.pathname === '/history'}>История</Nav.Link>
            <Nav.Link as={Link} to="/favorites" active={location.pathname === '/favorites'}>Избранное</Nav.Link>
          </Nav>
          <Nav className="align-items-center">
            <ThemeToggle />
            <Nav.Link as={Link} to="/settings">
              <span className="me-1">{user.username}</span>
            </Nav.Link>
            <Button variant="outline-secondary" size="sm" onClick={logout}>Выйти</Button>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}
