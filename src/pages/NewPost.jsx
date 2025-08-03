import { useEffect, useRef, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useDecision } from "../components/useDecision"
import { FileUpload } from 'primereact/fileupload';
import { Editor } from 'primereact/editor';

function NewPost(props) {
  const navigator = useNavigate()
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState(false)
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [preview, setPreview] = useState(false)
  const fileUploadRef = useRef(null);
  const [date, setDate] = useState("");

  useEffect(() => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  setDate(`${yyyy}-${mm}-${dd}`);
}, []);

  let edit_id = window.location.href.split('/').at(-1)
  let [oldImg, setOldImg] = useState("")
  let [oldText, setOldText] = useState("")
  let [deleted, setDeleted] = useState(false)

  useEffect(() => {
      fetch("http://localhost:3000/login", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      }).then(res => res.json()).then(res => {
        if(res.text){
          navigator("/")
        }else{
          fetch("http://localhost:3000/user/"+res, {
            credentials: 'include',
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }).then(res => res.json()).then(res =>{
            if(res[0].admin == 0){
              navigator("/")
            }else{
              setAdmin(true)
            }
            setLoading(false)
          })      
        }
      })
      if(edit_id !== "new"){
        fetch("http://localhost:3000/post/"+edit_id, {
            credentials: 'include',
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }).then(res => res.json()).then(res => {
            console.log(res[0].text)
            setTitle(res[0].title)
            setText(res[0].text)
            setOldImg(res[0].thumbnail)
            setOldText(res[0].text)
          })
      }
    }, [])
    const toggle_preview = () => {
    document.querySelector('.preview img').src = ""
    document.querySelector('.preview img').onerror = ""
    if(!title || !text){
      props.setToast({type:"error", text: "Empty title/content!"})
      return
    }
    document.querySelector('.preview div').innerHTML = text
    document.querySelector('.preview h2 span').innerText = title
    if(fileUploadRef.current.getFiles()[0]){
      document.querySelector('.preview img').src = fileUploadRef.current.getFiles()[0].objectURL
      document.querySelector('.preview img').onerror =  () => {
          document.querySelector('.preview img').src='../../src/assets/placeholder.png'
      }
    }
    if(preview){
      document.querySelector('body').style = ''
    }else{
      props.closeToast()
      document.querySelector('body').style = 'overflow: hidden;'
    }
    setPreview(prev => !prev)
  }
  const submit = async () => {
    if(!text || !title){
      props.setToast({type:"error", text: "Empty title/content!"})
      return
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
    const formData  = new FormData();
    formData.append('title', title);
    formData.append('text', text);
    formData.append('img', fileUploadRef.current.getFiles()[0]);
    fetch("http://localhost:3000/submit_blog_post", {
      credentials: 'include',
      method: "POST",
      body: formData
    }).then(() => {
      props.setToast({type:"msg", text: "Post added!", stay: true})
      navigator("/posts")
    })
  }
   const submit_edit = async () => {
    if(!text || !title){
      props.setToast({type:"error", text: "Empty title/content!"})
      return
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
    const formData  = new FormData();
    formData.append('id', edit_id);
    formData.append('title', title);
    formData.append('text', text);
    formData.append('oldtext', oldText);
    formData.append('deleted', deleted);
    formData.append('oldimg', oldImg);
    formData.append('img', fileUploadRef.current.getFiles()[0]);
    fetch("http://localhost:3000/edit_blog_post", {
      credentials: 'include',
      method: "POST",
      body: formData
    }).then(() => {
      props.setToast({type:"msg", text: "Edited a post!", stay: true})
      navigator("/post/"+edit_id)
    })
  }
  const deleteThumbnail = async () => {
    if (document.querySelector(".decision")) document.querySelector('.decision').remove()
    const response = await useDecision().then(function () {
        document.querySelector(".decision").remove()
        return
    }, function () {
        document.querySelector(".decision").remove()
        return "stop"
    });
    if(response) return
      setDeleted(true)
  }
  return (
    <>
      {!loading && admin &&
        <>
        <div className="flex flex-col px-12 lg:px-32">
          <h1 className="text-center font-semibold mb-10 text-4xl mt-16 text-slate-200">
            {edit_id == "new" ? "New Blog Post" : "Edit Blog Post"}
          </h1>
          <input value={title} onChange={() => setTitle(event.target.value)} type='text' maxLength="200" placeholder='Title...' className="shadow w-full outline-none rounded-md py-3 px-4 bg-neutral-700 text-sm text-slate-200 mb-5" />
          {oldImg && !deleted &&
            <div className="flex flex-wrap">
            <img className="mb-4 max-w-96 mr-4" src={'../../public/uploads/blog/'+oldImg} onError={(e) => e.target.src = "../../public/post_default.jpg"}></img>
            <div onClick={deleteThumbnail} className="shadow rounded-md mb-4 px-5 h-fit cursor-pointer text-white bg-blue-600 float-left p-3"><i className="fa fa-trash mr-3"></i>Delete thumbnail</div>
            </div>
          }
          <FileUpload ref={fileUploadRef} name="thumbnail[]" invalidfiletypemessage="Wrong file format!" chooseLabel="Add a thumbnail" accept="image/*" showuploadbutton="false" filelimit="1" emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} className="shadow-xl">
          </FileUpload>
          <Editor value={text} onTextChange={(e) => setText(e.htmlValue)} className="mt-5 shadow-xl" style={{ height: '320px' }} />
          <div>
            <div onClick={toggle_preview} className="rounded-md my-5 px-5 cursor-pointer text-white bg-blue-600 float-left p-3"><i className="fa fa-search mr-3"></i>Preview</div>
            {edit_id == "new" &&
              <div onClick={submit} className="shadow rounded-md ml-2 my-5 px-5 cursor-pointer text-white bg-blue-600 float-left p-3"><i className="fa fa-circle-plus mr-3"></i>Submit</div>
            }
            {edit_id != "new" &&
              <div onClick={submit_edit} className="shadow rounded-md ml-2 my-5 px-5 cursor-pointer text-white bg-blue-600 float-left p-3"><i className="fa fa-pencil mr-3"></i>Edit</div>
            }
          </div>
        </div>
        <div className={preview ? "block preview z-50 max-h-full overflow-y-scroll px-6 lg:px-8 fixed top-0 left-0 right-0 min-h-full bg-neutral-800" : "hidden preview z-50 max-h-full overflow-y-scroll px-6 lg:px-8 fixed top-0 left-0 right-0 min-h-full bg-neutral-800"}>
        <h1 className="text-center font-semibold text-gray-900 text-4xl mt-16 dark:text-slate-200">Preview</h1>
        <h2 className="font-semibold text-gray-900 text-5xl my-10 mt-16 dark:text-slate-200">
          <span></span>
          <span className="text-lg ml-2 dark:text-slate-400 font-normal mt-6 text-slate-600">{date}</span>
          <span className="text-lg ml-2 dark:text-slate-400 font-normal mt-6 text-slate-600"></span>
        </h2>
        <img></img>
        <div className="break-words md:pr-36 text-lg py-10 text-gray-700 dark:text-slate-400"></div>
        <i onClick={toggle_preview} className="fa fa-close text-4xl absolute top-5 right-7 cursor-pointer"></i>
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
    </>
  )
}

export default NewPost
