import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { FileUpload } from 'primereact/fileupload';
import { useDecision } from "../components/useDecision";

function NewAuthor(props) {
  const navigator = useNavigate()
  const [loading, setLoading] = useState(true)
  const fileUploadRef = useRef(null);
  const [birth, setBirth] = useState('')
  const [death, setDeath] = useState('')
  const [desc, setDesc] = useState("")
  const [photo, setPhoto] = useState([])
  const [waiting, setWaiting] = useState([])
  const [showWaiting, setShowWaiting] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [names, setNames] = useState([""])

  const editUploadRef = useRef(null)
  const [editNames, setEditNames] = useState([""])
  const [editBirth, setEditBirth] = useState('')
  const [editDeath, setEditDeath] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPhoto, setEditPhoto] = useState([])
  const [editPhotoName, setEditPhotoName] = useState([])
  const [deletedPhoto, setDeletedPhoto] = useState(false)
  const [editID, setEditID] = useState(0)

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
        setLoading(false)
      }
    })
    fetch("http://localhost:3000/waiting_author_submissions", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(res => res.json()).then(res => {
      setWaiting([...res])
    })
  }, [refresh])
  const submit = async () => {
    if(waiting.length >= 10){
      props.setToast({type: "error", text: "You already submited a few authors. Now wait!"})
      return;
    }
    let no_name = 0;
    names.forEach(el => {
      el = el.trim()
      if(el.length < 1 || el.replace(" ", "").length < 1){
        no_name = no_name+1;
        return
      }
    })
    if(no_name == names.length){
      props.setToast({type: "error", text: "Fill the necessary fields!"})
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
      formData.append('names', names);
      formData.append('birth', birth);
      formData.append('death', death);
      formData.append('desc', desc);
      formData.append('img', photo[0]);
      fetch("http://localhost:3000/add_author", {
        credentials: 'include',
        method: "POST",
        body: formData
      }).then(() => {
        setRefresh(!refresh)
        setNames([''])
        setBirth('')
        setDeath('')
        setDesc('')
        setPhoto([])
        document.querySelector('.name1').value = ""
        fileUploadRef.current.setFiles([])
        window.scrollTo(0,0);
        props.setToast({type: "msg", text: "Your submission is now waiting to be accepted!"})
      })
  }
  const toggleWaiting = () => {
    if(!showWaiting){
      event.target.classList.remove("fa-angle-down")
      event.target.classList.add("fa-angle-up")
    }else{
      event.target.classList.remove("fa-angle-up")
      event.target.classList.add("fa-angle-down")
    }
    setShowWaiting(prev => !prev)
  }
  const deleteSubmission = async () => {
    const id = event.target.dataset.id
    const submission = waiting.find(x => x.id == id)
    if (document.querySelector(".decision")) document.querySelector('.decision').remove()
      const response = await useDecision().then(function () {
          document.querySelector(".decision").remove()
          return
      }, function () {
          document.querySelector(".decision").remove()
          return "stop"
      });
      if(response) return
      fetch("http://localhost:3000/delete_author_submission", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          img: submission.photo
        })
      }).then(() => {
        setRefresh(prev => !prev)
        props.setToast({type: "msg", text: "Deleted a submission!"})
      })
  }
  const closeEdit = () => {
    document.querySelector('.edit').classList.add("hidden")
    setEditNames([''])
    setEditBirth("")
    setEditDeath("")
    setEditDesc("")
    setEditPhoto([])
    setEditPhotoName("")
    setDeletedPhoto(false)
    setEditID(0)
    editUploadRef.current.setFiles([])
  }
  const showEdit = () => {
    document.querySelector('.edit').classList.remove("hidden")
    let submission = waiting.find(x => x.id == event.target.dataset.id)
    setEditNames(submission.names.split(","))
    setEditBirth(submission.birth)
    setEditDeath(submission.death)
    setEditDesc(submission.description)
    setEditPhotoName(submission.photo)
    setEditID(event.target.dataset.id)
  }
  const deletePhoto = async () => {
    if (document.querySelector(".decision")) document.querySelector('.decision').remove()
      const response = await useDecision().then(function () {
          document.querySelector(".decision").remove()
          return
      }, function () {
          document.querySelector(".decision").remove()
          return "stop"
      });
      if(response) return
    setDeletedPhoto(true)
  }
  const editSubmission = async () => {
    let no_name = 0;
    names.forEach(el => {
      el = el.trim()
      if(el.length < 1 || el.replace(" ", "").length < 1){
        no_name = no_name+1;
        return
      }
    })
    if(no_name == names.length){
      props.setToast({type: "error", text: "Fill the necessary fields!"})
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
      formData.append('names', editNames);
      formData.append('birth', editBirth);
      formData.append('death', editDeath);
      formData.append('desc', editDesc);
      formData.append('img', editPhoto[0]);
      formData.append('delete_photo', deletedPhoto);
      formData.append('id', editID);
      formData.append("old_photo", editPhotoName)
      fetch("http://localhost:3000/edit_author_submission", {
        credentials: 'include',
        method: "POST",
        body: formData
      }).then(() => {
        setRefresh(prev => !prev)
        closeEdit()
        props.setToast({type: "msg", text: "Edited the submission!", stay: true})
      })
  }
  const deleteName = (index) => {
    setNames((prev) => prev.filter((_, i) => i !== index));
  };
  const deleteEditName = (index) => {
    setEditNames((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <>
      {!loading &&
      <>
        {waiting.length > 0 &&
          <>
          <div className="mx-2 sm:mx-5 bg-neutral-700 h-16 !mt-10 flex justify-between items-center sm:p-5 p-3 text-lg sm:text-xl">
            <span>Waiting submissions ({waiting.length})</span>
            <i className="fa fa-angle-down cursor-pointer" onClick={toggleWaiting}></i>
          </div>
          {showWaiting && waiting.map(el => {
            return(
              <div key={el.id} className="flex bg-neutral-600 text-white p-3 hover:bg-neutral-500 mx-2 sm:mx-5 mb-1 mt-1">
                <img onError={(e) => e.target.src = "../../public/default.jpg"} src={"/user_uploads/authors/"+el.photo} className="h-20 mr-3"></img>
                <div className="w-full">
                <h2 className="text-2xl break-keep flex justify-between">{el.names}<span><i data-id={el.id} onClick={showEdit} className="fa fa-pencil text-amber-500 mr-3 cursor-pointer"></i><i onClick={deleteSubmission} data-id={el.id} className="fa fa-trash text-red-500 cursor-pointer"></i></span></h2>
                <p className="text-neutral-300 text-lg">{el.birth} - {el.death}</p>
                </div>
              </div>
            )
          })
          }
          </>
        } 
          <div className="w-full lg:w-1/2 float-left p-2 sm:p-5 mb-28">
        <div className="bg-neutral-700  h-full w-full p-5">
          <h1 className="text-white text-3xl">Add a new author</h1>
          {names.map((el, i) => {
            return(
              <div key={i} className="relative">
              <input value={el} 
                onChange={(e) => {
                  const updated = [...names];
                  updated[i] = e.target.value;
                  setNames(updated);
                }} type="text" className="mt-5 outline-none text-lg border text-sm rounded-lg block p-2.5 w-full bg-neutral-600 border-blue-500 placeholder-gray-400 text-white name1" placeholder="Name"/>
              {i != 0 &&
                  <i onClick={() => deleteName(i)} className="fa fa-x absolute top-3 right-3 text-red-500 cursor-pointer"></i>
              }
              </div>
            )
          })}
          <button onClick={(e) => setNames(names.concat([""]))} className='bg-blue-600 text-white px-5 p-2 mt-4 block hover:bg-blue-700'><i className="fa fa-plus mr-2"></i>Add another name/alias</button>
          <input value={birth} onChange={(e) => setBirth(e.target.value)} type="text" className="mt-4 outline-none text-lg border text-sm rounded-lg block w-full p-2.5 bg-neutral-600 border-neutral-500 placeholder-gray-400 text-white" placeholder="Year of birth"/> 
          <input value={death} onChange={(e) => setDeath(e.target.value)} type="text" className="mt-4 outline-none text-lg border text-sm rounded-lg block w-full p-2.5 bg-neutral-600 border-neutral-500 placeholder-gray-400 text-white" placeholder="Year of death"/> 
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="bg-neutral-600 mt-5 border border-neutral-500 rounded w-full h-32 outline-none p-2" placeholder="Description"></textarea>
          <FileUpload className="mt-5" ref={fileUploadRef} showuploadbutton="false" customUpload={true} accept="image/*" maxFileSize={5000000} emptyTemplate={<p className="m-0">Upload a photo.</p>} onSelect={(e) => setPhoto(e.files)} onClear={() => setPhoto([])} onRemove={() => setPhoto([])}></FileUpload>
          <button onClick={submit} className='bg-blue-600 text-white px-10 text-lg p-3 mt-5 block hover:bg-blue-700'><i className="fa fa-send mr-2"></i>Submit a new author</button>
        </div>
      </div>
      <div className="px-10 mt-5 w-1/2 float-left flex justify-center hidden lg:block">
        <img src="/collection.svg" className="h-[550px]"></img>
      </div>
      <div className="edit p-5 overflow-scroll z-50 hidden fixed top-0 h-full max-h-full right-0 left-0 bg-neutral-800 flex justify-center" style={{background: "rgba(50,50,50,0.9)"}}>
      <div className="bg-neutral-700 h-fit p-5 w-full md:w-1/2">
          <div className="flex justify-between">
            <h1 className="text-xl font-semibold">Edit submission</h1>
            <i className="fa fa-close mr-1 text-xl cursor-pointer" onClick={closeEdit}></i>
          </div>
          {editNames.map((el, i) => {
            return(
              <div key={i} className="relative">
              <input value={el} 
                onChange={(e) => {
                  const updated = [...editNames];
                  updated[i] = e.target.value;
                  setEditNames(updated);
                }} type="text" className="mt-5 outline-none text-lg border text-sm rounded-lg block p-2.5 w-full bg-neutral-600 border-blue-500 placeholder-gray-400 text-white name1" placeholder="Name"/>
              {i != 0 &&
                  <i onClick={() => deleteEditName(i)} className="fa fa-x absolute top-3 right-3 text-red-500 cursor-pointer"></i>
              }
              </div>
            )
          })}
          <button onClick={(e) => setEditNames(editNames.concat([""]))} className='bg-blue-600 text-white px-5 p-2 mt-4 block hover:bg-blue-700'><i className="fa fa-plus mr-2"></i>Add another name/alias</button>
          <input value={editBirth} onChange={(e) => setEditBirth(e.target.value)} type="text" className="mt-4 outline-none text-lg border text-sm rounded-lg block w-full p-2.5 bg-neutral-600 border-neutral-500 placeholder-gray-400 text-white" placeholder="Year of birth"/> 
          <input value={editDeath} onChange={(e) => setEditDeath(e.target.value)} type="text" className="mt-4 outline-none text-lg border text-sm rounded-lg block w-full p-2.5 bg-neutral-600 border-neutral-500 placeholder-gray-400 text-white" placeholder="Year of death"/> 
          <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="bg-neutral-600 mt-5 border border-neutral-500 rounded w-full h-32 outline-none p-2" placeholder="Description"></textarea>
          {editPhotoName.length > 0 && !deletedPhoto &&
            <>
              <p className="mt-2 text-xl">Current photo:</p>
              <button onClick={deletePhoto} className='bg-blue-600 text-white px-5 p-3 my-1 block hover:bg-blue-700'><i className="fa fa-trash mr-2"></i>Delete</button>
              <img onError={(e) => e.target.src = "../../public/default.jpg"} src={"/user_uploads/authors/"+editPhotoName} className="h-24 mr-3 mb-5 mt-2"></img>
            </>
          }
          <FileUpload className="mt-5 clear-both" ref={editUploadRef} showuploadbutton="false" customUpload={true} accept="image/*" maxFileSize={5000000} emptyTemplate={<p className="m-0">Upload a new photo.</p>} onSelect={(e) => setEditPhoto(e.files)} onClear={() => setEditPhoto([])} onRemove={() => setEditPhoto([])}></FileUpload>
          <button onClick={editSubmission} className='bg-blue-600 text-white px-10 text-lg p-3 mt-5 block hover:bg-blue-700'><i className="fa fa-send mr-2"></i>Edit submission</button>
        </div>
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

export default NewAuthor
