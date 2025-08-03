import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Book from './pages/Book.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import TOS from './pages/TOS.jsx';
import NoMatch from './pages/NoMatch.jsx';
import CollectionNew from './pages/CollectionNew.jsx';
import Search from './pages/Search.jsx';
import Collection from './pages/Collection.jsx';
import Profile from './pages/Profile.jsx';
import { useLocation } from 'react-router-dom';
import 'primereact/resources/themes/viva-dark/theme.css';
import 'primereact/resources/primereact.min.css';
import Settings from './pages/Settings.jsx';
import Explore from './pages/Explore.jsx';
import Toast from './components/Toast.jsx';
import Admin from './pages/Admin.jsx';
import { useEffect, useState } from 'react';
import NewBook from './pages/NewBook.jsx';
import EditBook from './pages/EditBook.jsx';
import Notifications from './pages/Notifications.jsx';
import NewAuthor from './pages/NewAuthor.jsx';
import Author from './pages/Author.jsx';
import EditAuthor from './pages/EditAuthor.jsx';
import NewPost from './pages/NewPost.jsx';
import Post from './pages/Post.jsx';
import Posts from './pages/Posts.jsx';

function App() {
  const [msg,setMsg] = useState()
  const location = useLocation();
  const closeToast = () => {
    setMsg()
  }
  const setToast = (msg) => {
    setMsg(msg)
  }
  useEffect(() => {
    if(msg && !msg.stay){
      setMsg()
    }
  }, [location])
  return (
    <>
      <div>
          <Header key={location.pathname} ></Header>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setToast={setToast} />} />
            <Route path="/register" element={<Register setToast={setToast} />} />
            <Route path="/tos" element={<TOS />} />
            <Route path="/book/:id" element={<Book key={location.pathname} setToast={setToast} />} />
            <Route path="/author/:id" element={<Author key={location.pathname} setToast={setToast} />} />
            <Route path="/search/:search" element={<Search key={location.pathname} />} />
            <Route path="/profile/:user" element={<Profile key={location.pathname} setToast={setToast} />} />
            <Route path="/notifications/:user" element={<Notifications key={location.pathname} setToast={setToast} />} />
            <Route path="/collection/new" element={<CollectionNew setToast={setToast} />} />
            <Route path="/collection/:id" element={<Collection key={location.pathname} setToast={setToast} />} />
            <Route path="/settings" element={<Settings setToast={setToast} />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/book/new" element={<NewBook setToast={setToast} />} />
            <Route path="/author/new" element={<NewAuthor setToast={setToast} />} />
            <Route path="/book/edit/:id" element={<EditBook key={location.pathname} setToast={setToast} />} />
            <Route path="/author/edit/:id" element={<EditAuthor key={location.pathname} setToast={setToast} />} />
            <Route path="/admin" element={<Admin setToast={setToast} />} />
            <Route path="/post/new" element={<NewPost setToast={setToast} closeToast={closeToast} />} />
            <Route path="/post/edit/:id" element={<NewPost setToast={setToast} closeToast={closeToast} />} />
            <Route path="/post/:id" element={<Post setToast={setToast} />} />
            <Route path="/posts" element={<Posts/>} />
            <Route path="*" element={<NoMatch />} />
          </Routes>
          {msg &&
            <Toast msg={msg} closeToast={closeToast}></Toast>
          }
          <Footer></Footer>
      </div>
    </>
  )
}

export default App
