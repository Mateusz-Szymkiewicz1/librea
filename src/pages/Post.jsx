import React, { useState, useEffect } from 'react';
import NoMatch from './NoMatch';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDecision } from '../components/useDecision';
import ReactPaginate from 'react-paginate';

function Post(props) {
  const navigator2 = useNavigate()
  let post_id = window.location.href.split('/').at(-1).split("#")[0]
  const [post, setPost] = useState()
  const [user, setUser] = useState()
  const [loading, setLoading] = useState(true)
  const [textarea, setTextarea] = useState("")
  const [pages, setPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [comment, setComment] = useState([])
  const [refresh, setRefresh] = useState(false)
  const [editComment, setEditComment] = useState("")
  
  useEffect(() => {
      fetch("http://localhost:3000/post/"+post_id+"?offset="+((currentPage-1)*2), {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      }).then(res => res.json()).then(res => {
        console.log(res[0])
        if(!res.text){
          res[0].date = res[0].date.slice(0, 10)
          setPages(Math.ceil((res[0].numOfComments)/2))
          setPost(res[0])
          document.title = `${res[0].title} | Librea`
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
            },
            body: JSON.stringify({
              post: post_id
            }),
          }).then(res2 => res2.json()).then(async res2 => {
            if(!res2.text){
              console.log(res2[0])
              setUser(res2[0])
              setComment(res2[0].comments.filter(x => x.post == post_id))
            }
          })
        }
      })
    }, [refresh])
    const pageChange = (e) => {
    let offset = (e.selected)*2
    setCurrentPage(e.selected+1)
    fetch('http://localhost:3000/post/'+post_id+"?offset="+offset, {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      }).then(res => res.json()).then(res => {
      if(res.status != 0){
        res[0].date = res[0].date.slice(0, 10)
        setPost(res[0])
        document.querySelector("#comments").scrollIntoView()
      }
    })
  }
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
    const submitComment = () => {
      if(!user) return
    if(comment.length > 0){
      props.setToast({type:"error", text: "You have written a comment already. You can edit it!"})
      return
    }
    if(textarea.length < 1){
      props.setToast({type:"error",text: "Don't send an empty comment!"})
      return
    }else{
      fetch("http://localhost:3000/comment", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post: post_id,
          text: textarea
        }),
      }).then(res => res.json()).then(res => {
          setTextarea("")
          document.querySelector("textarea").value = ""
          setRefresh(!refresh)
          props.setToast({type:"msg",text:"Comment published!"})
      })
    }
    }
    const deleteComment = async (e) => {
        if (document.querySelector(".decision")) document.querySelector('.decision').remove()
          const response = await useDecision().then(function () {
              document.querySelector(".decision").remove()
              return
          }, function () {
              document.querySelector(".decision").remove()
              return "stop"
          });
          if(response) return
        fetch("http://localhost:3000/delete_comment", {
          credentials: 'include',
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: e.target.dataset.comment
          })
        }).then(() => {
          setRefresh(!refresh)
          props.setToast({type:"msg",text:"Comment deleted!"})
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
    useEffect(() => {
        if(comment.length < 1) return
        setEditComment(comment[0].text)
      }, [comment])
     const closeEditComment = () => {
    document.querySelector('.editComment').classList.add("hidden")
  }
  const showEditComment = () => {
    document.querySelector('.editComment').classList.remove("hidden")
  }
  const editCommentFun = async () => {
    if(editComment.length < 1){
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
      fetch("http://localhost:3000/edit_comment", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: comment[0].id,
          text: editComment
        })
      }).then(() => {
        closeEditComment()
        setRefresh(!refresh)
        props.setToast({type:"msg",text:"Comment changed!"})
      })
  }
  const like_comment = (e) => {
    let link = ""
    if(e.target.classList.contains("fa-regular")){
      e.target.classList.remove("fa-regular")
      e.target.classList.add("fa-solid")
      link = "comment_like"
      let likes = parseInt(e.target.parentElement.querySelector("span").innerHTML)
      e.target.parentElement.querySelector("span").innerHTML = likes+1
    }else{
      e.target.classList.remove("fa-solid")
      e.target.classList.add("fa-regular")
      link = "comment_unlike"
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
        comment: e.target.dataset.comment
      }),
    })
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
          <button onClick={share} className="bg-blue-500 hover:bg-blue-600 p-1 px-3 text-lg"><i className="fa fa-link mr-1"></i>Share</button>
        </div>
        <div className='mx-5 mt-16 md:mr-16 mr-10'>
          <h2 className='text-3xl' id="comments">Comments ({post.numOfComments})</h2>
          <textarea onChange={(e) => setTextarea(e.target.value)} disabled={user ? false : true} className="shadow bg-neutral-600 mt-10 w-full h-48 outline-none text-white text-lg p-3 max-w-96" placeholder="What are your thoughts?"></textarea>
            {!user && 
              <p className="text-slate-200 pb-3 text-lg pt-3">You need to be logged in to write a comment.</p>
            }
            <button onClick={submitComment} className='bg-blue-600 text-white px-10 text-lg p-3 mb-10 mt-3 block hover:bg-blue-700 shadow'><i className="fa fa-send mr-2"></i>Send</button>
        {currentPage == 1 && comment.map((el, i) => {
                        return (
                          <div className="bg-blue-950 p-5 text-white my-5 shadow-lg" key={i}>
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
                              <span><i onClick={showEditComment} className="fa fa-pencil text-amber-500 cursor-pointer text-2xl"></i><i className="fa fa-trash ml-5 text-red-600 cursor-pointer text-2xl" onClick={deleteComment} data-comment={el.id}></i></span>
                            </div>
                            <p className="clear-both break-words text-xl pt-3">{el.text}</p>
                            <span className="text-slate-200 mt-2 block">{el.date.slice(0,10)}</span>
                            <div>
                              {user && user.likes.find(x => x.comment == el.id) &&
                                <i onClick={like_comment} className="fa-solid fa-heart text-2xl mt-2 cursor-pointer" data-comment={el.id}></i>
                              }
                              {user && !user.likes.find(x => x.comment == el.id) &&
                                <i onClick={like_comment} className="fa-regular fa-heart text-2xl mt-2 cursor-pointer" data-comment={el.id}></i>
                              }
                              <span className="pl-2 text-xl">{el.likes}</span>
                            </div>
                        </div>
                        )
                      })}
        {post.comments.map((el, i) => {
                          if(user && el.user == user.login) return
                          return (
                            <div className="shadow-lg bg-neutral-700 p-5 text-white my-5 relative" key={el.id}>
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
                                <span><i onClick={toggleDropdown} className="fa fa-ellipsis-vertical cursor-pointer text-2xl p-2"></i></span>
                              }
                              </div>
                              {user &&
                              <div onClick={(e) => e.stopPropagation()} className="drop_menu bg-neutral-600 w-fit p-2 gap-1 flex flex-col absolute right-5 hidden">
                                {user.admin != 0 &&
                                  <p onClick={deleteComment} className="text-red-400 hover:bg-neutral-700 p-2 px-3 cursor-pointer" data-comment={el.id}><i className="fa fa-trash mr-2"></i>Delete</p>
                                }
                                <p onClick={report} data-id={el.id} data-type={"comment"} className="text-red-400 hover:bg-neutral-700 p-2 px-3 cursor-pointer"><i className="fa fa-triangle-exclamation mr-2"></i>Report</p>
                              </div>
                              }
                              <p className="clear-both break-words  text-xl pt-3">{el.text}</p>
                              <span className="text-slate-200 mt-2 block">{el.date.slice(0,10)}</span>
                              <div>
                                {user && user.likes.find(x => x.review == el.id) &&
                                  <i onClick={like_comment} className="fa-solid fa-heart text-2xl mt-2 cursor-pointer" data-comment={el.id}></i>
                                }
                                {user && !user.likes.find(x => x.review == el.id) &&
                                  <i onClick={like_comment} className="fa-regular fa-heart text-2xl mt-2 cursor-pointer" data-comment={el.id}></i>
                                }
                                {!user &&
                                  <NavLink to="/login"><i className="fa-regular fa-heart text-2xl mt-2 cursor-pointer"></i></NavLink>
                                }
                                <span className="pl-2 text-xl">{el.likes}</span>
                              </div>
                            </div>
                          )
                      })}
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
                className="flex gap-3 sm:mr-16 mr-3 mb-10"
                nextLinkClassName="cursor-pointer bg-blue-500 w-8 text-slate-200 h-8 text-lg flex justify-center items-center p-5 px-10 hover:bg-blue-600"
                previousLinkClassName="cursor-pointer bg-blue-500 w-8 text-slate-200 h-8 text-lg flex justify-center items-center p-5 px-12 hover:bg-blue-600"
                pageLinkClassName="cursor-pointer bg-blue-500 block p-5 flex justify-center items-center w-8 text-slate-200 h-8 text-xl hover:bg-blue-600"
                activeClassName="brightness-125"
              />
            </>
          }
                  </div>
        </>
      }
      <div className="editComment z-40 hidden fixed top-0 bottom-0 right-0 left-0 bg-neutral-800 flex justify-center items-center" style={{background: "rgba(50,50,50,0.9)"}}>
        <div className="bg-neutral-700 p-5 pb-8 text-white">
          <div className="flex justify-between">
            <h1 className="text-xl font-semibold">Edit comment</h1>
            <i className="fa fa-close mr-1 text-xl cursor-pointer" onClick={closeEditComment}></i>
          </div>
          <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} className="mt-4 outline-none text-lg border text-sm rounded-lg block sm:w-96 w-64 p-2.5 bg-neutral-600 border-neutral-500 placeholder-gray-400 text-white" placeholder="What do you think?"/>
        <button onClick={editCommentFun} className='bg-blue-600 text-white px-10 text-lg p-2 mt-5 block hover:bg-blue-700'><i className="fa fa-pencil mr-2"></i>Edit</button>
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
      {(!post || !post.id) && !loading &&
        <NoMatch></NoMatch>
      }
    </>
  )
}

export default Post
