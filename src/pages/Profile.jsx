import { useState } from "react"
import { useEffect } from "react"
import NoMatch from "./NoMatch"

function Profile() {
  const [profile, setProfile] = useState()
  const [user, setUser] = useState()
  let search = window.location.href.split('/').at(-1)
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
    fetch("http://localhost:3000/user/"+search, {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(res => res.json()).then(res => {
      console.log(res[0])
      setProfile(res[0])
    })
  }, [])
  return (
    <>
      <div className="px-5 mt-5">
        {profile &&
          <div className="px-5 mt-10 flex justify-center">
            <div className="flex flex-col bg-neutral-700 w-fit p-5 text-slate-200">
                {profile.prof &&
                  <img className="block h-10 w-10 cover-fit w-fit float-left" src={"/public/user_uploads/"+profile.prof}onError={(e) => {
                  e.target.parentElement.innerHTML = `<span class="bg-blue-500 block font-bold flex justify-center items-center h-52 w-52 text-7xl ml-2">${profile.login.slice(0,1).toUpperCase()}</span>`
                  }}></img>
                }
                {!profile.prof &&
                  <span className="bg-blue-500 block font-bold flex justify-center items-center h-52 w-52 text-7xl">{profile.login.slice(0,1).toUpperCase()}</span>
                }
                <h1 className="text-4xl mt-3">{profile.login}</h1>
            </div>
            <div className="w-3/4 ml-5 bg-neutral-700 p-5 text-slate-200">

            </div>
          </div>
        }
        {!profile &&
          <NoMatch></NoMatch>
        }
      </div>
    </>
  )
}

export default Profile
