import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

function CollectionNew(props) {
  const navigator = useNavigate()
  const [search,setSearch] = useState("")
  const [autofill, setAutofill] = useState([])
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
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
    fetch("http://localhost:3000/login", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(res => res.json()).then(res => {
      if(res.text){
        navigator("/")
      }else{
        setLoading(false)
      }
    })
    document.addEventListener("click", function(e){
      setAutofill([])
    })
  }, [])
  const closeAdd = () => {
    document.querySelector('.add').classList.add("hidden")
  }
  const showAdd = () => {
    document.querySelector('.add').classList.remove("hidden")
  }
  const createCollection = () => {
    if(name.length < 1){
      props.setToast({type: "error", text: "Collection's title is required!"})
      return;
    }
    if(books.length < 1){
      props.setToast({type: "error", text: "You need to add at least one book!"})
      return;
    }
    const tab = []
    books.forEach(el => {
      let obj = {id: el.id}
      tab.push(obj)
    })
    fetch("http://localhost:3000/new_collection", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        books: JSON.stringify(tab),
        desc: desc
      }),
    }).then(() => {
      props.setToast({type: "msg", text: "Added a new collection!", stay: true})
      navigator("/")
    })
  }
  const deleteBook = () => {
    setBooks(books.filter(x => x.id != event.target.dataset.id))
  }
  return (
    <>
      <div className="lg:mt-10 w-full lg:w-1/2 float-left p-2 sm:p-5">
        <div className="bg-neutral-700  h-full w-full p-5">
          <h1 className="text-white text-3xl">New collection</h1>
          <input type="text" onChange={(e) => setName(e.target.value)} className="mt-4 outline-none text-lg border text-sm rounded-lg block w-full p-2.5 bg-neutral-600 border-neutral-500 placeholder-gray-400 text-white" placeholder="Name" maxLength={200}/>
          <input type="text" onChange={(e) => setDesc(e.target.value)} className="mt-4 outline-none text-lg border text-sm rounded-lg block w-full p-2.5 bg-neutral-600 border-neutral-500 placeholder-gray-400 text-white" placeholder="Description" maxLength={1000}/> 
          <button className='bg-blue-600 text-white px-10 text-lg p-3 mb-4 mt-4 block hover:bg-blue-700' onClick={showAdd}><i className="fa fa-plus mr-2"></i>Add a book</button>
          {books.length == 0 &&
            <p className="text-neutral-300 text-lg">There's currently no books in this collection.</p>
          }
          {books.map(el => {
            return (
              <span key={el.id} className="block relative text-white bg-neutral-600 p-3 border-b border-neutral-800 mb-2" data-book={el.id}><img src={"/uploads/"+el.okladka} className="h-10 float-left mr-2 mt-1"></img>
              <span>{el.tytul}</span><br/><span className="text-neutral-300">{el.autor} - {el.rok}</span>
              <i className="fa fa-close text-red-500 font-bold text-2xl absolute right-3 top-5 cursor-pointer" data-id={el.id} onClick={deleteBook}></i>
              </span>
            )
          })}
          <button className='bg-blue-600 text-white px-10 text-lg p-3 mt-16 block hover:bg-blue-700' onClick={createCollection}>Create collection</button>
        </div>
      </div>
      <div className="px-10 mt-10 w-1/2 float-left flex justify-center hidden lg:block">
        <img src="/collection.svg" className="h-[550px]"></img>
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
                    if(!books.find(x => x.id == el.id)){
                      setBooks([...books, el])
                    }else{
                      props.setToast({type: "error", text: "This book is already on the list!"})
                    }
                    document.querySelector(".add_search").value = ""
                  }} className="cursor-pointer block add_suggestion bg-neutral-600 p-3 border-b border-neutral-800 hover:bg-neutral-700" data-book={el.id}><img src={"/uploads/"+el.okladka} className="h-10 float-left mr-2 mt-1"></img><span>{el.tytul}</span><br/><span className="text-neutral-300">{el.autor} - {el.rok}</span></span>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      {loading &&
        <div role="status" className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-neutral-800 z-50">
        <svg aria-hidden="true" className="inline w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        </div>
      }
    </>
  )
}

export default CollectionNew
