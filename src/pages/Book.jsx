import { useEffect, useState } from "react"
import { Rating } from 'react-simple-star-rating'
import { NavLink, useNavigate } from "react-router-dom"
import NoMatch from "./NoMatch"
import ReactPaginate from 'react-paginate';
import { useDecision } from "../components/useDecision"

function Book(props) {
  const navigator = useNavigate()
  const book_id = window.location.href.split('/').at(-1).split("#")[0]
  const [refresh, setRefresh] = useState(true)
  const [book, setBook] = useState({})
  const [rating, setRating] = useState(0)
  const [user, setUser] = useState()
  const [review, setReview] = useState([])
  const [textarea, setTextarea] = useState("")
  const [spoiler, setSpoiler] = useState(false)
  const [reviewCount, setReviewCount] = useState(0)
  const [quoteCount, setQuoteCount] = useState(0)
  const [pages, setPages] = useState(0)
  const [quotePages, setQuotePages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentQuotePage, setCurrentQuotePage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editReview, setEditReview] = useState("")
  const [editSpoiler, setEditSpoiler] = useState("")
  const [newCollections, setNewCollections] = useState([])
  const [newQuote, setNewQuote] = useState("")
  const [editQuote, setEditQuote] = useState("")
  const [editedQuote, setEditedQuote] = useState()
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
  const likeQuote = (e) => {
    let link = ""
    if(e.target.classList.contains("fa-regular")){
      e.target.classList.remove("fa-regular")
      e.target.classList.add("fa-solid")
      link = "quote_like"
      let likes = parseInt(e.target.parentElement.querySelector("span").innerHTML)
      e.target.parentElement.querySelector("span").innerHTML = likes+1
    }else{
      e.target.classList.remove("fa-solid")
      e.target.classList.add("fa-regular")
      link = "quote_unlike"
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
        quote: e.target.dataset.quote
      }),
    })
  }
  const handleReview = () => {
    if(!user) return
    if(review.length > 0){
      props.setToast({type:"error", text: "You have written a review already. You can edit it!"})
      return
    }
    if(textarea.length < 1){
      props.setToast({type:"error",text: "Don't send an empty review!"})
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
          props.setToast({type:"msg",text:"Review published!"})
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
            if(res2[0].ratings.find(x => x.book == book_id)){
              setRating(res2[0].ratings.find(x => x.book == book_id).rating)
            }
            if(res2[0].reviews.find(x => x.book == book_id)){
              setEditSpoiler(res2[0].reviews.find(x => x.book == book_id).spoiler)
            }
            setReview(res2[0].reviews.filter(x => x.book == book_id))
          }
        })
      }
    })
    fetch('http://localhost:3000/book/'+book_id+"?offset="+((currentPage-1)*15)+"&quote_offset="+((currentQuotePage-1)*5)).then(res => res.json()).then(res => {
      if(res.status != 0){
        console.log(res[0])
        res[0].tagi = JSON.parse(res[0].tagi)
        setBook(res[0])
        setReviewCount(res[0].ilosc_recenzji)
        setQuoteCount(res[0].ilosc_cytatow)
      }
      setLoading(false)
    })
  }, [refresh])
  useEffect(() => {
    if(!review.length) return
    setReviewCount(reviewCount-1)
  }, [review])
  useEffect(() => {
    setPages(Math.ceil(reviewCount/15))
  }, [reviewCount])
  useEffect(() => {
    setQuotePages(Math.ceil(quoteCount/5))
  }, [quoteCount])
  const pageChange = (e) => {
    let offset = (e.selected)*15
    setCurrentPage(e.selected+1)
    fetch('http://localhost:3000/book/'+book_id+"?offset="+offset).then(res => res.json()).then(res => {
      if(res.status != 0){
        res[0].tagi = JSON.parse(res[0].tagi)
        setBook(res[0])
        document.querySelector("#reviews").scrollIntoView()
      }
    })
  }
  const quotePageChange = (e) => {
    let offset = (currentPage-1)*15
    setCurrentQuotePage(e.selected+1)
    let quoteOffset = e.selected*5
    fetch('http://localhost:3000/book/'+book_id+"?offset="+offset+"&quote_offset="+quoteOffset).then(res => res.json()).then(res => {
      if(res.status != 0){
        res[0].tagi = JSON.parse(res[0].tagi)
        setBook(res[0])
        document.querySelector("#quotes").scrollIntoView()
      }
    })
  }
  const deleteReview = async (e) => {
    if (document.querySelector(".decision")) document.querySelector('.decision').remove()
      const response = await useDecision().then(function () {
          document.querySelector(".decision").remove()
          return
      }, function () {
          document.querySelector(".decision").remove()
          return "stop"
      });
      if(response) return
    fetch("http://localhost:3000/delete_review", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: e.target.dataset.review
      })
    }).then(() => {
      setRefresh(!refresh)
      props.setToast({type:"msg",text:"Review deleted!"})
    })
  }
  const deleteQuote = async (e) => {
    if (document.querySelector(".decision")) document.querySelector('.decision').remove()
      const response = await useDecision().then(function () {
          document.querySelector(".decision").remove()
          return
      }, function () {
          document.querySelector(".decision").remove()
          return "stop"
      });
      if(response) return
    fetch("http://localhost:3000/delete_quote", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: e.target.dataset.quote
      })
    }).then(() => {
      setRefresh(!refresh)
      props.setToast({type:"msg",text:"Quote deleted!"})
    })
  }
  const closeEdit = () => {
    document.querySelector('.edit').classList.add("hidden")
  }
  const showEdit = () => {
    document.querySelector('.edit').classList.remove("hidden")
  }
  const closeNewQuote = () => {
    document.querySelector('.new_quote').classList.add("hidden")
  }
  const showNewQuote = () => {
    document.querySelector('.new_quote').classList.remove("hidden")
  }
   const closeEditQuote = () => {
    document.querySelector('.edit_quote').classList.add("hidden")
  }
  const showEditQuote = (e) => {
    document.querySelector('.edit_quote').classList.remove("hidden")
    setEditQuote(e.target.dataset.text)
    setEditedQuote(e.target.dataset.quote)
  }
  const closeAddToCollection = () => {
    document.querySelector('.add_to_collection').classList.add("hidden")
  }
  const showAddToCollection = () => {
    document.querySelector('.add_to_collection').classList.remove("hidden")
  }
  useEffect(() => {
    if(review.length < 1) return
    setEditReview(review[0].text)
  }, [review])
  const editQuoteFun = async () => {
    if(editQuote.length < 1){
      props.setToast({type:"error", text: "Write something!"})
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
      fetch("http://localhost:3000/edit_quote", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editedQuote,
          text: editQuote
        })
      }).then(() => {
        closeEditQuote()
        setRefresh(!refresh)
        props.setToast({type:"msg",text:"Quote changed!"})
      })
  }
  const editReviewFun = async () => {
    if(editReview.length < 1){
      props.setToast({type:"error", text: "Write something!"})
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
      fetch("http://localhost:3000/edit_review", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: review[0].id,
          text: editReview,
          spoiler: editSpoiler
        })
      }).then(() => {
        closeEdit()
        setRefresh(!refresh)
        props.setToast({type:"msg",text:"Review changed!"})
      })
  }
  const addToCollection = async () => {
    if(newCollections.length == 0){
      props.setToast({type:"error", text: "Check something first!"})
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
      newCollections.forEach(el => {
        fetch("http://localhost:3000/collection_add_book", {
          credentials: 'include',
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            collection: el,
            book: book_id
          })
        }).then(res => res.json()).then(res =>{
          closeAddToCollection()
          setRefresh(!refresh)
        })
      })
  }
  const deleteBook = async () => {
    if (document.querySelector(".decision")) document.querySelector('.decision').remove()
      const response = await useDecision().then(function () {
          document.querySelector(".decision").remove()
          return
      }, function () {
          document.querySelector(".decision").remove()
          return "stop"
      });
      if(response) return
      fetch("http://localhost:3000/delete_book", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: book_id
        })
      }).then(res => res.json()).then(res => {
        navigator("/")
        props.setToast({type:"msg", text:"Deleted a book!", stay: true})
      })
  }
  const addQuote = async () => {
    if(newQuote.length < 1){
      props.setToast({type:"error",text: "Write something!"})
      return
    }
    fetch("http://localhost:3000/add_quote", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        book: book_id,
        text: newQuote
      }),
    }).then(res => res.json()).then(res => {
        setNewQuote("")
        closeNewQuote()
        setRefresh(!refresh)
        props.setToast({type:"msg", text:"Added a quote!"})
    })
  }
  const toggleDropdown = async (e) => {
    e.stopPropagation()
    const menu = e.target.parentElement.parentElement.parentElement.querySelector('.drop_menu')
    document.querySelectorAll('.drop_menu').forEach(el => {
      if(!el.classList.contains("hidden") && el != menu){
      el.classList.add("hidden")
    }
    })
    if(menu.classList.contains("hidden")){
      menu.classList.remove("hidden")
    }else{
      menu.classList.add("hidden")
    }
  }
  const report = async (e) => {
    if (document.querySelector(".decision")) document.querySelector('.decision').remove()
      const response = await useDecision().then(function () {
          document.querySelector(".decision").remove()
          return
      }, function () {
          document.querySelector(".decision").remove()
          return "stop"
      });
      if(response) return
      fetch("http://localhost:3000/report", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: e.target.dataset.id,
          type: e.target.dataset.type
        })
      }).then(res => res.json()).then(res => {
          if(res == "already reported"){
            props.setToast({type:"error", text:"Already reported!"})
          }else{
            props.setToast({type:"msg", text:"Sent a report!"})
          }
      })
  }
  useEffect((e) => {
    document.addEventListener("click", function(e){
      document.querySelectorAll('.drop_menu').forEach(el => {
        el.classList.add("hidden")
      })
    })
  }, [])
  return (
    <>
      <div>
          {book.id > 0 &&
            <>
              <div className="sm:pl-5 pl-3">
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
              <p className="clear-both text-slate-200 mr-16 py-10">{book.opis.length > 0 ? book.opis : "No description yet..."}</p>
              {user && user.collections.length > 0 &&
                <>
                  <p className="text-xl mr-16 pb-10">
                    {user.collections.find(x => x.books.includes(":"+book_id+"}")) &&
                      <span className="mr-2">In your collections:</span>
                    }    
                    {user.collections.map((el,i) => {
                      if(el.books.includes(":"+book_id+"}")){
                        return(
                          <span key={i}>
                          <NavLink className="text-blue-500 underline" to={"/collection/"+el.id}><span>{el.name}</span></NavLink>
                          <span>, </span>
                          </span>
                        )
                      }
                     })}</p>
                  {user.collections.find(x => !x.books.includes(":"+book_id+"}")) &&
                  <button onClick={showAddToCollection} className='bg-blue-600 text-white px-10 text-lg p-3 mb-10 block hover:bg-blue-700'><i className="fa fa-add mr-2"></i>Add to a collection</button>
                  }
                </>
              }
              {user && user.admin == 1 &&
                <div>
                  <NavLink to={"/book/edit/"+book_id}><button className='bg-red-600 text-white px-10 text-lg p-3 mb-3  hover:bg-red-700'><i className="fa fa-pencil mr-3"></i>Edit book info</button></NavLink>
                  <button className='bg-red-600 text-white px-10 text-lg p-3 mb-10 block hover:bg-red-700' onClick={deleteBook}><i className="fa fa-trash mr-3"></i>Delete book</button>
                </div>
              }
              </div>
              <div className="bg-neutral-600 sm:ml-5 w-full sm:w-auto text-center sm:text-left p-5 float-left mr-16">
                <h3 className="text-white text-xl font-semibold mb-2">What's <span className="font-bold">your</span> rating?</h3>
                {!user &&
                  <p className="text-slate-200 pb-3">You need to be logged in to vote.</p>
                }
                {rating != 0 &&
                  <p className="text-slate-200">Your current rating: {rating}</p>
                }
                <Rating
                  onClick={handleRating}
                  readonly={!user}
                  SVGclassName="inline h-6 sm:h-8 gap-0 w-8 sm:w-10 mt-3"
                  initialValue={rating}
                  iconsCount={10}
                />
              </div>
              <div className="sm:pl-5 pl-3 sm:pr-16 pr-3">
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
                    <div className="flex justify-between">
                    <NavLink to={"/profile/"+el.user} className="float-left">
                    <h3 className="text-xl w-fit">
                      {el.prof &&
                        <img className="block h-10 w-10 cover-fit w-fit float-left" src={"/public/user_uploads/profs/"+el.prof} onError={(e) => {
                        e.target.parentElement.innerHTML = `<span class="bg-blue-500 block font-bold h-full flex justify-center items-center p-3 text-md w-fit float-left">${el.user.slice(0,1).toUpperCase()}</span><span class="text-3xl ml-3 mt-1 block float-left">${el.user}</span>`
                        }}></img>
                      }
                      {!el.prof &&
                        <span className="bg-blue-500 block font-bold h-full flex justify-center items-center p-3 text-md w-fit float-left">{el.user.slice(0,1).toUpperCase()}</span> 
                      }
                      <span className="text-3xl ml-3 mt-1 block float-left">{el.user}</span>
                    </h3></NavLink>
                      <span><i className="fa fa-pencil text-amber-500 cursor-pointer text-2xl" onClick={showEdit}></i><i className="fa fa-trash ml-5 text-red-600 cursor-pointer text-2xl" onClick={deleteReview} data-review={el.id}></i></span>
                    </div>
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
                    <div className="bg-neutral-700 p-5 text-white my-5 relative" key={el.id}>
                      <div className="flex justify-between">
                      <NavLink to={"/profile/"+el.user}>
                      <h3 className="text-xl">
                        {el.prof && 
                          <img className="block h-10 w-10 cover-fit w-fit float-left" src={"user_uploads/profs/"+el.prof} onError={(e) => {
                            e.target.parentElement.innerHTML = `<span class="bg-blue-500 block font-bold h-full flex justify-center items-center p-3 text-md w-fit float-left">${el.user.slice(0,1).toUpperCase()}</span><span class="text-3xl ml-3 mt-1 block float-left">${el.user}</span>`
                            }}></img>
                        }
                        {!el.prof &&
                          <span className="bg-blue-500 block font-bold h-full flex justify-center items-center p-3 text-md w-fit float-left">{el.user.slice(0,1).toUpperCase()}</span> 
                        }
                        <span className="text-3xl ml-3 mt-1 block float-left">{el.user}</span>
                      </h3></NavLink>
                      {user &&
                      <span onClick={toggleDropdown}><i className="fa fa-ellipsis-vertical cursor-pointer text-2xl p-2"></i></span>
                      }
                      </div>
                      {user &&
                      <div onClick={(e) => e.stopPropagation()} className="drop_menu bg-neutral-600 w-fit p-2 gap-1 flex flex-col absolute right-5 hidden">
                        {user.admin != 0 &&
                          <p className="text-red-400 hover:bg-neutral-700 p-2 px-3 cursor-pointer" onClick={deleteReview} data-review={el.id}><i className="fa fa-trash mr-2"></i>Delete</p>
                        }
                        <p data-id={el.id} data-type={"review"} onClick={report} className="text-red-400 hover:bg-neutral-700 p-2 px-3 cursor-pointer"><i className="fa fa-triangle-exclamation mr-2"></i>Report</p>
                      </div>
                      }
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
                className="flex gap-3 sm:ml-5 ml-3 sm:mr-16 mr-3 mb-10"
                nextLinkClassName="cursor-pointer bg-blue-500 w-8 text-slate-200 h-8 text-lg flex justify-center items-center p-5 px-10 hover:bg-blue-600"
                previousLinkClassName="cursor-pointer bg-blue-500 w-8 text-slate-200 h-8 text-lg flex justify-center items-center p-5 px-12 hover:bg-blue-600"
                pageLinkClassName="cursor-pointer bg-blue-500 block p-5 flex justify-center items-center w-8 text-slate-200 h-8 text-xl hover:bg-blue-600"
                activeClassName="brightness-125"
              />
            </>
          }
          {book.id > 0 &&
            <div className="sm:ml-5 ml-3 sm:mr-16 mr-3">
              <h2 id="quotes" className="text-3xl font-semibold clear-both text-slate-200 pt-20">Quotes ({book.ilosc_cytatow})</h2>
              {book.ilosc_cytatow == 0 &&
                <p className="text-xl dark:text-gray-300 mt-3">No quotes yet!</p>
              }
              <button onClick={showNewQuote} className='bg-blue-600 text-white px-10 text-lg p-3 mb-10 mt-4 block hover:bg-blue-700'><i className="fa fa-add mr-2"></i>Add a quote</button>
              {user && user.quotes && currentQuotePage == 1 && user.quotes.map((el, i) => {
                  return (
                    <div className="bg-blue-950 p-5 text-white my-5 relative" key={el.id}>
                      <p className="clear-both break-words text-xl pt-3">"{el.text}"</p>
                        <span className="block mt-5">Submitted by: <NavLink className="text-blue-400 hover:underline" to={"/profile/"+el.user}>{el.user}</NavLink></span>
                        <span className="absolute top-3 right-5"><i className="fa fa-pencil text-amber-500 cursor-pointer text-2xl" onClick={showEditQuote} data-text={el.text} data-quote={el.id}></i><i className="fa fa-trash ml-5 text-red-600 cursor-pointer text-2xl" onClick={deleteQuote} data-quote={el.id}></i></span>
                      <div>
                        {user && user.likes.find(x => x.quote == el.id) &&
                          <i onClick={likeQuote} className="fa-solid fa-heart text-2xl mt-3 cursor-pointer" data-quote={el.id}></i>
                        }
                        {user && !user.likes.find(x => x.quote == el.id) &&
                          <i onClick={likeQuote} className="fa-regular fa-heart text-2xl mt-3 cursor-pointer" data-quote={el.id}></i>
                        }
                        {!user &&
                          <NavLink to="/login"><i className="fa-regular fa-heart text-2xl mt-3 cursor-pointer"></i></NavLink>
                        }
                        <span className="pl-2 text-xl">{el.likes}</span>
                      </div>
                    </div>
                  )
              })}
              {book.quotes && book.quotes.map((el, i) => {
                  if(user && el.user == user.login) return
                  return (
                    <div className="bg-neutral-700 p-5 text-white my-5 relative" key={el.id}>
                      <p className="clear-both break-words  text-xl pt-3">"{el.text}"</p>
                        <span className="block mt-5">Submitted by: <NavLink className="text-blue-400 hover:underline" to={"/profile/"+el.user}>{el.user}</NavLink></span>
                        <span className="absolute top-3 right-5">
                          {user &&
                            <span onClick={toggleDropdown}><i className="fa fa-ellipsis-vertical cursor-pointer text-2xl p-2"></i></span>
                          }
                        </span>
                      {user &&
                      <div onClick={(e) => e.stopPropagation()} className="drop_menu bg-neutral-600 w-fit p-2 gap-1 flex flex-col absolute right-5 top-14 hidden">
                        {user.admin != 0 &&
                          <p className="text-red-400 hover:bg-neutral-700 p-2 px-3 cursor-pointer" onClick={deleteQuote} data-quote={el.id}><i className="fa fa-trash mr-2"></i>Delete</p>
                        }
                        <p data-id={el.id} data-type={"quote"} onClick={report} className="text-red-400 hover:bg-neutral-700 p-2 px-3 cursor-pointer"><i className="fa fa-triangle-exclamation mr-2"></i>Report</p>
                      </div>
                      }
                      <div>
                        {user && user.likes.find(x => x.quote == el.id) &&
                          <i onClick={likeQuote} className="fa-solid fa-heart text-2xl mt-3 cursor-pointer" data-quote={el.id}></i>
                        }
                        {user && !user.likes.find(x => x.quote == el.id) &&
                          <i onClick={likeQuote} className="fa-regular fa-heart text-2xl mt-3 cursor-pointer" data-quote={el.id}></i>
                        }
                        {!user &&
                          <NavLink to="/login"><i className="fa-regular fa-heart text-2xl mt-3 cursor-pointer"></i></NavLink>
                        }
                        <span className="pl-2 text-xl">{el.likes}</span>
                      </div>
                    </div>
                  )
              })}
              {quotePages > 1 &&
                <>
                  <ReactPaginate
                    breakLabel="..."
                    nextLabel="Next"
                    pageRangeDisplayed={5}
                    pageCount={quotePages}
                    previousLabel="Previous"
                    renderOnZeroPageCount={null}
                    onPageChange={quotePageChange}
                    className="flex gap-3 mb-10"
                    nextLinkClassName="cursor-pointer bg-blue-500 w-8 text-slate-200 h-8 text-lg flex justify-center items-center p-5 px-10 hover:bg-blue-600"
                    previousLinkClassName="cursor-pointer bg-blue-500 w-8 text-slate-200 h-8 text-lg flex justify-center items-center p-5 px-12 hover:bg-blue-600"
                    pageLinkClassName="cursor-pointer bg-blue-500 block p-5 flex justify-center items-center w-8 text-slate-200 h-8 text-xl hover:bg-blue-600"
                    activeClassName="brightness-125"
                  />
                </>
              }
            </div>
          }
          {!book.id > 0 && !loading &&
            <NoMatch></NoMatch>
          }
      </div>
      {
        <div className="new_quote z-40 hidden fixed top-0 bottom-0 right-0 left-0 bg-neutral-800 flex justify-center items-center" style={{background: "rgba(50,50,50,0.9)"}}>
        <div className="bg-neutral-700 p-5 pb-8 text-white">
          <div className="flex justify-between">
            <h1 className="text-xl font-semibold">Add a quote</h1>
            <i className="fa fa-close mr-1 text-xl cursor-pointer" onClick={closeNewQuote}></i>
          </div>
          <textarea value={newQuote} onChange={(e) => setNewQuote(e.target.value)} className="mt-4 outline-none text-lg border text-sm rounded-lg h-32 block sm:w-96 w-64 p-2.5 bg-neutral-600 border-neutral-500 placeholder-gray-400 text-white" placeholder="You should probably write it here..."/>
        <button onClick={addQuote} className='bg-blue-600 text-white px-10 text-lg p-3 mt-5 block hover:bg-blue-700'>Submit</button>
        </div>
      </div>
      }
      {user &&
        <div className="edit_quote z-40 hidden fixed top-0 bottom-0 right-0 left-0 bg-neutral-800 flex justify-center items-center" style={{background: "rgba(50,50,50,0.9)"}}>
        <div className="bg-neutral-700 p-5 pb-8 text-white">
          <div className="flex justify-between">
            <h1 className="text-xl font-semibold">Edit a quote</h1>
            <i className="fa fa-close mr-1 text-xl cursor-pointer" onClick={closeEditQuote}></i>
          </div>
          <textarea value={editQuote} onChange={(e) => setEditQuote(e.target.value)} className="mt-4 outline-none text-lg border text-sm rounded-lg h-32 block sm:w-96 w-64 p-2.5 bg-neutral-600 border-neutral-500 placeholder-gray-400 text-white" placeholder="You should probably write it here..."/>
        <button onClick={editQuoteFun} className='bg-blue-600 text-white px-10 text-lg p-3 mt-5 block hover:bg-blue-700'>Submit</button>
        </div>
      </div>
      }
      {!book.id > 0 && loading &&
        <div role="status" className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-neutral-800 z-50">
        <svg aria-hidden="true" className="inline w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        </div>
      }
      {user &&
      <>
      <div className="edit z-40 hidden fixed top-0 bottom-0 right-0 left-0 bg-neutral-800 flex justify-center items-center" style={{background: "rgba(50,50,50,0.9)"}}>
        <div className="bg-neutral-700 p-5 pb-8 text-white">
          <div className="flex justify-between">
            <h1 className="text-xl font-semibold">Edit review</h1>
            <i className="fa fa-close mr-1 text-xl cursor-pointer" onClick={closeEdit}></i>
          </div>
          <textarea value={editReview} onChange={(e) => setEditReview(e.target.value)} className="mt-4 outline-none text-lg border text-sm rounded-lg block sm:w-96 w-64 p-2.5 bg-neutral-600 border-neutral-500 placeholder-gray-400 text-white" placeholder="What do you think?"/>
          <div className="inline-flex mt-3 items-center">
              <label className="flex items-center cursor-pointer relative mt-2">
                <input checked={editSpoiler} onChange={(e) => setEditSpoiler(e.target.checked)} type="checkbox" className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-200 checked:bg-blue-500 checked:border-slate-800" id="check" />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </span>
              </label>
              <span className="text-white pl-2 pt-2">Mark as a spoiler</span>
            </div> 
        <button onClick={editReviewFun} className='bg-blue-600 text-white px-10 text-lg p-3 mt-5 block hover:bg-blue-700'>Edit</button>
        </div>
      </div>
      <div className="add_to_collection z-40 hidden fixed top-0 bottom-0 right-0 left-0 bg-neutral-800 flex justify-center items-center" style={{background: "rgba(50,50,50,0.9)"}}>
      <div className="bg-neutral-700 p-5 pb-8 text-white">
        <div className="flex justify-between gap-5">
          <h1 className="text-xl font-semibold">Add to collections</h1>
          <i className="fa fa-close mr-1 text-xl cursor-pointer" onClick={closeAddToCollection}></i>
        </div>
      <div className="flex flex-col mt-4">
        {user.collections.map((el,i) => {
          if(!el.books.includes(":"+book_id+"}")){
            return(
              <div key={i} className="bg-neutral-600 p-3 flex justify-between mt-3">
                <p className="text-xl">{el.name}</p>
                <label className="flex items-center cursor-pointer relative mt-1">
                <input onClick={(e) => e.target.checked ? newCollections.push(el.id) : setNewCollections(newCollections.filter(x => x != el.id))} type="checkbox" className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-200 checked:bg-blue-500 checked:border-slate-800" id="check" />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </span>
              </label>
              </div>
            )
          }
        })}
      </div>
      <button onClick={addToCollection} className='bg-blue-600 text-white px-10 text-lg p-3 mt-5 block hover:bg-blue-700'>Add</button>
      </div>
    </div>
    </>
      }
    </>
  )
}

export default Book
