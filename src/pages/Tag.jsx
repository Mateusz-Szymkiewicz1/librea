import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"
import ReactPaginate from "react-paginate"

function Tag() {
  let tag = window.location.href.split('/').at(-1).split("#")[0]
  const [wyniki, setWyniki] = useState([])
  const [sort, setSort] = useState("id")
  const [sortDirection, setSortDirection] = useState("ASC")
  const [changedManually, setChangedManually] = useState(false)
  const [offset, setOffset] = useState(0)
  const [resultsCount, setResultsCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)
  useEffect(() => {
    fetch("http://localhost:3000/tag/"+tag, {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tag: tag,
        sort: sort,
        direction: sortDirection,
        offset: offset
      })
    }).then(res => res.json()).then(res => {
      if(res.text){
        setResultsCount(0)
        setWyniki([])
        return;
      }
      if(changedManually == false && sortDirection == "ASC" && (sort == "popularity" || sort == "rating")){
        switchSortDirection()
      }
      setResultsCount(res[0].resultsCount)
      res.shift()
      setWyniki([...res])
    })
  }, [sort, sortDirection, offset])
  useEffect(() => {
    if(sortDirection == "DESC"){
      switchSortDirection()
      setChangedManually(false)
    }
  }, [sort])
  const switchSortDirection = () => {
    setChangedManually(true)
    let el = document.querySelector(".direction")
    if(sortDirection == "ASC"){
      setSortDirection("DESC")
      el.classList.remove("fa-arrow-down-short-wide")
      el.classList.add("fa-arrow-up-wide-short")
    } else {
      setSortDirection("ASC")
      el.classList.add("fa-arrow-down-short-wide")
      el.classList.remove("fa-arrow-up-wide-short")
    }
  }
  useEffect(() => {
    setPages(Math.ceil(resultsCount/15))
  }, [resultsCount])
   const pageChange = (e) => {
    setOffset(e.selected*15)
    setCurrentPage(e.selected+1)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
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
          <div className="flex gap-3 flex-wrap items-center">
            <select className="border text-sm rounded-lg outline-none block w-48 p-2.5 bg-neutral-600 border-gray-600 placeholder-gray-400 text-white" onChange={(e) => setSort(e.target.value)}>
              <option defaultValue="id">Sort by: Default</option>
              <option value="title">Sort by: Title</option>
              <option value="author">Sort by: Author</option>
              <option value="rating">Sort by: Rating</option>
              <option value="popularity">Sort by: Popularity</option>
            </select>  
            <i onClick={switchSortDirection} className="direction fa-solid fa-arrow-down-short-wide text-2xl cursor-pointer"></i>   
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
           {pages > 1 &&
            <>
              <ReactPaginate
                breakLabel="..."
                nextLabel="Next"
                pageRangeDisplayed={5}
                pageCount={pages}
                previousLabel="Previous"
                renderOnZeroPageCount={null}
                onPageChange={pageChange}
                className="flex gap-3 mr-3 my-8"
                nextLinkClassName="cursor-pointer bg-blue-500 w-8 text-slate-200 h-8 text-lg flex justify-center items-center p-5 px-10 hover:bg-blue-600"
                previousLinkClassName="cursor-pointer bg-blue-500 w-8 text-slate-200 h-8 text-lg flex justify-center items-center p-5 px-12 hover:bg-blue-600"
                pageLinkClassName="cursor-pointer bg-blue-500 block p-5 flex justify-center items-center w-8 text-slate-200 h-8 text-xl hover:bg-blue-600"
                activeClassName="brightness-125"
              />
            </>
          }
        </div>
      </div>
    </>
  )
}

export default Tag
