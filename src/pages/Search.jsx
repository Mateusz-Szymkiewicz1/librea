import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"
import Multiselect from "multiselect-react-dropdown"

function Search() {
  const [wyniki, setWyniki] = useState([])
  const [sort, setSort] = useState("id")
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [user,setUser] = useState()
  let search = window.location.href.split('/').at(-1).split("#")[0]
  useEffect(() => {
    fetch("http://localhost:3000/login", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(res => res.json()).then(res => {
      if(!res.text){
        setUser(res[0])
      }
    })
    fetch("http://localhost:3000/search", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        search: search,
        sort: sort,
        tags: selectedTags
      })
    }).then(res => res.json()).then(res => {
      if(res.text){
        setWyniki([])
        return;
      }
      setWyniki([...res])
    })
  }, [sort, selectedTags])
  useEffect(() => {
    fetch("http://localhost:3000/tags").then(res => res.json()).then(res => {
      res.tags = JSON.parse(res.tags)
      setTags(res.tags)
    })
  }, [])
  return (
    <>
      <div className="sm:px-5 px-3 mt-10">
        <h1 className="text-white text-3xl">Results for "{search}" ({wyniki.length}):</h1>
        {wyniki.length == 0 &&
          <>
          <h1 className="text-neutral-400 text-2xl pt-2">Sorry, we didn't find anything. Try searching something different</h1>
          {user &&
            <>
            <p className="text-lg text-neutral-200 mt-5">No book you're looking for? Add a new one to our database!</p>
            <NavLink to="/book/new"><button className='shadow float-left bg-blue-600 text-white px-10 text-lg p-3 mb-4 mt-4 block hover:bg-blue-700'><i className="fa-solid fa-file-circle-plus mr-3"></i>Add a book</button></NavLink>
            </>
          }
          </>
        }
        <div className="my-6 flex flex-col clear-both">
          <div className="flex gap-3 flex-wrap">
          <select className="border text-sm rounded-lg outline-none block w-48 p-2.5 bg-neutral-600 border-gray-600 placeholder-gray-400 text-white" onChange={(e) => setSort(e.target.value)}>
            <option defaultValue="id">Sort by: Default</option>
            <option value="title">Sort by: Title</option>
            <option value="author">Sort by: Author</option>
            <option value="rating">Sort by: Rating</option>
            </select>     
              <Multiselect
                isObject={false}
                options={tags}
                onSelect={(e) => setSelectedTags([...e])}
                onRemove={(e) => setSelectedTags([...e])}
                placeholder="Tags"
                emptyRecordMsg="No tags found"
                style={{
                  multiselectContainer: {
                    background: "#525252",
                    borderRadius: "10px",
                    border: "1px solid #505050",
                    padding: "3px",
                    color: "#fff",
                    paddingTop: "0"
                  },
                  searchBox: {
                    border: 'none'
                  }
                }}
              />
            </div>
          {wyniki.map(el => {
            return (
              <NavLink to={"/book/"+el.id} key={el.id} className="shadow-lg bg-neutral-700 text-white p-3 mt-4 hover:bg-neutral-600">
                <img onError={(e) => e.target.src = "../../public/default.jpg"} src={"/uploads/"+el.okladka} className="h-64 sm:float-left mr-3 mb-2"></img>
                <div>
                <h2 className="text-2xl break-keep">{el.tytul}</h2>
                <p className="text-neutral-300 text-lg">{el.autor}</p>
                <p className="text-neutral-300 text-lg">{el.rok}</p>
                <div className="flex my-2">
                  <svg className="w-6 h-6 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                    </svg>
                    {el.ilosc_ocen > 0 &&
                      <span className="ms-2 text-md font-bold text-gray-900 dark:text-white">{ (el.suma_ocen/el.ilosc_ocen).toFixed(1) } ({el.ilosc_ocen})</span>
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
