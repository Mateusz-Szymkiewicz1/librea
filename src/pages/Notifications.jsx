import { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"

function Notifications() {
  const navigator = useNavigate()
  const [user, setUser] = useState()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [offset, setOffset] = useState(0)
  const [refresh, setRefresh] = useState(false)
  const [numOfNotifs, setNumOfNotifs] = useState(0)
  const [owner, setOwner] = useState(false)
  const user_login = window.location.href.split('/').at(-1).split("#")[0]

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
          if(res[0].login != user_login){
            navigator("/")
          }else{
            setOwner(true)
          }
          setLoading(false)
        })      
      }
    })
  }, [])
  return (
    <>
      {!loading && owner &&
        <div className="bg-neutral-600 m-5 p-5 flex flex-col">
          <h1 className="text-2xl text-center"><i className="fa fa-bell mr-2"></i>Notifications</h1>
        </div>
      }
    </>
  )
}

export default Notifications
