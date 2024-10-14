import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

function CollectionNew() {
  const navigator = useNavigate()
  const [search,setSearch] = useState("")
  const [autofill, setAutofill] = useState([])
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [books, setBooks] = useState([])
  const [error,setError] = useState("")
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
  const closeAdd = () => {
    document.querySelector('.add').classList.add("hidden")
  }
  const showAdd = () => {
    document.querySelector('.add').classList.remove("hidden")
  }
  const createCollection = () => {
    if(name.length < 1){
      setError("Collection's title is required!")
      return;
    }
    if(books.length < 1){
      setError("You need to add at least 1 book!")
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
    }).then(navigator("/"))
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
              <span key={el.id} className="block text-white bg-neutral-600 p-3 border-b border-neutral-800 mb-2" data-book={el.id}><img src={"/uploads/"+el.okladka} className="h-10 float-left mr-2 mt-1"></img><span>{el.tytul}</span><br/><span className="text-neutral-300">{el.autor} - {el.rok}</span></span>
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
                      setError("This book is already on the list!")
                    }
                    document.querySelector(".add_search").value = ""
                  }} className="cursor-pointer block add_suggestion bg-neutral-600 p-3 border-b border-neutral-800 hover:bg-neutral-700" data-book={el.id}><img src={"/uploads/"+el.okladka} className="h-10 float-left mr-2 mt-1"></img><span>{el.tytul}</span><br/><span className="text-neutral-300">{el.autor} - {el.rok}</span></span>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      {error &&
      <>
          <div className="fixed bottom-4 z-50 right-4 min-w-64">
            <div className="flex justify-between rounded-lg shadow-lg p-4 border bg-red-500 border border-red-600">
                <p className="text-white text-lg mr-5 dark:text-slate-200">
                { error }
                </p>
                <button onClick={() => setError("")} className="text-white dark:text-slate-200 focus:outline-none">
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

export default CollectionNew
