import { useEffect } from "react"
import { useState } from "react"
import { Rating } from 'react-simple-star-rating'

function Book() {
  const book_id = window.location.href.split('/').at(-1)
  const [refresh, setRefresh] = useState(true)
  const [book, setBook] = useState({})
  const [rating, setRating] = useState(0)
  const [user, setUser] = useState()
  const [review, setReview] = useState()
  const handleRating = (rate) => {
    setRating(rate)
  }
  useEffect(() => {
    fetch("http://localhost:3000/rate", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: rating,
        book: book.id
      }),
    }).then(res => res.json()).then(res => {
        setRefresh(!refresh)
    })
  }, [rating])
  useEffect(() => {
    if(user){
      setReview(book.reviews.find((el) => el.user = user))
      book.reviews = book.reviews.filter((el) => el.user != user)
    }
  }, [user])
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
          }
        }).then(res2 => res2.json()).then(async res2 => {
          if(!res2.text){
            res2[0].katalogi = JSON.parse(res2[0].katalogi)
            setUser(res2[0])
            if(res2[0].ratings.find(x => x.id == book.id)){
              setRating(res2[0].ratings.find(x => x.id == book.id).rating)
            }
          }
        })
      }
    })
    fetch('http://localhost:3000/book/'+book_id).then(res => res.json()).then(res => {
      if(res.status != 0){
        res[0].tagi = JSON.parse(res[0].tagi)
        res[0].reviews.forEach((review, i) => {
          fetch("http://localhost:3000/review_rating", {
            credentials: 'include',
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: review.user,
              book: review.book
            }),
          }).then(res => res.json()).then(res2 => {
              review.rating = res2[0].rating
          })
        })
        setBook([...res][0])
      }
    })
  }, [refresh])
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
                <p className="text-white text-xl mt-1 text-neutral-400 mb-2">Page count: {book.strony}</p>
                <div className="flex flex-wrap gap-2">
                  {book.tagi.map(tag => <span key={tag} className="text-sm font-medium px-2.5 py-0.5 rounded bg-blue-900 text-blue-300">{tag}</span>)}
                </div>
                <div className="flex items-center mt-5">
                  <svg className="w-6 h-6 text-yellow-300 me-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                  </svg>
                  <p className="ms-2 text-md font-bold text-gray-900 dark:text-white">{ (book.suma_ocen/book.ilosc_ocen).toFixed(1) }</p>
                  <span className="w-1 h-1 mx-1.5 bg-gray-500 rounded-full dark:bg-gray-400"></span>
                  <a href="#reviews" className="text-md font-medium text-gray-900 underline hover:no-underline dark:text-white">{book.ilosc_recenzji} review(s)</a>
                </div>
              </div>
              <p className="clear-both text-slate-200 ml-10 mr-16 py-10">{book.opis}</p>
              <div className="bg-neutral-600 sm:ml-10 w-full sm:w-auto text-center sm:text-left p-5 float-left mr-16">
                <h3 className="text-white text-xl font-semibold mb-2">What's <span className="font-bold">your</span> rating?</h3>
                {!user &&
                  <p className="text-slate-200">You need to be logged in to vote.</p>
                }
                {rating &&
                  <p className="text-slate-200">Your carrent rating: {rating}</p>
                }
                <Rating
                  onClick={handleRating}
                  readonly={!user}
                  SVGclassName="inline h-6 sm:h-8 gap-0 md:h-16"
                  initialValue={rating}
                  iconsCount={10}
                />
              </div>
              <h2 id="reviews" className="text-3xl font-semibold ml-10 clear-both text-slate-200 pt-20">Reviews ({book.ilosc_recenzji})</h2>
              {review &&
                <div className="bg-blue-950 ml-10 p-5 text-white my-5 mr-16">
                  <h3 className="text-xl"><span className="bg-blue-500 block font-bold h-full flex justify-center items-center p-3 text-md w-fit float-left">{review.user.login.slice(0,1).toUpperCase()}</span> <span className="text-3xl ml-3 mt-1 block float-left">{review.user.login}</span></h3>
                  <p className="text-2xl font-bold clear-both pt-3">{review.rating}/10</p>
                  {review.spoiler == "0" &&
                    <p className="clear-both break-words text-xl pt-3">{review.text}</p>
                  }
                  {review.spoiler == "1" &&
                    <p className="clear-both text-xl pt-3 text-red-400">This review contains spoilers! <span className="underline cursor-pointer">Reveal</span></p>
                  }
                </div>
              }
              {book.reviews.map((el, i) => {
                  return (
                    <div className="bg-neutral-600 ml-10 p-5 text-white my-5 mr-16" key={i}>
                      <h3 className="text-xl"><span className="bg-blue-500 block font-bold h-full flex justify-center items-center p-3 text-md w-fit float-left">{el.user.slice(0,1).toUpperCase()}</span> <span className="text-3xl ml-3 mt-1 block float-left">{el.user}</span></h3>
                      <p className="text-2xl font-bold clear-both pt-3">{el.rating}/10</p>
                      {el.spoiler == "0" &&
                        <p className="clear-both break-words  text-xl pt-3">{el.text}</p>
                      }
                      {el.spoiler == "1" &&
                        <p className="clear-both text-xl pt-3 text-red-400">This review contains spoilers! <span className="underline cursor-pointer">Reveal</span></p>
                      }
                    </div>
                  )
              })}
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
