import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"
import NoMatch from "./NoMatch"

function Collection() {
  let id = window.location.href.split('/').at(-1)
  const [collection, setCollection] = useState()
  const [user, setUser] = useState()
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
          },
          body: JSON.stringify({
            collection: id
          })
        }).then(res2 => res2.json()).then(async res2 => {
          if(!res2.text){
            setUser(res2[0])
          }
        })
      }
    })
    fetch("http://localhost:3000/collection/"+id).then(res => res.json()).then(async res => {
      if(!res.text){
        res[0].books = JSON.parse(res[0].books)
        for (let [index,book] of res[0].books.entries()) {
          const bookRes = await fetch("http://localhost:3000/book/"+book.id)
          const bookData = await bookRes.json();
          res[0].books[index] = bookData[0];
        }
        setCollection(res[0])
      }
    })
  }, [])
  const like = (e) => {
    let link = ""
    if(e.target.classList.contains("fa-regular")){
      e.target.classList.remove("fa-regular")
      e.target.classList.add("fa-solid")
      link = "collection_like"
      let likes = parseInt(e.target.parentElement.querySelector("span").innerHTML)
      e.target.parentElement.querySelector("span").innerHTML = likes+1
    }else{
      e.target.classList.remove("fa-solid")
      e.target.classList.add("fa-regular")
      link = "collection_unlike"
      let likes = parseInt(e.target.parentElement.querySelector("span").innerHTML)
      e.target.parentElement.querySelector("span").innerHTML = likes-1
    }
    fetch("http://localhost:3000/"+link, {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collection: id
      }),
    })
  }
  return (
    <>
      {collection &&
        <div className="px-5 mt-10">
          <h1 className="text-slate-200 text-3xl flex justify-between"><span>{collection.name}</span><div>
            <span className="text-slate-200 text-2xl">{collection.likes}</span>
            {!user &&
              <NavLink to={"/login"}><i className="fa-regular ml-3 fa-heart text-2xl cursor-pointer"></i></NavLink>
            }
            {user && user.collections_likes.find(x => x.collection == id) &&
              <i className="fa-solid ml-3 fa-heart text-2xl cursor-pointer" onClick={like}></i>
            }
            {user && !user.collections_likes.find(x => x.collection == id) &&
              <i className="fa-regular ml-3 fa-heart text-2xl cursor-pointer" onClick={like}></i>
            }
          </div></h1>
          <NavLink to={"/profile/"+collection.user}><h2 className="text-neutral-400 text-2xl float-left">by: <span className="text-blue-500">{collection.user}</span></h2></NavLink>
          <p className="text-neutral-400 text-xl mt-10">{collection.description}</p>
          <div className="my-6 flex flex-col clear-both">
          {collection.books.map((el,i) => {
            return (
              <NavLink to={"/book/"+el.id} key={el.id} className="bg-neutral-700 text-white p-3 mt-4 hover:bg-neutral-600">
                <img src={"/uploads/"+el.okladka} className="h-64 sm:float-left mr-3 mb-2"></img>
                <div>
                <h2 className="text-2xl break-keep">{el.tytul}</h2>
                <p className="text-neutral-300 text-lg">{el.autor}</p>
                <p className="text-neutral-300 text-lg">{el.rok}</p>
                <div className="flex my-2">
                  <svg className="w-6 h-6 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                    </svg>
                    {el.ilosc_ocen > 0 &&
                      <span className="ms-2 text-md font-bold text-gray-900 dark:text-white">{ (el.suma_ocen/el.ilosc_ocen).toFixed(1) }</span>
                    }
                    {el.ilosc_ocen == 0 &&
                      <span className="ms-2 text-md font-bold text-gray-900 dark:text-white">No ratings</span>
                    }
                  </div>
                <p className="text-neutral-200 text-lg mt-3 pr-5">{el.opis.slice(0,200)+"..."}</p>
                </div>
              </NavLink>
            )
          })}
          </div>
        </div>
      }
      {!collection &&
        <NoMatch></NoMatch>
      }
    </>
  )
}

export default Collection
