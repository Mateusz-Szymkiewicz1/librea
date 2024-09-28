import { NavLink } from "react-router-dom";

function Header() {
  return (
    <>
      <div className="text-white w-100 bg-neutral-700 shadow flex flex-row sm:justify-between px-2 items-center p-2 sm:p-0">
          <NavLink to="/"><img src="/favicon.ico" className="h-16 sm:block hidden"></img></NavLink>   
          <div className="flex h-11 sm:w-96 w-50">
            <input type="text" placeholder="Search..." className="w-full outline-none h-11 bg-neutral-800 text-slate-200 text-sm px-3" />
            <button type='button' className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 px-4">
              <i className="fa fa-binoculars"></i>
            </button>
          </div>
          <div>
            <NavLink to="/login"><span className="pr-5 block"><i className="fa fa-user bg-blue-500 hover:bg-blue-600 py-3.5 px-2 text-md ml-2 sm:px-4"></i></span></NavLink>
          </div>
      </div>
    </>
  )
}

export default Header
