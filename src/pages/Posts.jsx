import { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useDecision } from "../components/useDecision"

function Posts() {
  const navigator = useNavigate()
  const [posts, setPosts] = useState([])
  const [offset, setOffset] = useState(0)
  const [user, setUser] = useState()
  const [loading, setLoading] = useState(false)

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
              setUser(res2[0])
            }
          })
        }
      })
  }, [])

  useEffect(() => {
    fetch("http://localhost:3000/posts", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        offset: offset
      })
    }).then(res => res.json()).then(res => {
      console.log(res)
      if(res.text){
        setPosts([])
        return;
      }
      setPosts([...res])
    })
  }, [offset])
const getPlainText = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};
const toggleDropdown = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    const menu = e.target.parentElement.parentElement.querySelector('.post_dropdown')
    document.querySelectorAll('.post_dropdown').forEach(el => {
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
  const deletePost = async (e, post_id) => {
    e.stopPropagation()
    e.preventDefault()
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
                navigator("/posts")
                props.setToast({type:"msg", text:"Deleted a post!", stay: true})
              })
  }
  return (
    <>
      {!loading &&
        <>
        <h1 className="text-center text-3xl my-12 font-semibold">Blog posts</h1>
        {posts.map(el => {
          const plainText = getPlainText(el.text);
          return (
            <NavLink to={"/post/"+el.id} key={el.id} className="bg-neutral-700 p-4 m-5 flex flex-col md:flex-row justify-between hover:bg-neutral-600 shadow relative">
              <div className="mr-12 lg:mr-20">
                <h2 className="text-2xl text-slate-200">{el.title}</h2>
                <span className="text-lg text-slate-300">{el.date.slice(0,10)}</span>
                <p className="text-lg text-slate-300 mt-3">{plainText.slice(0,250)+"..."}</p>
              </div>
              {el.thumbnail &&
                <img src={"../../public/uploads/blog/"+el.thumbnail} onError={(e) => e.target.src = "../../public/post_default.jpg"} className="max-w-96 max-h-96 shadow order-1 md:order-2 mt-4 md:mt-0"></img>
              }
              {user && user.admin == 1 &&
                <div>
                <div onClick={toggleDropdown} className="bg-blue-500 p-3 h-fit w-fit absolute top-3 right-3 shadow-lg">
                  <i className="fa fa-ellipsis-vertical"></i>
                </div>
                <div className="z-50 post_dropdown absolute right-3 top-16 bg-neutral-800 p-3 hidden">
                  <NavLink to={"/post/edit/"+el.id} className="block p-2 bg-orange-500 hover:bg-orange-600"><i className="fa fa-pencil mr-1"></i>Edit</NavLink>
                  <p onClick={(e) => deletePost(e, el.id)} className="p-2 bg-red-500 mt-2 hover:bg-red-600"><i className="fa fa-trash mr-1"></i>Delete</p>
                </div>
                </div>
              }
            </NavLink>
          )
        })}
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
    </>
  )
}

export default Posts
