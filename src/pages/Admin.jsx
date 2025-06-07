import { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useDecision } from "../components/useDecision"

function Admin(props) {
  const navigator = useNavigate()
  const [user, setUser] = useState()
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState([])
  const [reports, setReports] = useState([])
  const [offset, setOffset] = useState(0)
  const [reportOffset, setReportOffset] = useState(0)
  const [refresh, setRefresh] = useState(false)
  const [numOfSubmissions, setNumOfSubmissions] = useState(0)
  const [numOfReports, setNumOfReports] = useState(0)
  const [admin, setAdmin] = useState(false)

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
  }, [])
  useEffect(() => {
    fetch("http://localhost:3000/new_books", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        offset: offset
      })
    }).then(res => res.json()).then(res => {
      setSubmissions([])
      setNumOfSubmissions(res[0].submissions)
      setSubmissions([...res.slice(1, res.length)])
    })
    fetch("http://localhost:3000/new_reports", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        offset: reportOffset
      })
    }).then(res => res.json()).then(res => {
      setReports([])
      setNumOfReports(res[0].reports)
      setReports([...res.slice(1, res.length)])
    })
  }, [refresh])
  useEffect(() => {
    if(offset == 0) return
    fetch("http://localhost:3000/new_books", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        offset: offset
      })
    }).then(res => res.json()).then(res => {
      setSubmissions(prev => prev.concat([...res.slice(1, res.length)]))
    })
  }, [offset])
  useEffect(() => {
    if(reportOffset == 0) return
    fetch("http://localhost:3000/new_reports", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        offset: reportOffset
      })
    }).then(res => res.json()).then(res => {
      setReports(prev => prev.concat([...res.slice(1, res.length)]))
    })
  }, [reportOffset])
  const toggleDesc = () => {
    const submission = submissions.find(x => x.id == event.target.dataset.id)
    const p = event.target.parentElement.querySelector('.desc');
    if(p.dataset.full == "no"){
      p.innerText = submission.opis
      event.target.innerText = "Hide"
      p.dataset.full = "yes"
    }else{
      p.innerHTML = submission.opis.slice(0,200)+'...'
      event.target.innerText = "Show"
      p.dataset.full = "no"
    }
  }
  const deleteSubmission = async () => {
    const id = event.target.dataset.id
    if (document.querySelector(".decision")) document.querySelector('.decision').remove()
      const response = await useDecision().then(function () {
          document.querySelector(".decision").remove()
          return
      }, function () {
          document.querySelector(".decision").remove()
          return "stop"
      });
      if(response) return
    fetch("http://localhost:3000/delete_waiting_submission", {
      credentials: 'include',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id
      })
    }).then(res => res.json()).then(res => {
      setRefresh(prev => !prev)
      props.setToast({type:"msg", text:"Deleted a submission!"})
    })
  }
  const acceptSubmission = async () => {
    const id = event.target.dataset.id
    const submission = submissions.find(x => x.id == id)
    if (document.querySelector(".decision")) document.querySelector('.decision').remove()
      const response = await useDecision().then(function () {
          document.querySelector(".decision").remove()
          return
      }, function () {
          document.querySelector(".decision").remove()
          return "stop"
      });
      if(response) return
      fetch("http://localhost:3000/approve_waiting_submission", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          title: submission.tytul,
          author: submission.autor,
          year: submission.rok,
          pages: submission.strony,
          desc: submission.opis,
          tags: submission.tagi,
          cover: submission.okladka
        })
      }).then(res => res.json()).then(res => {
        props.setToast({type:"msg", text:"Approved a submission!"})
        setRefresh(prev => !prev)
      })
  }
  const hideSuggestions = () => {
    setOffset(0)
    setRefresh(prev => !prev)
    window.scrollTo(0,0)
  }
  const hideReports = () => {
    setReportOffset(0)
    setRefresh(prev => !prev)
    document.querySelector("#reports").scrollIntoView()
  }
  const dismiss = async (e) => {
    if (document.querySelector(".decision")) document.querySelector('.decision').remove()
      const response = await useDecision().then(function () {
          document.querySelector(".decision").remove()
          return
      }, function () {
          document.querySelector(".decision").remove()
          return "stop"
      });
      if(response) return
      fetch("http://localhost:3000/delete_report", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: e.target.dataset.id
        })
      }).then(res => res.json()).then(res => {
        props.setToast({type:"msg", text:"Dismissed!"})
        setRefresh(prev => !prev)
      })
  }
  const ban = async (e) => {
    if (document.querySelector(".decision")) document.querySelector('.decision').remove()
      const response = await useDecision().then(function () {
          document.querySelector(".decision").remove()
          return
      }, function () {
          document.querySelector(".decision").remove()
          return "stop"
      });
      if(response) return
    const report = reports.find(x => x.id == e.target.dataset.id)
    if(report.user){
      fetch("http://localhost:3000/ban_user", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: report.user
        })
      }).then(res => res.json()).then(res => {
        props.setToast({type:"msg", text:"User banned!"})
        setRefresh(prev => !prev)
      })
    }else{
      fetch("http://localhost:3000/admin_delete", {
        credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: report.quote ? report.quote.id : report.review.id,
          type: report.quote ? "quote" : "review"
        })
      }).then(res => res.json()).then(res => {
        props.setToast({type:"msg", text:"Content deleted!"})
        setRefresh(prev => !prev)
      })
    }
  }
  return (
    <>
      {!loading && admin &&
        <div className="mx-5 my-10">
          <h1 className="text-3xl"><i className="fa fa-user-tie mr-3 text-blue-500"></i>Admin Panel</h1>
          {submissions.length > 0 &&
            <>
              <h1 className="text-2xl mt-10">Book submissions ({numOfSubmissions})</h1>
              <div className="flex flex-col">
              {submissions.map(el => {
                return(
                  <div key={el.id} className="bg-neutral-700 text-white p-3 mt-4 hover:bg-neutral-600">
                <img onError={(e) => e.target.src = "../../public/default.jpg"} src={"/user_uploads/covers/"+el.okladka} className="h-48 sm:float-left mr-3 mb-2"></img>
                <div>
                <h2 className="text-2xl break-keep flex sm:justify-between">
                  {el.tytul} 
                  <span>
                    <i onClick={deleteSubmission} data-id={el.id} className="fa fa-xmark mx-2 sm:mx-4 text-red-500 cursor-pointer"></i>
                    <i onClick={acceptSubmission} data-id={el.id} className="fa cursor-pointer fa-check-to-slot text-green-400"></i>
                  </span>
                </h2>
                <p className="text-neutral-300 text-lg">{el.autor}</p>
                <p className="text-neutral-300 text-lg">{el.rok}</p>
                <p className="text-neutral-300 text-lg">{el.strony} page(s)</p>
                <div className="flex flex-wrap gap-2 my-2">
                  {JSON.parse(el.tagi).map(tag => <span key={tag} className="text-sm font-medium px-2.5 py-0.5 rounded bg-blue-900 text-blue-300">{tag}</span>)}
                </div>
                <p className="text-neutral-300 text-lg">User - <NavLink to={"/profile/"+el.user} className="text-blue-500">{el.user}</NavLink></p>
                {el.opis.length > 0 &&
                  <>
                  <p data-full="no" className="desc text-neutral-200 text-lg mt-3 pr-5 clear-both">{el.opis.slice(0,200)+"..."}</p>
                  {el.opis.length > 200 &&
                    <span className="text-blue-500 cursor-pointer mt-4" onClick={toggleDesc} data-id={el.id}>Show</span>
                  }
                  </>
                }
                </div>
                <p className="text-neutral-200 mt-2">Submitted: {el.submit_date.split('T')[0]}</p>
              </div>
                )
              })}
              {numOfSubmissions > offset+5 &&
                <button onClick={() => setOffset(prev => prev+5)} className="bg-blue-600 p-3 text-lg mt-3 hover:bg-blue-700"><i className="fa fa-caret-down mr-3"></i>Show more</button>
              }
              {numOfSubmissions <= offset+5 && offset > 0 &&
                <button onClick={hideSuggestions} className="bg-blue-600 p-3 text-lg mt-3 hover:bg-blue-700"><i className="fa fa-caret-up mr-3"></i>Hide</button>
              }
              </div>
              <h1 className="text-2xl mt-16" id="reports">Reports ({numOfReports})</h1>
              <div className="flex flex-col">
              {reports.map(el => {
                return(
                  <div key={el.id} className="bg-neutral-700 text-white p-3 mt-4 hover:bg-neutral-600">
                <div>
                <h2 className="text-2xl break-keep flex sm:justify-between">
                  {el.quote && <p>Type: Quote</p>}
                  {el.review && <p>Type: Review</p>}
                  {el.user && <p>Type: User - <NavLink className="italic text-blue-400" target="_blank" to={"/profile/"+el.user}>{el.user}</NavLink></p>}
                  <span>
                    <i onClick={ban} data-id={el.id} className="fa fa-xmark mx-2 sm:mx-4 text-red-500 cursor-pointer">
                      {el.user &&
                        <span data-id={el.id} className="font-mono align-text-top ml-1">Ban</span>
                      }
                      {!el.user &&
                        <span data-id={el.id} className="font-mono align-text-top ml-1">Delete</span>
                      }
                    </i>
                    <i onClick={dismiss} data-id={el.id} className="fa cursor-pointer fa-check-to-slot text-green-400"><span data-id={el.id} className="font-mono align-text-top ml-1">Dismiss</span></i>
                  </span>
                </h2>
                </div>
                {el.review &&
                  <>
                  <p className="text-neutral-200 text-lg mt-3 pr-5 clear-both">{el.review.text}</p>
                  <p className="text-neutral-200 mt-2">Written by <NavLink target="_blank" to={"/profile/"+el.review.user} className="italic text-blue-400">{el.review.user}</NavLink> on <NavLink target="_blank" to={"/book/"+el.review.book.id} className="italic text-blue-400">{el.review.book.tytul}</NavLink> by {el.review.book.autor}</p>
                  </>
                }
                {el.quote &&
                  <>
                  <p className="text-neutral-200 text-lg mt-3 pr-5 clear-both">{el.quote.text}</p>
                  <p className="text-neutral-200 mt-2">Written by <NavLink target="_blank" to={"/profile/"+el.quote.user} className="italic text-blue-400">{el.quote.user}</NavLink> on <NavLink target="_blank" to={"/book/"+el.quote.book.id} className="italic text-blue-400">{el.quote.book.tytul}</NavLink> by {el.quote.book.autor}</p>
                  </>
                }
                <p className="text-neutral-200 mt-5">Submitted: {el.date.split('T')[0]} by <NavLink target="_blank" to={"/profile/"+el.user_reporting} className="italic text-blue-400">{el.user_reporting}</NavLink></p>
              </div>
                )
              })}
              {numOfReports > reportOffset+5 &&
                <button onClick={() => setReportOffset(prev => prev+5)} className="bg-blue-600 p-3 text-lg mt-3 hover:bg-blue-700"><i className="fa fa-caret-down mr-3"></i>Show more</button>
              }
              {numOfReports <= reportOffset+5 && reportOffset > 0 &&
                <button onClick={hideReports} className="bg-blue-600 p-3 text-lg mt-3 hover:bg-blue-700"><i className="fa fa-caret-up mr-3"></i>Hide</button>
              }
              </div>
            </>
          }
        </div>
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

export default Admin
