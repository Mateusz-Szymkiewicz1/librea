import { useEffect, useState } from "react"
import NoMatch from "./NoMatch"
import BookCard from "../components/BookCard"
import { NavLink, useNavigate } from "react-router-dom"
import { useDecision } from "../components/useDecision"

function Author(props) {
  const navigator = useNavigate()
  const author_id = window.location.href.split('/').at(-1).split("#")[0]
  const [refresh, setRefresh] = useState(true)
  const [author, setAuthor] = useState({})
  const [loading, setLoading] = useState(true)
  const [shownBooks, setShownBooks] = useState(8)
  const [user, setUser] = useState()
  useEffect(() => {
    fetch("http://localhost:3000/author/"+author_id, {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(res => res.json()).then(res => {
      console.log(res[0])
      if(!res.text){
        if(res[0].books){
        res[0].all_ratings = res[0].books[res[0].books.length-1].ilosc_ocen
        res[0].sum_all_ratings = res[0].books[res[0].books.length-1].suma_ocen
        res[0].books.pop()
        }else{
          res[0].all_ratings = 0
        }
        setAuthor(res[0])
        document.title = `${res[0].names[0]} | Librea`
      }
      setLoading(false)
    })
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
  }, [refresh])
  const deleteAuthor = async () => {
    if (document.querySelector(".decision")) document.querySelector('.decision').remove()
      const response = await useDecision().then(function () {
          document.querySelector(".decision").remove()
          return
      }, function () {
          document.querySelector(".decision").remove()
          return "stop"
      });
      if(response) return
      fetch("http://localhost:3000/delete_author", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: author.id
        })
      }).then(res => res.json()).then(res => {
        navigator("/")
        props.setToast({type:"msg", text:"Deleted an author!", stay: true})
      })
  }
  return (
    <>
      {author && author.id && !loading &&
        <>
        <div className="sm:pl-5 pl-3">
          <img className="sm:mt-10 mt-5 float-left mr-10 w-96 border border-neutral-700 shadow-lg" src={"../../public/uploads/authors/"+author.photo} onError={(e) => e.target.src = "../../public/default.jpg"}></img>
              <div className="float-left mt-10 mr-10 text-slate-200">
                <h1 className="text-white text-4xl">{author.names[0]}</h1>
                <div className="flex">
                {author.names.map((name, i) => {
                  if(i == 0) return
                  if(i == 1){
                    return(
                      <p key={i} className="text-slate-200 text-xl mt-3 text-neutral-300">{name}</p>
                    )
                  }
                  return(
                    <p key={i} className="text-slate-200 text-xl mt-3 text-neutral-300">, {name}</p>
                  )
                })}
                </div>
                <p className="text-white text-2xl mt-3 text-neutral-300">{author.birth} - {author.death}</p>
                <div className="flex items-center mt-5">
                  <svg className="w-6 h-6 text-yellow-300 me-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                  </svg>
                  <p className="mx-1 text-md font-bold text-gray-900 dark:text-white">Average book rating: </p>
                  {author.all_ratings > 0 &&
                    <p className="ms-2 text-md font-bold text-gray-900 dark:text-white">{ (author.sum_all_ratings/author.all_ratings).toFixed(1) } ({author.all_ratings})</p>
                  }
                  {author.all_ratings == 0 &&
                    <p className="ms-2 text-md font-bold text-gray-900 dark:text-white">No ratings</p>
                  }
                </div>
              </div>
              <p className="clear-both text-slate-200 mr-16 py-10">{author.description.length > 0 ? author.description : "No description yet..."}</p>
              </div>
              <div className='mx-3 sm:mx-5'>
                {user && user.admin == 1 &&
                  <div>
                    <NavLink to={"/author/edit/"+author.id}><button className='shadow bg-red-600 text-white px-10 text-lg p-3 mb-3  hover:bg-red-700'><i className="fa fa-pencil mr-3"></i>Edit author info</button></NavLink>
                    <button onClick={deleteAuthor} className='shadow bg-red-600 text-white px-10 text-lg p-3 mb-10 block hover:bg-red-700'><i className="fa fa-trash mr-3"></i>Delete author</button>
                  </div>
                }
                {author.books.length > 0 &&
                    <>
                      <p className='text-slate-200 font-semibold text-2xl mt-16'>Books ({author.books.length})</p>
                      <div className='flex flex-wrap gap-5 my-3 mb-20'>
                        {author.books.sort((a,b) => b.ilosc_ocen - a.ilosc_ocen).slice(0,shownBooks).map((el,i) => 
                          <BookCard book={el} key={el.id}></BookCard>
                        )}
                        {author.books.length > shownBooks &&
                          <div onClick={(e) => setShownBooks(prev => prev+8)} className="bg-blue-500 hover:bg-blue-600 p-5 text-xl flex cursor-pointer items-center">
                            <span><i class="fa-solid fa-right-to-bracket mr-2"></i>Load more</span>
                          </div>
                        }
                      </div>
                    </>
                  }
              </div>
        </>
      }
      {loading &&
        <div role="status" className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-neutral-800 z-50">
        <svg aria-hidden="true" className="inline w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        </div>
      }
      {!author || !author.id && !loading &&
        <NoMatch></NoMatch>
      }
    </>
  )
}

export default Author
