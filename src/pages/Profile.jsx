import { useState } from "react"
import { useEffect } from "react"
import NoMatch from "./NoMatch"
import { NavLink } from "react-router-dom"

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
      if(res[0].collections){
        res[0].collections.forEach(el => {
          el.books = JSON.parse(el.books)
          el.books.forEach(book => {
            fetch("http://localhost:3000/book/"+book.id).then(res2 => res2.json()).then(res2 => {
              if(!res2.text){
                book.okladka = res2[0].okladka
                setProfile(structuredClone(res[0]))
              }
            })
          })
        })
      }
    })
  }, [])
  return (
    <>
      <div className="px-5 mt-5">
        {profile &&
          <div className="px-5 mt-10 flex flex-col gap-5 sm:flex-row justify-center">
            <div className="flex flex-col bg-neutral-700 h-fit w-fit p-5 text-slate-200">
                {profile.prof &&
                  <img className="block h-52 w-52 cover-fit w-fit float-left" src={"/public/user_uploads/"+profile.prof}onError={(e) => {
                  e.target.parentElement.innerHTML = `<span class="bg-blue-500 block font-bold flex justify-center items-center h-24 w-24 md:h-52 md:w-52 text-2xl md:text-7xl ml-2">${profile.login.slice(0,1).toUpperCase()}</span>`
                  }}></img>
                }
                {!profile.prof &&
                  <span className="bg-blue-500 block font-bold flex justify-center items-center h-24 w-24 md:h-52 md:w-52 text-2xl md:text-7xl">{profile.login.slice(0,1).toUpperCase()}</span>
                }
                <h1 className="text-4xl mt-3">{profile.login}</h1>
            </div>
            <div className="w-full sm:w-3/4 bg-neutral-700 p-3 text-slate-200">
            {profile.collections.length == 0 &&
            <>
              <p className='text-slate-200 text-2xl ml-5 mt-5'>Collections</p>
              <p className='text-neutral-400 text-xl ml-5 mt-2'>Nothing here...</p>
            </>
          }
          {profile.collections.length > 0 &&
            <>
            <p className='text-slate-200 text-2xl ml-5 mt-5'>Collections</p>
            <div className='flex flex-wrap gap-5 ml-5 my-3 mb-20'>
            {profile.collections.map(el => {
              return (
                <NavLink to={"/collection/"+el.id} key={el.id}><div className='bg-neutral-600 hover:bg-neutral-500 p-5'>
                  <div className='grid grid-cols-2'>
                  <img className="h-20 w-20 object-cover border border-neutral-500" src={"../../public/uploads/"+el.books[0].okladka} onError={(e) => e.target.src = "../../public/default.jpg"}></img>
                  {el.books.length > 1 &&
                    <img className="h-20 w-20 object-cover border border-neutral-500" src={"../../public/uploads/"+el.books[1].okladka} onError={(e) => e.target.src = "../../public/default.jpg"}></img>
                  }
                  {el.books.length > 2 &&
                    <img className="h-20 w-20 object-cover border border-neutral-500" src={"../../public/uploads/"+el.books[2].okladka} onError={(e) => e.target.src = "../../public/default.jpg"}></img>
                  }
                  {el.books.length > 3 &&
                    <img className="h-20 w-20 object-cover border border-neutral-500" src={"../../public/uploads/"+el.books[3].okladka} onError={(e) => e.target.src = "../../public/default.jpg"}></img>
                  }
                  {el.books.length == 1 &&
                    <>
                    <img className="h-20 w-20 object-cover border border-neutral-500" src="../../public/default.jpg"></img>
                    <img className="h-20 w-20 object-cover border border-neutral-500" src="../../public/default.jpg"></img>
                    <img className="h-20 w-20 object-cover border border-neutral-500" src="../../public/default.jpg"></img>
                    </>
                  }
                  {el.books.length == 2 &&
                    <>
                    <img className="h-20 w-20 object-cover border border-neutral-500" src="../../public/default.jpg"></img>
                    <img className="h-20 w-20 object-cover border border-neutral-500" src="../../public/default.jpg"></img>
                    </>
                  }
                  {el.books.length == 3 &&
                    <>
                    <img className="h-20 w-20 object-cover border border-neutral-500" src="../../public/default.jpg"></img>
                    </>
                  }
                  </div>
                  <p className="text-white mt-3 text-xl">{el.name}</p>
                  <p className="text-slate-200 mt-1 text-lg">by: {el.user}</p>
                </div></NavLink>)
            })}
            </div>
            </>
          }
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
