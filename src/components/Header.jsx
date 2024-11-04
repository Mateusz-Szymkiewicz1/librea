import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Header() {
  const navigator = useNavigate()
  const [user, setUser] = useState()
  const [search, setSearch] = useState("")
  const [autofill, setAutofill] = useState([])
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
      if(res.text){
        setAutofill([])
      }else{
        setAutofill([...res])
      }
    })
  }, [search])
  useEffect(() => {
    document.addEventListener("click", function(e){
      if(e.target.classList.contains("suggestion")){
        navigator("/book/"+e.target.dataset.book)
      }
      if(!e.target.classList.contains("profMenu") && !document.querySelector(".dropdown_user").classList.contains("hidden")){
        document.querySelector(".dropdown_user").classList.add("hidden")
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
          }
        })
      }
    })
  }, [])
  const toggleDropdown = () => {
    if(document.querySelector(".dropdown_user").classList.contains("hidden")){
      document.querySelector(".dropdown_user").classList.remove("hidden")
    }else{
      document.querySelector(".dropdown_user").classList.add("hidden")
    }
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
              <div className="relative">
                <span onClick={toggleDropdown} className="pr-5 block cursor-pointer">
                  {user.prof &&
                    <img className="block h-10 w-10 cover-fit float-left profMenu" src={"/public/user_uploads/profs/"+user.prof} onError={(e) => {
                    e.target.parentElement.innerHTML = `<span class="bg-blue-500 block font-bold hover:bg-blue-600 h-full flex justify-center items-center p-3 text-md ml-2 profMenu">${user.login.slice(0,1).toUpperCase()}</span>`
                    }}></img>
                  }
                  {!user.prof &&
                    <span className="bg-blue-500 block font-bold hover:bg-blue-600 h-full flex justify-center items-center p-3 text-md ml-2 profMenu">{user.login.slice(0,1).toUpperCase()}</span>
                  }
                </span>
                <div className="bg-neutral-700 border border-neutral-500 absolute top-16 right-5 p-2 w-40 hidden dropdown_user">
                  <NavLink to={"profile/"+user.login} onClick={toggleDropdown}><p className="p-3 hover:bg-neutral-600 mb-2"><i className="fa fa-user mr-2"></i>Profile</p></NavLink>
                  <NavLink to="/book/new" onClick={toggleDropdown}><p className="p-3 hover:bg-neutral-600 mb-2"><i className="fa fa-file-circle-plus mr-2"></i>Add a book</p></NavLink>
                  {user.admin == 1 &&
                    <NavLink to="/admin" onClick={toggleDropdown}><p className="p-3 hover:bg-neutral-600 mb-2"><i className="fa fa-user-tie mr-2"></i>Admin Panel</p></NavLink>
                  }
                  <NavLink to={"/settings"} onClick={toggleDropdown}><p className="p-3 hover:bg-neutral-600 mb-2"><i className="fa fa-cogs mr-2"></i>Settings</p></NavLink>
                  <p onClick={wyloguj} className="p-3 cursor-pointer bg-red-500 hover:bg-red-600"><i className="fa fa-sign-out mr-2"></i>Sign out</p>
                </div>
              </div>
              </>
            }
            {!user &&
              <NavLink to="/login"><span className="pr-5 block"><i className="fa fa-user bg-blue-500 hover:bg-blue-600 py-3.5 px-2 text-md ml-2 sm:px-4"></i></span></NavLink>
            }
          </div>
      </div>
    </>
  )
}

export default Header
