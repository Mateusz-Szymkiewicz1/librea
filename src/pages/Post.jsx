import React, { useState, useEffect } from 'react';
import NoMatch from './NoMatch';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDecision } from '../components/useDecision';

function Post(props) {
  const navigator2 = useNavigate()
  let post_id = window.location.href.split('/').at(-1)
  const [post, setPost] = useState()
  const [user, setUser] = useState()
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
      fetch("http://localhost:3000/post/"+post_id, {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      }).then(res => res.json()).then(res => {
        console.log(res[0])
        if(!res.text){
          res[0].date = res[0].date.slice(0, 10)
          setPost(res[0])
        }
        setLoading(false)
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
            }
          })
        }
      })
    }, [])
    const deletePost = async () => {
        if (document.querySelector(".decision")) document.querySelector('.decision').remove()
          const response = await useDecision().then(function () {
              document.querySelector(".decision").remove()
              return
          }, function () {
              document.querySelector(".decision").remove()
              return "stop"
          });
          if(response) return
          fetch("http://localhost:3000/delete_post", {
            credentials: 'include',
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: post_id
            })
          }).then(res => res.json()).then(res => {
            navigator2("/posts")
            props.setToast({type:"msg", text:"Deleted a post!", stay: true})
          })
      }
      const like = (e) => {
        let link = ""
        if(e.target.classList.contains("fa-regular")){
          e.target.classList.remove("fa-regular")
          e.target.classList.add("fa-solid")
          link = "post_like"
          post.likes = parseInt(post.likes) + 1
          setPost({...post, likes: post.likes})
        }else{
          e.target.classList.remove("fa-solid")
          e.target.classList.add("fa-regular")
          link = "post_unlike"
          post.likes = parseInt(post.likes) - 1
          setPost({...post, likes: post.likes})
        }
        fetch("http://localhost:3000/"+link, {
          credentials: 'include',
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: post_id
          }),
        })
      }
      const share = () => {
        navigator.clipboard.writeText("http://localhost:5173/post/"+post_id)
        props.setToast({type: "msg", text: "Copied the link!"})
      }
  return (
    <>
      {post && post.id && !loading &&
        <>
        <div className="post px-5">
          <h1 className="font-semibold dark:text-slate-200 mt-10 mb-5 text-4xl">
            { post.title }
            <span className="text-lg dark:text-slate-400 font-normal text-slate-600 ml-1">{ post.date }</span>
          </h1>
          {post.thumbnail &&
            <img className='max-w-full' src={"../../public/uploads/blog/"+post.thumbnail} onError={(e) => e.target.src = "../../public/post_default.jpg"}></img>
          }
          {user && user.admin == 1 &&
            <div className='mt-5'>
              <NavLink to={"/post/edit/"+post_id}><button className='shadow bg-orange-500 text-white px-10 text-lg p-3 mb-3  hover:bg-orange-600'><i className="fa fa-pencil mr-3"></i>Edit post</button></NavLink>
              <button onClick={deletePost} className='shadow bg-red-600 text-white px-10 text-lg p-3 mb-10 block hover:bg-red-700'><i className="fa fa-trash mr-3"></i>Delete post</button>
            </div>
          }
          <p className="text-lg dark:text-slate-400 py-8" dangerouslySetInnerHTML={{__html: post.text}}></p>
        </div>
        <div className='flex gap-5 text-2xl mx-5 items-center'>
          <span>
          {user && user.likes.find(x => x.post == post_id) &&
            <i onClick={like} className="fa-solid fa-heart cursor-pointer mr-2"></i>
          }
          {user && !user.likes.find(x => x.post == post_id) &&
            <i onClick={like} className="fa-regular fa-heart cursor-pointer mr-2"></i>
          }
          {!user &&
            <NavLink to="/login"><i className="fa-regular fa-heart mr-2"></i></NavLink>
          }
          Like ({post.likes})</span>
          {!user &&
            <NavLink to="/login"><button className="bg-blue-500 hover:bg-blue-600 p-1 px-3 text-lg"><i className="fa fa-link mr-1"></i>Share</button></NavLink>
          }
          {user &&
            <button onClick={share} className="bg-blue-500 hover:bg-blue-600 p-1 px-3 text-lg"><i className="fa fa-link mr-1"></i>Share</button>
          }
        </div>
        <div className='mx-5 mt-16 md:mr-16 mr-10'>
          <h2 className='text-3xl'>Comments ({post.numOfComments})</h2>
          <textarea disabled={user ? false : true} className="shadow bg-neutral-600 mt-10 w-full h-48 outline-none text-white text-lg p-3 max-w-96" placeholder="What are your thoughts?"></textarea>
            {!user && 
              <p className="text-slate-200 pb-3 text-lg pt-3">You need to be logged in to write a comment.</p>
            }
            <button className='bg-blue-600 text-white px-10 text-lg p-3 mb-10 mt-3 block hover:bg-blue-700 shadow'><i className="fa fa-send mr-2"></i>Send</button>
        </div>
        </>
      }
      {loading &&
        <div role="status" className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-neutral-800 z-50">
        <svg aria-hidden="true" className="inline w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        </div>
      }
      {(!post || !post.id) && !loading &&
        <NoMatch></NoMatch>
      }
    </>
  )
}

export default Post
