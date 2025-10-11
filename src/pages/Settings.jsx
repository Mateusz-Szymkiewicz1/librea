import { useEffect, useState } from "react"
import { useDecision } from "../components/useDecision"

function Settings(props) {
  document.title = `Settings | Librea`
  const [user, setUser] = useState()
  const [loading, setLoading] = useState(true)
  const [editLogin, setEditLogin] = useState("")
  const [editPass, setEditPass] = useState("")
  const [editPass2, setEditPass2] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [showPass2, setShowPass2] = useState(false)
  useEffect(() => {
    fetch("http://localhost:3000/login", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(res => res.json()).then(res => {
      if(res.text){
        window.location.href = "/"
      }else{
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
          }
        })
      }
    })
  }, [])
  const togglePassword = (e) => {
    setShowPass(!showPass)
    if(document.querySelector('#password').type == "password"){
      document.querySelector('#password').type = "text"
    }else{
      document.querySelector('#password').type = "password"
    }
  }
  const togglePassword2 = (e) => {
    setShowPass2(!showPass2)
    if(document.querySelector('#password2').type == "password"){
      document.querySelector('#password2').type = "text"
    }else{
      document.querySelector('#password2').type = "password"
    }
  }
  const changeLogin = async () => {
    if(!editLogin || editLogin == user.login){
      props.setToast({type: "error", text: "Type in a new username first!"})
      return;
    }
    if(!/^[A-Za-z0-9]+([A-Za-z0-9]*|[]?[A-Za-z0-9]+)*$/.test(editLogin)){
      props.setToast({type: "error",text: "Can't put special characters in the username!"})
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
      fetch("http://localhost:3000/change_login", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          new_login: editLogin
        }),
      }).then(res => {
        fetch("http://localhost:3000/signout", {
          credentials: 'include',
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          }
        }).then(() => window.location.href = '/login')
      })
  }
  const changePass = async () => {
    if(!editPass || !editPass2){
      props.setToast({type: "error",text: "Type in your new password first!"})
      return;
    }
    if(editPass != editPass2){
      props.setToast({type: "error",text: "The passwords are not the same!"})
      return;
    }
    if(editPass.length < 5){
      props.setToast({type:"error", text: "Password is too short!"})
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
      fetch("http://localhost:3000/change_password", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          new_pass: editPass
        }),
      }).then(res => {
        fetch("http://localhost:3000/signout", {
          credentials: 'include',
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          }
        }).then(() => window.location.href = '/login')
      })
  }
  let deleteAccount = async () => {
    if (document.querySelector(".decision")) document.querySelector('.decision').remove()
      const response = await useDecision().then(function () {
          document.querySelector(".decision").remove()
          return
      }, function () {
          document.querySelector(".decision").remove()
          return "stop"
      });
      if(response) return
      fetch("http://localhost:3000/delete_account", {
          credentials: 'include',
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          }
      }).then(() => window.location.href = '/')
  }
  let change_visibility = async () => {
    if (document.querySelector(".decision")) document.querySelector('.decision').remove()
      const response = await useDecision().then(function () {
          document.querySelector(".decision").remove()
          return
      }, function () {
          document.querySelector(".decision").remove()
          return "stop"
      });
      if(response) return
    user.private = !user.private
    setUser({...user, private: user.private})
    fetch("http://localhost:3000/change_visibility", {
          credentials: 'include',
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            change_to: user.private ? "private" : "public"
          }),
      })
  }
  return (
    <div className="ml-5 mt-10">
      {user &&
        <>
          <h1 className="text-3xl"><i className="fa fa-cogs mr-3 text-blue-500"></i>Settings</h1>
          <p className="text-xl text-slate-200 mt-16">Account</p>
          <div className="bg-neutral-900 shadow-xl p-5 w-fit min-w-72 mt-5">
          <div className="flex flex-col flex-wrap">
          <span className="ml-1 text-xl"><i className="fa fa-user mr-2"></i>Username</span>
          <input type="text" maxLength="50" onChange={(e) => setEditLogin(e.target.value)} className="mt-4 p-2 w-56 bg-neutral-600 rounded-md focus:outline-none mr-2" placeholder={user.login}></input>
          <button onClick={changeLogin} className="shadow bg-blue-500 w-fit p-2 mt-4 px-4 hover:bg-blue-600"><i className="fa fa-rotate mr-1"></i>Change username</button>
          </div>
          <div className="flex flex-col mt-7">
          <span className="ml-1 text-xl"><i className="fa fa-key mr-2"></i>Password</span>
          <div className="relative w-fit mr-2">
            <input placeholder="********" id="password" type="password" onChange={(e) => setEditPass(e.target.value)} maxLength="100" className="mt-3 p-2 pr-10 w-50 bg-neutral-600 rounded-md focus:outline-none"></input>
            <button onClick={togglePassword} type="button" className="absolute inset-y-8 end-0 flex items-center z-20 px-3 cursor-pointer rounded-e-md focus:outline-none text-neutral-400">
              <svg className="shrink-0 size-3.5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {!showPass && 
                  <>
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                  <line x1="2" x2="22" y1="2" y2="22"></line>    
                  </> 
                }
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
        </div>
        <div className="relative w-fit mr-2">
            <input placeholder="********" id="password2" type="password" onChange={(e) => setEditPass2(e.target.value)} maxLength="100" className="mt-3 p-2 pr-10 w-50 bg-neutral-600 rounded-md focus:outline-none"></input>
            <button onClick={togglePassword2} type="button" className="absolute inset-y-8 end-0 flex items-center z-20 px-3 cursor-pointer rounded-e-md focus:outline-none text-neutral-400">
              <svg className="shrink-0 size-3.5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {!showPass2 && 
                  <>
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                  <line x1="2" x2="22" y1="2" y2="22"></line>    
                  </> 
                }
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
        </div>
        <button className="shadow bg-blue-500 w-fit h-10 px-4 hover:bg-blue-600 mt-3" onClick={changePass}><i className="fa fa-rotate mr-1"></i>Change password</button>
        </div>
        <span className="ml-1 text-xl block mt-7"><i className="fa fa-eye mr-2"></i>Visiblity</span>
        <span className="mt-2 block">Your account is currently <span className="text-blue-500 italic">{user.private ? "Private" : "Public"}</span></span>
        <button className="shadow bg-blue-500 w-fit h-10 px-4 hover:bg-blue-600 mt-3" onClick={change_visibility}><i className="fa fa-rotate mr-1"></i>Switch to a {user.private ? "Public" : "Private"} account</button>
        <span className="ml-1 text-xl block mt-7 text-red-500"><i className="fa fa-skull mr-2"></i>Danger zone</span>
        <button className="shadow bg-red-500 w-fit h-10 px-4 hover:bg-red-600 mt-3" onClick={deleteAccount}><i className="fa fa-trash mr-1"></i>Delete the account</button>
        </div>
        </>
      }
      {!user && loading &&
        <div role="status" className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-neutral-800 z-50">
        <svg aria-hidden="true" className="inline w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        </div>
      }
    </div>
  )
}

export default Settings
