import Header from './components/Header.jsx'
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Book from './pages/Book.jsx';
import NoMatch from './pages/NoMatch.jsx';

function App() {
  return (
    <>
      <div>
          <Header></Header>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book/:id" element={<Book />} />
            <Route path="*" element={<NoMatch />} />
          </Routes>
      </div>
    </>
  )
}

export default App
