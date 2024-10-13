import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"
import NoMatch from "./NoMatch"
import { useDecision } from "../components/useDecision"

function Collection() {
  let id = window.location.href.split('/').at(-1)
  const [collection, setCollection] = useState()
  const [user, setUser] = useState()
  const [msg, setMsg] = useState()
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")
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
            console.log(res2[0])
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
  const deleteBook = async (ev) => {
    ev.preventDefault()
    ev.stopPropagation();
    ev.nativeEvent.stopImmediatePropagation()
    if(collection.books.length < 2){
      setMsg({type: "error", text: "You can't have an empty collection!"})
      return;
    }
    if (document.querySelector(".decision")) document.querySelector('.decision').remove()
      const response = await useDecision().then(function () {
          document.querySelector(".decision").remove()
          return
      }, function () {
          document.querySelector(".decision").remove()
          return "stop"
      });
      if(response) return
    let new_books = collection.books.filter(x => x.id != ev.target.dataset.book)
    let new_books_id = []
    new_books.forEach(el => {
      new_books_id.push({id: el.id})
    })
    fetch("http://localhost:3000/collection_delete_book", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        books: new_books_id,
        collection: collection.id
      }),
    }).then(res => {
      collection.books = new_books
      setMsg({type: "msg", text: "Deleted a book!"})
      setCollection(structuredClone(collection))
    })
  }
  const editInfo = async () => {
    if(editName.length < 1){
      setMsg({type: "error", text: "Collection's name is required!"})
      return;
    }
    if (document.querySelector(".decision")) document.querySelector('.decision').remove()
      const response = await useDecision().then(function () {
          document.querySelector(".decision").remove()
          return
      }, function () {
          document.querySelector(".decision").remove()
          return "stop"
      });
      if(response) return
      console.log("done")
  }
  const closeEdit = () => {
    document.querySelector('.edit').classList.add("hidden")
  }
  const showEdit = () => {
    document.querySelector('.edit').classList.remove("hidden")
  }
  return (
    <>
      {collection &&
      <>
        <div className="px-5 mt-10">
          <h1 className="text-slate-200 text-3xl flex justify-between"><span>{collection.name}<i className="fa fa-pencil ml-2 text-amber-500 cursor-pointer text-2xl" onClick={showEdit}></i></span><div>
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
                <h2 className="text-2xl break-keep">{el.tytul}
                  {user && user.login == collection.user &&
                    <i onClick={deleteBook} data-book={el.id} className="fa fa-trash ml-2 text-red-500 sm:float-right"></i>
                  }
                </h2>
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
        <div className="edit hidden absolute top-0 bottom-0 right-0 left-0 bg-neutral-800 flex justify-center items-center" style={{background: "rgba(50,50,50,0.9)"}}>
        <div className="bg-neutral-700 p-5 pb-8 text-white">
          <div className="flex justify-between">
            <h1 className="text-xl font-semibold">Edit info</h1>
            <i className="fa fa-close mr-1 text-xl cursor-pointer" onClick={closeEdit}></i>
          </div>
          <input type="text" value={collection.name} onChange={(e) => setEditName(e.target.value)} className="mt-4 outline-none text-lg border text-sm rounded-lg block sm:w-96 w-64 p-2.5 bg-neutral-600 border-neutral-500 placeholder-gray-400 text-white" placeholder="Name" maxLength={200}/>
        <input type="text" value={collection.description}  onChange={(e) => setEditDesc(e.target.value)} className="mt-4 outline-none text-lg border text-sm rounded-lg block w-full p-2.5 bg-neutral-600 border-neutral-500 placeholder-gray-400 text-white" placeholder="Description" maxLength={1000}/> 
        <button className='bg-blue-600 text-white px-10 text-lg p-3 mt-5 block hover:bg-blue-700' onClick={editInfo}>Edit</button>
        </div>
      </div>
      </>
      }
      {!collection &&
        <NoMatch></NoMatch>
      }
      {msg &&
      <>
          <div className="fixed bottom-4 z-50 right-4 min-w-64">
            <div className={"flex justify-between rounded-lg shadow-lg p-4 border "+(msg.type == "error" ? "bg-red-500 border-red-600" : "bg-green-500 border-green-600")}>
                <p className="text-white text-lg mr-5 dark:text-slate-200">
                { msg.text }
                </p>
                <button onClick={() => setMsg()} className="text-white dark:text-slate-200 focus:outline-none">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
          </div>
        </>
      }
    </>
  )
}

export default Collection
