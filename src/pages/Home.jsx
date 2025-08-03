import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import BookCard from '../components/BookCard.jsx';
import CollectionCard from '../components/CollectionCard.jsx';
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react"

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState()
  const [recentlyrated, setRecentlyrated] = useState([])
  const [recentreviews, setRecentreviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [popular, setPopular] = useState([])
  const [posts, setPosts] = useState([])
  const [newlyAdded, setNewlyAdded] = useState([])

   const [sliderRef, slider] = useKeenSlider({
    slides: { perView: 1, spacing: 20 },
    breakpoints: {
      "(min-width: 640px)": { slides: { perView: 2, spacing: 20 } },
      "(min-width: 1024px)": { slides: { perView: 3, spacing: 20 } },
      "(min-width: 1280px)": { slides: { perView: 4, spacing: 20 } },
    },
    loop: false,
  })

  useEffect(() => {
    fetch("http://localhost:3000/popular_books").then(res => res.json()).then(res => {
      setPopular([...res])
    })
    fetch("http://localhost:3000/recent_posts").then(res => res.json()).then(res => {
      console.log(res)
      setPosts([...res])
    })
    fetch("http://localhost:3000/new_books").then(res => res.json()).then(res => {
      setNewlyAdded([...res])
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
            console.log(res2[0])
            setUser(res2[0])
            setLoading(false)
            if(res2[0].collections){
              let userCopy = structuredClone(res2[0]);
              for (let collection of userCopy.collections) {
                collection.books = JSON.parse(collection.books);
                await Promise.all(
                  collection.books.map(async (book) => {
                    let res = await fetch("http://localhost:3000/book/" + book.id);
                    let data = await res.json();
                    if (!data.text) {
                      book.okladka = data[0].okladka;
                    }
                })
              ).then(() => {
                setUser(structuredClone(userCopy))
              })
              }
            }
            if(res2[0].ratings){
              res2[0].ratings.slice(-5).reverse().forEach(el => {
                fetch("http://localhost:3000/book/"+el.book).then(res => res.json()).then(res => {
                  if(!res.text){
                    recentlyrated.push(res[0])
                    setRecentlyrated([...recentlyrated])
                  }
                })
              })
            }
            if(res2[0].reviews){
              res2[0].reviews.slice(-5).reverse().forEach(el => {
                fetch("http://localhost:3000/book/"+el.book).then(res => res.json()).then(res => {
                  if(!res.text){
                    setRecentreviews([...recentreviews, res[0]])
                  }
                })
              })
            }
          }
        })
      }else{
        setLoading(false)
      }
    })
  }, [])
  return (
    <>
      {!user && !loading &&
      <div>
        <section className="p-6 text-slate-200 sm:mt-10">
          <div className="flex justify-between gap-10 sm:mx-16">
            <img src="hero.svg" alt="" className="object-contain h-72 lg:h-96 mt-16 lg:mt-0 hidden md:block" />
            <div className="py-16">
              <span className="block mb-2 text-blue-500">Librea book system</span>
              <h1 className="text-5xl font-extrabold text-blue-600">Start your own library</h1>
              <p className="my-8">
                <span className="font-medium">Quick and easy.</span> Organise your books into different catalogues to access them as quick as possible!
              </p>
              <div className="flex">
                <button type="button" onClick={() => navigate('/login')} className="w-1/3 mr-2 py-2 font-semibold rounded bg-blue-700 text-gray-50">Log in</button>
                <button type="button" onClick={() => navigate('/register')} className="w-1/3 ml-2 py-2 font-semibold rounded border border-blue-700 text-gray-50 hover:bg-blue-700 transition px-2">Make an account</button>
              </div>
            </div>
          </div>
        </section>

        <div className='flex shadow-lg flex-wrap justify-evenly text-slate-200 w-full bg-blue-700 my-12'>
          <div className='text-center h-48 flex justify-center items-center flex-col hover:bg-blue-600 w-48'>
            <i className="fa fa-search text-3xl mb-3"></i>
            <p className='text-2xl'>Organised</p>
          </div>
          <div className='text-center h-48 flex justify-center items-center flex-col hover:bg-blue-600 w-48'>
            <i className="fa fa-comments text-3xl mb-3"></i>
            <p className='text-2xl'>Community</p>
          </div>
          <div className='text-center h-48 flex justify-center items-center flex-col hover:bg-blue-600 w-48'>
            <i className="fa fa-shapes text-3xl mb-3"></i>
            <p className='text-2xl'>Easy</p>
          </div>
          <div className='text-center h-48 flex justify-center items-center flex-col hover:bg-blue-600 w-48'>
            <i className="fa fa-binoculars text-3xl mb-3"></i>
            <p className='text-2xl'>Discover</p>
          </div>
        </div>
      </div> }
      {!user && loading &&
        <div role="status" className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-neutral-800 z-50">
        <svg aria-hidden="true" className="inline w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        </div>
      }
      { user &&
        <>
          <h1 className="text-slate-200 font-semibold text-2xl ml-5 mt-10">Welcome back, {user.login}</h1>
          {user.collections.length == 0 &&
            <>
              <p className='text-neutral-400 text-xl ml-5 mt-2'>You haven't created a single collection yet!</p>
              <NavLink to="/collection/new"><button className='bg-blue-600 text-white text-lg p-3 ml-5 mt-3 hover:bg-blue-700'>Start right now</button></NavLink>
            </>
          }
          {user.collections.length > 0 &&
            <>
            <p className='text-slate-200 text-2xl ml-5 mt-16'>Your collections</p>
            <p className='text-slate-300 text-lg ml-5 mt-2'>Maybe try "to-read", "wishlist" or "books i absolutely loved"?</p>
            <NavLink to="/collection/new"><button className='bg-blue-600 text-white text-lg p-3 ml-5 mt-3 hover:bg-blue-700'><i className="fa fa-add mr-2"></i>Create a collection</button></NavLink>
            <div className='flex flex-wrap gap-5 ml-5 my-3 mb-20'>
            {user.collections.map(el =>
              <CollectionCard collection={el} key={el.id}></CollectionCard>
            )}
            </div>
            </>
          }
          {user.ratings.length > 0 &&
            <>
              <p className='text-slate-200 font-semibold text-2xl ml-5 mt-16'>Recently rated</p>
              <p className='text-slate-300 text-lg mt-2 ml-5'>Changed your mind?</p>
              <div className='flex flex-wrap gap-5 ml-5 my-3 mb-20'>
                {recentlyrated.map((el,i) => 
                  <BookCard book={el} key={el.id}></BookCard>
                )}
              </div>
            </>
          }
          {user.reviews.length > 0 &&
            <>
              <p className='text-slate-200 font-semibold text-2xl ml-5 mt-16'>Recent reviews</p>
              <p className='text-slate-300 text-lg mt-2 ml-5'>Maybe re-read it one more time? Are you sure?</p>
              <div className='flex flex-wrap gap-5 ml-5 my-3 mb-20'>
                {recentreviews.map((el,i) => 
                  <BookCard book={el} key={el.id}></BookCard>
                )}
              </div>
            </>
          }
        </>
      }
      {!loading &&
        <>
        <div className='mx-3 sm:mx-5'>
            <style>
            {`
              .keen-slider img {
                height: 180px !important; /* Match your placeholder height */
                object-fit: cover;
                width: 100%;
                background: #23272a;
                display: block;
              }
            `}
          </style>
        {popular.length > 0 &&
            <>
              <p className='text-slate-200 font-semibold text-2xl mt-16'>Popular</p>
              <p className='text-slate-300 text-lg mt-2'>These ones have been popping off 🔥🔥🔥</p>
              <div className='flex flex-wrap gap-5 my-3 mb-20'>
                {popular.map((el,i) => 
                  <BookCard book={el} key={el.id}></BookCard>
                )}
              </div>
            </>
          }
        </div>
        <div className='bg-neutral-700 p-5 shadow-lg'>
          <p className='text-slate-200 font-semibold text-2xl'>New blog posts</p>
          <p className='text-slate-300 text-lg mt-2'>Check what's been happening lately!</p>
          <div ref={sliderRef} className="keen-slider my-3">
                {posts.map((el, i) => (
                  <NavLink to={"/post/"+el.id} className="shadow keen-slider__slide bg-neutral-600 p-3 hover:bg-neutral-500" key={el.id}>
                    <span className='text-lg text-slate-200'>{el.date.slice(0,10)}</span>
                    <p className='text-xl mb-2'>{el.title}</p>
                    {!el.thumbnail &&
                      <img src="../../public/post_default.jpg"></img>
                    }
                    {el.thumbnail &&
                      <img src={"../../public/uploads/blog/"+el.thumbnail} onError={(e) => e.target.src = "../../public/post_default.jpg"}></img>
                    }
                  </NavLink>
                ))}
              </div>
            <NavLink to="/posts" className='text-blue-500 text-lg mt-2'>See more posts</NavLink>
            </div>
        <div className='mx-3 sm:mx-5'>
        {newlyAdded.length > 0 &&
            <>
              <p className='text-slate-200 font-semibold text-2xl mt-16'>Newly added</p>
              <p className='text-slate-300 text-lg mt-2'>Might want to give these ones a chance</p>
              <div className='flex flex-wrap gap-5 my-3 mb-20'>
                {newlyAdded.map((el,i) => 
                <BookCard book={el} key={el.id}></BookCard>
                )}
              </div>
            </>
          }
        </div>
        </>
      }
    </>
  )
}

export default Home
