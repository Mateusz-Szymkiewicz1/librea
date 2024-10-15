import { useState } from "react"
import { useEffect } from "react"
import NoMatch from "./NoMatch"
import { NavLink } from "react-router-dom"

function Profile() {
  const [profile, setProfile] = useState()
  const [user, setUser] = useState()
  const [loading, setLoading] = useState(true)
  const [collectionLimit, setCollectionLimit] = useState(10)
  const [recentlyrated, setRecentlyrated] = useState([])
  const [recentreviews, setRecentreviews] = useState([])
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
      if(res[0]){
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
        if(res[0].ratings){
          res[0].ratings.slice(-5).reverse().forEach(el => {
            fetch("http://localhost:3000/book/"+el.book).then(res2 => res2.json()).then(res2 => {
              if(!res2.text){
                setRecentlyrated([...recentlyrated, res2[0]])
              }
            })
          })
        }
        if(res[0].reviews){
          res[0].reviews.slice(-5).reverse().forEach(el => {
            fetch("http://localhost:3000/book/"+el.book).then(res2 => res2.json()).then(res2 => {
              if(!res2.text){
                setRecentreviews([...recentreviews, res2[0]])
              }
            })
          })
        }
      }
      setLoading(false)
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
            <div className="w-full sm:w-3/4 bg-neutral-700 mb-10 p-3 text-slate-200">
            {profile.collections.length == 0 &&
            <>
              <p className='text-slate-200 text-2xl ml-5 mt-5'>Collections</p>
              <p className='text-neutral-400 text-xl ml-5 mt-2'>Nothing here...</p>
            </>
          }
          {profile.collections.length > 0 &&
            <>
            <p className='text-slate-200 text-2xl ml-5 mt-5'>Collections</p>
            <div className='flex flex-wrap gap-5 ml-5 my-3 mb-4'>
            {profile.collections.slice(0,collectionLimit).map(el => {
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
            {collectionLimit < profile.collections.length &&
              <button className='bg-blue-600 text-white px-10 text-lg p-3 mb-4 ml-5 block hover:bg-blue-700' onClick={() => setCollectionLimit(val => val+10)}>See more</button>
            }
            </>
          }
          {profile.ratings.length > 0 &&
            <>
              <p className='text-slate-200 text-2xl ml-5 mt-16'>Recently rated</p>
              <div className='flex flex-wrap gap-5 ml-5 my-3 mb-10'>
                {recentlyrated.map((el,i) => 
                <NavLink to={"/book/"+el.id} key={i}><div className='bg-neutral-600 hover:bg-neutral-500 p-5'>
                  <img className="h-72 border border-neutral-500" src={"../../public/uploads/"+el.okladka} onError={(e) => e.target.src = "../../public/default.jpg"}></img>
                  <p className="text-white mt-3 text-xl">{el.tytul}</p>
                  <p className="text-slate-200 mt-1 text-lg">{el.autor}</p>
                </div></NavLink>)}
              </div>
            </>
          }
          {profile.reviews.length > 0 &&
            <>
              <p className='text-slate-200 text-2xl ml-5 mt-16'>Recent reviews</p>
              <div className='flex flex-wrap gap-5 ml-5 my-3 mb-10'>
                {recentreviews.map((el,i) => 
                <NavLink to={"/book/"+el.id} key={i}><div className='bg-neutral-600 hover:bg-neutral-500 p-5'>
                  <img className="h-72 border border-neutral-500" src={"../../public/uploads/"+el.okladka} onError={(e) => e.target.src = "../../public/default.jpg"}></img>
                  <p className="text-white mt-3 text-xl">{el.tytul}</p>
                  <p className="text-slate-200 mt-1 text-lg">{el.autor}</p>
                </div></NavLink>)}
              </div>
            </>
          }
            </div>
          </div>
        }
        {!profile && !loading &&
          <NoMatch></NoMatch>
        }
        {!profile && loading &&
        <div role="status" className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-neutral-800 z-50">
        <svg aria-hidden="true" className="inline w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        </div>
      }
      </div>
    </>
  )
}

export default Profile
