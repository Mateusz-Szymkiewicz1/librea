import { useEffect } from "react"
import { useState } from "react"

function Book() {
  const book_id = window.location.href.split('/').at(-1)
  const [book, setBook] = useState({})
  useEffect(() => {
    fetch('http://localhost:3000/book/'+book_id).then(res => res.json()).then(res => {
      if(res.status != 0){
        res[0].tagi = JSON.parse(res[0].tagi)
        setBook([...res][0])
      }
    })
  }, [])
  return (
    <>
      <div>
          {book.id > 0 &&
            <>
              <img className="mt-10 ml-10 float-left h-96 border border-neutral-700 shadow-lg" src={"../../public/uploads/"+book.okladka} onError={(e) => e.target.src = "../../public/default.jpg"}></img>
              <div className="float-left mt-10 mx-10 text-slate-200">
                <h1 className="text-white text-4xl">{book.tytul}</h1>
                <p className="text-white text-2xl mt-3 text-neutral-300">{book.autor}</p>
                <p className="text-white text-xl mt-1 text-neutral-400">{book.rok}</p>
                <p className="text-white text-xl mt-1 text-neutral-400 mb-2">Liczba stron: {book.strony}</p>
                <div className="flex flex-wrap gap-2">
                  {book.tagi.map(tag => <span key={tag} className="text-sm font-medium px-2.5 py-0.5 rounded bg-blue-900 text-blue-300">{tag}</span>)}
                </div>
              </div>
              <p className="clear-both text-slate-200 ml-10 mr-16 py-10">{book.opis}</p>
            </>
          }
          {!book.id > 0 &&
            <div className="h-screen w-full flex flex-col justify-center items-center">
              <span className="text-blue-600 text-center text-6xl font-bold -mt-32">404</span><br/>
              <span className="text-white text-center text-5xl">No matches found!</span>
            </div>
          }
      </div>
    </>
  )
}

export default Book
