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
  const [search, setSearch] = useState("")
  const [autofill, setAutofill] = useState([])
  const [loading, setLoading] = useState(true)
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
        setEditDesc(res[0].description)
        setEditName(res[0].name)
      }
      setLoading(false)
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
      setMsg({type: "error", text: "New collection's name is required!"})
      return;
    }
    if(editName == collection.name && editDesc == collection.description){
      setMsg({type: "error", text: "You didn't even change anything!"})
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
      fetch("http://localhost:3000/collection_edit_info", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
          desc: editDesc,
          collection: id
        })
      }).then(res => {
        collection.name = editName;
        collection.description = editDesc;
        setCollection(structuredClone(collection))
        setMsg({type: "msg", text: "Edited collection's info!"})
        closeEdit()
      })
  }
  const closeEdit = () => {
    document.querySelector('.edit').classList.add("hidden")
  }
  const showEdit = () => {
    document.querySelector('.edit').classList.remove("hidden")
  }
  const closeAdd = () => {
    document.querySelector('.add').classList.add("hidden")
  }
  const showAdd = () => {
    document.querySelector('.add').classList.remove("hidden")
  }
  useEffect(() => {
    if(search.length < 2){
      setAutofill([...[]])
      return
    }
    fetch("http://localhost:3000/search_autocomplete/"+search).then(res => res.json()).then(res => {
      if(res.text){
        setAutofill([])
      }else{
        setAutofill([...res])
      }
    })
  }, [search])
  useEffect(() => {
    document.addEventListener("click", function(e){
      setAutofill([])
    })
  }, [])
  const addBook = (book) => {
    let new_books = []
    collection.books.forEach(el => {
      new_books.push({id: el.id})
    })
    fetch("http://localhost:3000/collection_delete_book", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        books: new_books,
        collection: collection.id
      }),
    })
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
          {user && user.login == collection.user &&
            <button className='bg-blue-600 w-48 text-white px-10 text-lg p-3 mt-5 block hover:bg-blue-700' onClick={showAdd}>Add a book</button>
          }
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
        <div className="edit z-50 hidden fixed top-0 bottom-0 right-0 left-0 bg-neutral-800 flex justify-center items-center" style={{background: "rgba(50,50,50,0.9)"}}>
        <div className="bg-neutral-700 p-5 pb-8 text-white">
          <div className="flex justify-between">
            <h1 className="text-xl font-semibold">Edit info</h1>
            <i className="fa fa-close mr-1 text-xl cursor-pointer" onClick={closeEdit}></i>
          </div>
          <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-4 outline-none text-lg border text-sm rounded-lg block sm:w-96 w-64 p-2.5 bg-neutral-600 border-neutral-500 placeholder-gray-400 text-white" placeholder="Name" maxLength={200}/>
        <input type="text" value={editDesc}  onChange={(e) => setEditDesc(e.target.value)} className="mt-4 outline-none text-lg border text-sm rounded-lg block w-full p-2.5 bg-neutral-600 border-neutral-500 placeholder-gray-400 text-white" placeholder="Description" maxLength={1000}/> 
        <button className='bg-blue-600 text-white px-10 text-lg p-3 mt-5 block hover:bg-blue-700' onClick={editInfo}>Edit</button>
        </div>
      </div>
      <div className="add z-50 fixed hidden top-0 bottom-0 right-0 left-0 bg-neutral-800 flex justify-center items-center" style={{background: "rgba(50,50,50,0.9)"}}>
        <div className="bg-neutral-700 p-5 pb-8 text-white">
          <div className="flex justify-between">
            <h1 className="text-xl font-semibold">Add a book</h1>
            <i className="fa fa-close mr-1 text-xl cursor-pointer" onClick={closeAdd}></i>
          </div>
          <div className="h-11 w-72 relative">
            <input type="text" onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full outline-none h-11 mt-3 bg-neutral-800 text-slate-200 px-3 add_search" />
            <div className="absolute top-12 right-0 left-0 flex flex-col">
              {autofill.map(el => {
                return (
                  <span key={el.id} onClick={(e) => {
                    closeAdd();
                    if(!collection.books.find(x => x.id == el.id)){
                      collection.books.push(el)
                      setCollection(structuredClone(collection))
                      setMsg({type:"msg", text: "Added a book to the list!"})
                      addBook({id: el.id})
                    }else{
                      setMsg({type:"error", text: "This book is already on the list!"})
                    }
                    document.querySelector(".add_search").value = ""
                  }} className="cursor-pointer block add_suggestion bg-neutral-600 p-3 border-b border-neutral-800 hover:bg-neutral-700" data-book={el.id}><img src={"/uploads/"+el.okladka} className="h-10 float-left mr-2 mt-1"></img><span>{el.tytul}</span><br/><span className="text-neutral-300">{el.autor} - {el.rok}</span></span>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      </>
      }
      {!collection && !loading &&
        <NoMatch></NoMatch>
      }
      {!collection && loading &&
        <div role="status" className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-neutral-800 z-50">
        <svg aria-hidden="true" className="inline w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        </div>
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
