import { useState } from "react";
import { NavLink } from "react-router-dom";

function Header() {
  const [user, setUser] = useState("")
  fetch("http://localhost:3000/login", {
    credentials: 'include',
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    }
  }).then(res => res.json()).then(res => {
    if(!res.text){
      setUser(res)
    }
  })
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
          <div className="flex h-11 sm:w-96 w-50">
            <input type="text" placeholder="Search..." className="w-full outline-none h-11 bg-neutral-800 text-slate-200 text-sm px-3" />
            <button type='button' className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 px-4">
              <i className="fa fa-binoculars"></i>
            </button>
          </div>
          <div>
            {user &&
              <>
              <div className="relative">
                <span onClick={toggleDropdown} className="pr-5 block cursor-pointer"><span className="bg-blue-500 block font-bold hover:bg-blue-600 h-full flex justify-center items-center p-3 text-md ml-2">{user.slice(0,1).toUpperCase()}</span></span>
                <div className="bg-neutral-700 absolute top-16 right-5 p-2 w-32 hidden dropdown_user">
                  <NavLink to="/profile" onClick={toggleDropdown}><p className="p-3 hover:bg-neutral-600 mb-2"><i className="fa fa-user mr-2"></i>Profile</p></NavLink>
                  <p onClick={toggleDropdown} className="p-3 cursor-pointer bg-red-500 hover:bg-red-600"><i className="fa fa-sign-out mr-2"></i>Sign out</p>
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
