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
            setUser(res[0])
            setOwner(true)
            setRefresh(prev => !prev)
          }
          setLoading(false)
        })      
      }
    })
  }, [])
  useEffect(() => {
    if(!owner) return
    fetch("http://localhost:3000/notifications", {
                credentials: 'include',
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  user: user.login,
                  offset: offset
                }),
              }).then(res => res.json()).then(res => {
                  console.log(res)
                  setNumOfNotifs(res[0])
                  res.shift()
                  setNotifications(prev => prev.concat([...res]))
              })
  }, [refresh, offset])
  const mark_as_seen = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if(e.currentTarget.dataset.eye != "true"){
      navigator(e.currentTarget.dataset.href)
    }
    let notification = notifications.find(x => x.id == e.currentTarget.dataset.notif)
    notification.seen = 1;
    setNotifications([...notifications])
    fetch("http://localhost:3000/mark_as_seen", {
                credentials: 'include',
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: e.currentTarget.dataset.type,
                  id: e.currentTarget.dataset.id
                }),
              })
  }
   const delete_notification = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setNotifications(notifications.filter(x => x.id != e.currentTarget.dataset.notif))
    fetch("http://localhost:3000/delete_notification", {
                credentials: 'include',
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: e.currentTarget.dataset.type,
                  id: e.currentTarget.dataset.id
                }),
              })
    if(notifications.length == 1 && numOfNotifs > offset+10){
      setRefresh(!refresh)
    }
  }
  return (
    <>
      {!loading && owner &&
        <>
        <div className="bg-neutral-700 shadow-lg m-5 p-5">
          <h1 className="text-2xl text-center"><i className="fa fa-bell mr-2"></i>Notifications</h1>
        </div>
        <div className="bg-neutral-700 shadow-lg min-h-80 m-5 p-5 flex flex-col">
          {notifications.length < 1 &&
            <h1 className="text-xl text-center mt-20">No notifications...</h1>
          }
          {notifications.map(el => {
             let link = ""
                    let new_text = el.text
                    let text = el.text.split(" ")
                    let type = ""
                    let id = 0
                    if(el.text[0] == "1"){
                      new_text = el.like_from+" has liked your "+text[text.length-1]
                    }
                    if(el.collection){
                      link = "/collection/"+el.collection.id
                      new_text = <>{new_text+" - "}<span className={el.seen == 1 ? "text-blue-200 italic" : "text-blue-100 italic"}>{el.collection.name}</span></>
                      type = "collection"
                      id = el.collection.id
                    }
                    if(el.quote){
                      link = "/book/"+el.quote.book.id
                      type = "quote"
                      id = el.quote.id
                    }
                    if(el.review){
                      link = "/book/"+el.review.book.id
                      type = "review"
                      id = el.review.id
                    }
                    return(
                      <NavLink data-href={link} onClick={mark_as_seen} data-notif={el.id} data-id={id} data-type={type} key={el.id} to={link}><div className={el.seen == 1 ? "shadow bg-neutral-500 hover:bg-neutral-400 m-1 p-2" : "bg-blue-700 hover:bg-blue-600 m-1 p-2 shadow"}>{new_text}
                      {el.quote &&
                        <> on <span className={el.seen == 1 ? "text-blue-200 italic" : "text-blue-100 italic"}>{el.quote.book.tytul}</span></>
                      }
                      {el.review &&
                        <> on <span className={el.seen == 1 ? "text-blue-200 italic" : "text-blue-100 italic"}>{el.review.book.tytul}</span></>
                      }
                      <div className="flex clear-both gap-3">
                      {el.seen == 0 &&
                        <div data-eye="true" onClick={mark_as_seen} data-notif={el.id} data-id={id} data-type={type}><i className="fa fa-eye mt-2 mr-1"></i>Mark as seen</div>
                      }
                      <div onClick={delete_notification} data-notif={el.id} data-id={id} data-type={type}><i className="fa fa-trash mt-2 mr-1"></i>Delete</div>
                      </div>
                      </div></NavLink>
                    )
          })}
          {numOfNotifs > offset+10 &&
                <button onClick={() => setOffset(prev => prev+10)} className="bg-blue-600 p-3 text-lg mt-3 hover:bg-blue-700"><i className="fa fa-caret-down mr-3"></i>Show more</button>
          }
        </div>
        </>
      }
    </>
  )
}

export default Notifications
