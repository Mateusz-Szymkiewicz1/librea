import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"

function Search() {
  const [wyniki, setWyniki] = useState([])
  const [filtered, setFiltered] = useState([])
  let search = window.location.href.split('/').at(-1)
  useEffect(() => {
    fetch("http://localhost:3000/search/"+search).then(res => res.json()).then(res => {
      setWyniki([...res])
      setFiltered([...res])
    })
  }, [])
  return (
    <>
      <div className="sm:px-10 px-3 mt-10">
        <h1 className="text-white text-3xl">Results for "{search}" ({filtered.length}):</h1>
        {filtered.length == 0 &&
          <h1 className="text-neutral-400 text-2xl pt-2">Sorry, we didn't find anything. Try searching something different</h1>
        }
        <div className="my-6 flex flex-col">
          {filtered.map(el => {
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
    </>
  )
}

export default Search
