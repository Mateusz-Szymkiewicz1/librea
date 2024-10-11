import Header from './components/Header.jsx'
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Book from './pages/Book.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NoMatch from './pages/NoMatch.jsx';
import CollectionNew from './pages/CollectionNew.jsx';
import Search from './pages/Search.jsx';
import Collection from './pages/Collection.jsx';
import Profile from './pages/Profile.jsx';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  return (
    <>
      <div>
          <Header key={location.pathname} ></Header>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/book/:id" element={<Book key={location.pathname} />} />
            <Route path="/search/:search" element={<Search key={location.pathname} />} />
            <Route path="/profile/:user" element={<Profile key={location.pathname} />} />
            <Route path="/collection/new" element={<CollectionNew />} />
            <Route path="/collection/:id" element={<Collection key={location.pathname} />} />
            <Route path="*" element={<NoMatch />} />
          </Routes>
      </div>
    </>
  )
}

export default App
