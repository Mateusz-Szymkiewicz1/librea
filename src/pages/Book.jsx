import { useEffect } from "react"
import { useState } from "react"

function Book() {
  const book_id = window.location.href.split('/').at(-1)
  const [book, setBook] = useState({})
  useEffect(() => {
    fetch('http://localhost:3000/book/'+book_id).then(res => res.json()).then(res => {
      if(res.status != 0){
        setBook([...res][0])
      }
    })
  }, [])
  return (
    <>
      <div>
          {book.id > 0 &&
            <h1 className="text-white m-10">{book.tytul}</h1>
          }
          {!book.id > 0 &&
            <div class="h-screen w-full flex flex-col justify-center items-center">
              <span className="text-blue-600 text-center text-6xl -mt-32">404</span><br/>
              <span className="text-white text-center text-5xl">No matches found!</span>
            </div>
          }
      </div>
    </>
  )
}

export default Book
