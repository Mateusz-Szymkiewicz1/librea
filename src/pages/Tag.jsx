import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"

function Tag() {
  let tag = window.location.href.split('/').at(-1).split("#")[0]
  const [wyniki, setWyniki] = useState([])
  const [sort, setSort] = useState("id")
  return (
    <>
      <div className="sm:px-5 px-3 mt-10 min-h-screen">
        <h1 className="text-white text-3xl">Books with "{tag}" tag ({wyniki.length}):</h1>
        {wyniki.length == 0 &&
          <>
          <h1 className="text-neutral-400 text-2xl pt-2">Sorry, we didn't find anything. Try looking for something different</h1>
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
          </div>
        </div>
      </div>
    </>
  )
}

export default Tag
