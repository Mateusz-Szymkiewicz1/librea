import { createElement, useEffect } from "react"
import { useState } from "react"
import { Rating } from 'react-simple-star-rating'
import { NavLink } from "react-router-dom"
import NoMatch from "./NoMatch"
import ReactPaginate from 'react-paginate';

function Book() {
  const book_id = window.location.href.split('/').at(-1)
  const [refresh, setRefresh] = useState(true)
  const [book, setBook] = useState({})
  const [rating, setRating] = useState(0)
  const [user, setUser] = useState()
  const [review, setReview] = useState([])
  const [textarea, setTextarea] = useState("")
  const [spoiler, setSpoiler] = useState(false)
  const [error, setError] = useState("")
  const [reviewCount, setReviewCount] = useState(0)
  const [pages, setPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const handleRating = (rate) => {
    setRating(rate)
    if(rate == 0) return
    fetch("http://localhost:3000/rate", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: rate,
        book: book_id
      }),
    }).then(res => res.json()).then(res => {
        setRefresh(!refresh)
    })
  }
  const like = (e) => {
    let link = ""
    if(e.target.classList.contains("fa-regular")){
      e.target.classList.remove("fa-regular")
      e.target.classList.add("fa-solid")
      link = "review_like"
      let likes = parseInt(e.target.parentElement.querySelector("span").innerHTML)
      e.target.parentElement.querySelector("span").innerHTML = likes+1
    }else{
      e.target.classList.remove("fa-solid")
      e.target.classList.add("fa-regular")
      link = "review_unlike"
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
        review: e.target.dataset.review
      }),
    })
  }
  const handleReview = () => {
    if(!user) return
    if(review.length > 0){
      setError("You have written a review already. You can edit it!")
      return
    }
    if(textarea.length < 1){
      setError("Don't send an empty review!")
      return
    }else{
      fetch("http://localhost:3000/review", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          book: book.id,
          text: textarea,
          spoiler: spoiler
        }),
      }).then(res => res.json()).then(res => {
          setTextarea("")
          setSpoiler(false)
          document.querySelector("textarea").value = ""
          document.querySelector("input[type=checkbox]").checked = false
          setRefresh(!refresh)
      })
    }
  }
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
            book: book_id
          }),
        }).then(res2 => res2.json()).then(async res2 => {
          if(!res2.text){
            setUser(res2[0])
            setReview(res2[0].reviews.filter(x => x.book == book_id))
          }
        })
      }
    })
    fetch('http://localhost:3000/book/'+book_id+"?offset="+((currentPage-1)*50)).then(res => res.json()).then(res => {
      if(res.status != 0){
        console.log(res[0])
        res[0].tagi = JSON.parse(res[0].tagi)
        setBook(res[0])
        setReviewCount(res[0].ilosc_recenzji)
      }
    })
  }, [refresh])
  useEffect(() => {
    if(!review.length) return
    setReviewCount(reviewCount-1)
  }, [review])
  useEffect(() => {
    setPages(Math.ceil(reviewCount/50))
  }, [reviewCount])
  const pageChange = (e) => {
    let offset = (e.selected)*50
    setCurrentPage(e.selected+1)
    fetch('http://localhost:3000/book/'+book_id+"?offset="+offset).then(res => res.json()).then(res => {
      if(res.status != 0){
        res[0].tagi = JSON.parse(res[0].tagi)
        setBook(res[0])
        document.querySelector("#reviews").scrollIntoView()
      }
    })
  }
  return (
    <>
      <div>
          {book.id > 0 &&
            <>
              <div className="sm:pl-10 pl-3">
              <img className="sm:mt-10 mt-5 float-left mr-10 h-96 border border-neutral-700 shadow-lg" src={"../../public/uploads/"+book.okladka} onError={(e) => e.target.src = "../../public/default.jpg"}></img>
              <div className="float-left mt-10 mr-10 text-slate-200">
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
                  {book.ilosc_ocen > 0 &&
                    <p className="ms-2 text-md font-bold text-gray-900 dark:text-white">{ (book.suma_ocen/book.ilosc_ocen).toFixed(1) } ({book.ilosc_ocen})</p>
                  }
                  {book.ilosc_ocen == 0 &&
                    <p className="ms-2 text-md font-bold text-gray-900 dark:text-white">No ratings</p>
                  }
                  <span className="w-1 h-1 mx-1.5 bg-gray-500 rounded-full dark:bg-gray-400"></span>
                  <a href="#reviews" className="text-md font-medium text-gray-900 underline hover:no-underline dark:text-white">{book.ilosc_recenzji} review(s)</a>
                </div>
              </div>
              <p className="clear-both text-slate-200 mr-16 py-10">{book.opis}</p>
              </div>
              <div className="bg-neutral-600 sm:ml-10 w-full sm:w-auto text-center sm:text-left p-5 float-left mr-16">
                <h3 className="text-white text-xl font-semibold mb-2">What's <span className="font-bold">your</span> rating?</h3>
                {!user &&
                  <p className="text-slate-200 pb-3">You need to be logged in to vote.</p>
                }
                {rating != 0 &&
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
              <div className="sm:pl-10 pl-3 sm:pr-16 pr-3">
              <h2 id="reviews" className="text-3xl font-semibold clear-both text-slate-200 pt-20">Reviews ({book.ilosc_recenzji})</h2>
              <textarea disabled={user ? false : true} onChange={(e) => setTextarea(e.target.value)} className="bg-neutral-600 mt-10 w-full h-48 outline-none text-white text-lg p-3" placeholder="What are your thoughts?"></textarea>
              <div className="inline-flex items-center">
              <label className="flex items-center cursor-pointer relative mt-2">
                <input disabled={user ? false : true} onChange={(e) => setSpoiler(e.target.checked)} type="checkbox" className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-200 checked:bg-blue-500 checked:border-slate-800" id="check" />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </span>
              </label>
              <span className="text-white pl-2 pt-2">Mark as a spoiler</span>
            </div> 
            {!user && 
              <p className="text-slate-200 pb-3 text-lg pt-3">You need to be logged in to write a review.</p>
            }
            <button onClick={handleReview} className='bg-blue-600 text-white px-10 text-lg p-3 mb-10 mt-3 block hover:bg-blue-700'><i className="fa fa-send mr-2"></i>Send</button>
              {currentPage == 1 && review.map((el, i) => {
                return (
                  <div className="bg-blue-950 p-5 text-white my-5" key={i}>
                    <NavLink to={"/profile/"+el.user}>
                    <h3 className="text-xl">
                      {el.prof &&
                        <img className="block h-10 w-10 cover-fit w-fit float-left" src={"/public/user_uploads/"+el.prof} onError={(e) => {
                        e.target.parentElement.innerHTML = `<span class="bg-blue-500 block font-bold h-full flex justify-center items-center p-3 text-md w-fit float-left">${el.user.slice(0,1).toUpperCase()}</span><span class="text-3xl ml-3 mt-1 block float-left">${el.user}</span>`
                        }}></img>
                      }
                      {!el.prof &&
                        <span className="bg-blue-500 block font-bold h-full flex justify-center items-center p-3 text-md w-fit float-left">{el.user.slice(0,1).toUpperCase()}</span> 
                      }
                      <span className="text-3xl ml-3 mt-1 block float-left">{el.user}</span>
                    </h3></NavLink>
                    {el.rating &&
                        <p className="text-2xl font-bold clear-both pt-3">{el.rating}/10</p>
                    }
                    {el.spoiler == "0" &&
                      <p className="clear-both break-words text-xl pt-3">{el.text}</p>
                    }
                    {el.spoiler == "1" &&
                      <p className="clear-both text-xl pt-3 text-red-400">This review contains spoilers! <span className="underline cursor-pointer" onClick={() => {
                        review[i].spoiler = 0
                        setReview([...review])
                      }}>Reveal</span></p>
                    }
                    <div>
                      {user && user.likes.find(x => x.review == el.id) &&
                        <i onClick={like} className="fa-solid fa-heart text-2xl mt-5 cursor-pointer" data-review={el.id}></i>
                      }
                      {user && !user.likes.find(x => x.review == el.id) &&
                        <i onClick={like} className="fa-regular fa-heart text-2xl mt-5 cursor-pointer" data-review={el.id}></i>
                      }
                      <span className="pl-2 text-xl">{el.likes}</span>
                    </div>
                </div>
                )
              })}
              {book.reviews.map((el, i) => {
                  if(user && el.user == user.login) return
                  return (
                    <div className="bg-neutral-700 p-5 text-white my-5" key={i}>
                      <NavLink to={"/profile/"+el.user}>
                      <h3 className="text-xl">
                        {el.prof && 
                          <img className="block h-10 w-10 cover-fit w-fit float-left" src={"user_uploads/"+el.prof} onError={(e) => {
                            e.target.parentElement.innerHTML = `<span class="bg-blue-500 block font-bold h-full flex justify-center items-center p-3 text-md w-fit float-left">${el.user.slice(0,1).toUpperCase()}</span><span class="text-3xl ml-3 mt-1 block float-left">${el.user}</span>`
                            }}></img>
                        }
                        {!el.prof &&
                          <span className="bg-blue-500 block font-bold h-full flex justify-center items-center p-3 text-md w-fit float-left">{el.user.slice(0,1).toUpperCase()}</span> 
                        }
                        <span className="text-3xl ml-3 mt-1 block float-left">{el.user}</span>
                      </h3></NavLink>
                      {el.rating &&
                        <p className="text-2xl font-bold clear-both pt-3">{el.rating}/10</p>
                      }
                      {el.spoiler == "0" &&
                        <p className="clear-both break-words  text-xl pt-3">{el.text}</p>
                      }
                      {el.spoiler == "1" &&
                        <p className="clear-both text-xl pt-3 text-red-400">This review contains spoilers! <span className="underline cursor-pointer" onClick={() => {
                          book.reviews[i].spoiler = 0
                          setBook(structuredClone(book))
                        }}>Reveal</span></p>
                      }
                      <div>
                        {user && user.likes.find(x => x.review == el.id) &&
                          <i onClick={like} className="fa-solid fa-heart text-2xl mt-5 cursor-pointer" data-review={el.id}></i>
                        }
                        {user && !user.likes.find(x => x.review == el.id) &&
                          <i onClick={like} className="fa-regular fa-heart text-2xl mt-5 cursor-pointer" data-review={el.id}></i>
                        }
                        {!user &&
                          <NavLink to="/login"><i className="fa-regular fa-heart text-2xl mt-5 cursor-pointer"></i></NavLink>
                        }
                        <span className="pl-2 text-xl">{el.likes}</span>
                      </div>
                    </div>
                  )
              })}
              </div>
            </>
          }
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
                className="flex gap-3 ml-10 mb-10"
                nextLinkClassName="cursor-pointer bg-blue-500 w-8 text-slate-200 h-8 text-lg flex justify-center items-center p-5 px-10 hover:bg-blue-600"
                previousLinkClassName="cursor-pointer bg-blue-500 w-8 text-slate-200 h-8 text-lg flex justify-center items-center p-5 px-12 hover:bg-blue-600"
                pageLinkClassName="cursor-pointer bg-blue-500 block p-5 flex justify-center items-center w-8 text-slate-200 h-8 text-xl hover:bg-blue-600"
                activeClassName="brightness-125"
              />
            </>
          }
          {!book.id > 0 &&
            <NoMatch></NoMatch>
          }
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

export default Book
