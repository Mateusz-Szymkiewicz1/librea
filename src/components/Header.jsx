import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Header() {
  const navigator = useNavigate()
  const [user, setUser] = useState()
  const [notifications, setNotifications] = useState([])
  const [notificationsNotSeen, setNotificationsNotSeen] = useState(0)
  const [search, setSearch] = useState("")
  const [autofill, setAutofill] = useState([])
  let path = window.location
  path = path.href.split("/")[3]
  const handleSearch = (e) => {
    if(e.keyCode == 13){
      navigator("/search/"+search)
    }
  }
  useEffect(() => {
    if(search.length < 2){
      setAutofill([...[]])
      return
    }
    fetch("http://localhost:3000/search_autocomplete/"+search).then(res => res.json()).then(res => {
      res.text ? setAutofill([]) : setAutofill([...res])
    })
  }, [search])
  useEffect(() => {
    fetch("http://localhost:3000/login", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(res => res.json()).then(res => {
      if(!res.text){
        fetch("http://localhost:3000/user/"+res, {
          credentials: 'include',
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          }
        }).then(res2 => res2.json()).then(async res2 => {
          if(!res2.text){
            setUser(res2[0])
             fetch("http://localhost:3000/header_notifications", {
                credentials: 'include',
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  user: res2[0].login
                }),
              }).then(res => res.json()).then(res => {
                  res.forEach(el => {
                    if(el.seen == 0){
                      if(notificationsNotSeen > 98){
                        setNotificationsNotSeen("99+")
                      }else{
                        setNotificationsNotSeen(prev => prev+1)
                      }
                    }
                  })
                  setNotifications([...res])
              })
          }
        })
      }
    })
    document.addEventListener("click", function(e){
      if(e.target.classList.contains("suggestion")){
        navigator("/book/"+e.target.dataset.book)
      }
      if(!e.target.classList.contains("profMenu") && !document.querySelector(".dropdown_user").classList.contains("hidden")){
        document.querySelector(".dropdown_user").classList.add("hidden")
      }
      if(!e.target.classList.contains("notifMenu") && !document.querySelector(".dropdown_notifications").classList.contains("hidden")){
        document.querySelector(".dropdown_notifications").classList.add("hidden")
      }
      setAutofill([])
    })
  }, [])
  const wyloguj = () => {
    fetch("http://localhost:3000/signout", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(() => window.location.href = '/')
  }
  const toggleDropdown = () => {
    if(document.querySelector(".dropdown_user").classList.contains("hidden")){
      document.querySelector(".dropdown_user").classList.remove("hidden")
    }else{
      document.querySelector(".dropdown_user").classList.add("hidden")
    }
  }
  const toggleNotifications = () => {
    if(document.querySelector(".dropdown_notifications").classList.contains("hidden")){
      document.querySelector(".dropdown_notifications").classList.remove("hidden")
    }else{
      document.querySelector(".dropdown_notifications").classList.add("hidden")
    }
  }
  const mark_as_seen = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if(e.currentTarget.dataset.eye != "true"){
      navigator(e.currentTarget.dataset.href)
    }
    let notification = notifications.find(x => x.id == e.currentTarget.dataset.notif)
    notification.seen = 1;
    setNotifications([...notifications])
    fetch("http://localhost:3000/mark_as_seen", {
                credentials: 'include',
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: e.currentTarget.dataset.type,
                  id: e.currentTarget.dataset.id
                }),
              })
    setNotificationsNotSeen(prev => prev-1)
  }
  const delete_notification = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setNotifications(notifications.filter(x => x.id != e.currentTarget.dataset.notif))
    fetch("http://localhost:3000/delete_notification", {
                credentials: 'include',
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: e.currentTarget.dataset.type,
                  id: e.currentTarget.dataset.id
                }),
              })
      setNotificationsNotSeen(prev => prev-1)
  }
  return (
    <>
      <div className="text-white w-100 bg-neutral-700 shadow flex flex-row sm:justify-between px-2 items-center p-2 sm:p-0">
          <NavLink to="/"><img src="/icon.png" className="h-16 sm:block hidden"></img></NavLink>   
          <div className="z-40 flex h-11 sm:w-96 w-50 gap-1 relative mr-2">
            <input onKeyUp={handleSearch} type="text" onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full outline-none h-11 bg-neutral-800 text-slate-200 text-sm px-3" />
            <NavLink className="h-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 px-4" to={user ? "/explore" : "/login"}>
              <i className="fa fa-binoculars"></i>
            </NavLink>
            <div className="absolute top-12 right-0 left-0 flex flex-col">
              {autofill.map(el => {
                return (
                  <NavLink to={"/book/"+el.id} key={el.id}><span className="block suggestion bg-neutral-600 p-3 border-b border-neutral-800 hover:bg-neutral-700" data-book={el.id}><img src={"/uploads/"+el.okladka} className="h-10 float-left mr-2 mt-1" onError={(e) => e.target.src = "../../public/default.jpg"}></img><span>{el.tytul}</span><br/><span className="text-neutral-300">{el.autor} - {el.rok}</span></span></NavLink>
                )
              })}
            </div>
          </div>
          <div>
            {user &&
              <>
              <div className="relative flex">
                <span onClick={toggleDropdown} className={path != "notifications" ? "block cursor-pointer" : "block cursor-pointer pr-5"}>
                  {user.prof &&
                    <img className="block h-10 w-10 cover-fit float-left profMenu" src={"/public/user_uploads/profs/"+user.prof} onError={(e) => {
                    e.target.parentElement.innerHTML = `<span className="bg-blue-500 block font-bold hover:bg-blue-600 h-full flex justify-center items-center p-3 text-md ml-2 profMenu">${user.login.slice(0,1).toUpperCase()}</span>`
                    }}></img>
                  }
                  {!user.prof &&
                    <span className="bg-blue-500 block font-bold hover:bg-blue-600 h-full flex justify-center items-center p-3 text-md ml-2 profMenu">{user.login.slice(0,1).toUpperCase()}</span>
                  }
                </span>
                {path != "notifications" &&
                <span onClick={toggleNotifications} className="pr-5 block relative cursor-pointer notifMenu">
                  <i className="bg-blue-500 block font-bold hover:bg-blue-600 h-full flex justify-center items-center p-3 text-md ml-2 fa fa-bell notifMenu"></i>
                  {notificationsNotSeen > 0 &&
                  <span className="absolute top-0 left-0 inline-flex items-center py-0.5 px-1.5 rounded-full text-xs font-medium transform translate-x-1/2 bg-red-500 text-white">{notificationsNotSeen}</span>
                  }
                </span>
                }
                <div className={path != "notifications" ? "bg-neutral-700 z-40 border border-neutral-500 absolute top-16 right-16 p-2 w-52 hidden dropdown_user" : "bg-neutral-700 z-40 border border-neutral-500 absolute top-16 right-5 p-2 w-52 hidden dropdown_user"}>
                  <NavLink to={"profile/"+user.login} onClick={toggleDropdown}><p className="p-3 hover:bg-neutral-600 mb-2"><i className="fa fa-user mr-2"></i>Profile</p></NavLink>
                  <NavLink to="/book/new" onClick={toggleDropdown}><p className="p-3 hover:bg-neutral-600 mb-2"><i className="fa fa-file-circle-plus mr-2"></i>Add a book</p></NavLink>
                  <NavLink to="/author/new" onClick={toggleDropdown}><p className="p-3 hover:bg-neutral-600 mb-2"><i className="fa fa-feather-pointed mr-2"></i>Add an author</p></NavLink>
                  {user.admin == 1 &&
                    <NavLink to="/admin" onClick={toggleDropdown}><p className="p-3 hover:bg-neutral-600 mb-2"><i className="fa fa-user-tie mr-2"></i>Admin Panel</p></NavLink>
                  }
                  <NavLink to={"/settings"} onClick={toggleDropdown}><p className="p-3 hover:bg-neutral-600 mb-2"><i className="fa fa-cogs mr-2"></i>Settings</p></NavLink>
                  <p onClick={wyloguj} className="p-3 cursor-pointer bg-red-500 hover:bg-red-600"><i className="fa fa-sign-out mr-2"></i>Sign out</p>
                </div>
                <div className="bg-neutral-700 z-40 border border-neutral-500 absolute top-16 right-5 p-2 w-80 hidden dropdown_notifications" onClick={(e) => e.stopPropagation()}>
                  {notifications.length == 0 && 
                    <div className="bg-neutral-600 hover:bg-neutral-500 m-1 p-2">No notifications...</div>
                  }
                  {notifications.slice(0,4).map(el => {
                    let link = ""
                    let new_text = el.text
                    let text = el.text.split(" ")
                    let type = ""
                    let id = 0
                    if(el.text[0] == "1"){
                      new_text = el.like_from+" has liked your "+text[text.length-1]
                    }
                    if(el.collection){
                      link = "/collection/"+el.collection.id
                      new_text = <>{new_text+" - "}<span className={el.seen == 1 ? "text-blue-500 italic" : "text-blue-100 italic"}>{el.collection.name}</span></>
                      type = "collection"
                      id = el.collection.id
                    }
                    if(el.quote){
                      link = "/book/"+el.quote.book.id
                      type = "quote"
                      id = el.quote.id
                    }
                    if(el.review){
                      link = "/book/"+el.review.book.id
                      type = "review"
                      id = el.review.id
                    }
                    return(
                      <NavLink data-href={link} onClick={mark_as_seen} data-notif={el.id} data-id={id} data-type={type} key={el.id} to={link}><div className={el.seen == 1 ? "bg-neutral-600 hover:bg-neutral-500 m-1 p-2" : "bg-blue-600 hover:bg-blue-500 m-1 p-2"}>{new_text}
                      {el.quote &&
                        <> on <span className={el.seen == 1 ? "text-blue-500 italic" : "text-blue-100 italic"}>{el.quote.book.tytul}</span></>
                      }
                      {el.review &&
                        <> on <span className={el.seen == 1 ? "text-blue-500 italic" : "text-blue-100 italic"}>{el.review.book.tytul}</span></>
                      }
                      <div className="flex clear-both gap-3">
                      {el.seen == 0 &&
                        <div data-eye="true" onClick={mark_as_seen} data-notif={el.id} data-id={id} data-type={type}><i className="fa fa-eye mt-2 mr-1"></i>Mark as seen</div>
                      }
                      <div onClick={delete_notification} data-notif={el.id} data-id={id} data-type={type}><i className="fa fa-trash mt-2 mr-1"></i>Delete</div>
                      </div>
                      </div></NavLink>
                    )
                  })}
                  {notifications.length > 5 &&
                    <NavLink to={"/notifications/"+user.login}><div className="bg-blue-600 text-center hover:bg-blue-500 m-1 p-2"><i className="fa fa-plus mr-2"></i>See more</div></NavLink>
                  }
                </div>
              </div>
              </>
            }
            {!user &&
              <NavLink to="/login"><span className="pr-5 block"><i className="fa fa-user bg-blue-500 hover:bg-blue-600 py-3.5 text-md ml-2 px-4"></i></span></NavLink>
            }
          </div>
      </div>
    </>
  )
}

export default Header
