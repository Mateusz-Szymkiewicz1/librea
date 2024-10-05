import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState()
  const [recentlyrated, setRecentlyrated] = useState([])
  const [recentreviews, setRecentreviews] = useState([])
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
        }).then(res2 => res2.json()).then(res2 => {
          if(!res2.text){
            console.log(res2[0])
            res2[0].katalogi = JSON.parse(res2[0].katalogi)
            setUser(res2[0])
            if(res2[0].ratings){
              res2[0].ratings.slice(-5).reverse().forEach(el => {
                fetch("http://localhost:3000/book/"+el.book).then(res => res.json()).then(res => {
                  if(!res.text){
                    setRecentlyrated([...recentlyrated, res[0]])
                  }
                })
              })
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
      }
    })
  }, [])
  return (
    <>
      {!user && <div>
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

        <div className='flex flex-wrap justify-evenly text-slate-200 w-full bg-blue-700 my-12'>
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
      { user &&
        <>
          <h1 className="text-slate-200 font-semibold text-2xl ml-5 mt-10">Welcome back, {user.login}</h1>
          {user.katalogi.length == 0 &&
            <>
              <p className='text-neutral-400 text-xl ml-5 mt-2'>You haven't created a single collection yet!</p>
              <NavLink to="/collection/new"><button className='bg-blue-600 text-white text-lg p-3 ml-5 mt-3 hover:bg-blue-700'>Start right now</button></NavLink>
            </>
          }
          {user.ratings.length > 0 &&
            <>
              <p className='text-slate-200 font-semibold text-2xl ml-5 mt-16'>Recently rated</p>
              <div className='flex flex-wrap gap-5 ml-5 my-3 mb-20'>
                {recentlyrated.map((el,i) => 
                <NavLink to={"/book/"+el.id} key={i}><div className='bg-neutral-700 hover:bg-neutral-600 p-5'>
                  <img className="h-72 border border-neutral-500" src={"../../public/uploads/"+el.okladka} onError={(e) => e.target.src = "../../public/default.jpg"}></img>
                  <p className="text-white mt-3 text-xl">{el.tytul}</p>
                  <p className="text-slate-200 mt-1 text-lg">{el.autor}</p>
                </div></NavLink>)}
              </div>
            </>
          }
          {user.reviews.length > 0 &&
            <>
              <p className='text-slate-200 font-semibold text-2xl ml-5 mt-16'>Recent reviews</p>
              <div className='flex flex-wrap gap-5 ml-5 my-3 mb-20'>
                {recentreviews.map((el,i) => 
                <NavLink to={"/book/"+el.id} key={i}><div className='bg-neutral-700 hover:bg-neutral-600 p-5'>
                  <img className="h-72 border border-neutral-500" src={"../../public/uploads/"+el.okladka} onError={(e) => e.target.src = "../../public/default.jpg"}></img>
                  <p className="text-white mt-3 text-xl">{el.tytul}</p>
                  <p className="text-slate-200 mt-1 text-lg">{el.autor}</p>
                </div></NavLink>)}
              </div>
            </>
          }
        </>
      }
    </>
  )
}

export default Home
