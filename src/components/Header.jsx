import { NavLink } from "react-router-dom";

function Header() {
  return (
    <>
      <div class="text-white w-100 bg-neutral-700 shadow flex flex-row sm:justify-between px-2 items-center p-2 sm:p-0">
          <NavLink to="/"><img src="/favicon.ico" class="h-16 sm:block hidden"></img></NavLink>   
          <div class="flex h-11 sm:w-96 w-50">
            <input type="text" placeholder="Search..." class="w-full outline-none h-11 bg-neutral-800 text-slate-200 text-sm px-5" />
            <button type='button' class="flex items-center justify-center bg-blue-500 hover:bg-blue-600 px-4">
              <i class="fa fa-binoculars"></i>
            </button>
          </div>
          <div>
            <NavLink to="/logowanie"><span class="pr-5 hidden sm:block">Zaloguj &rarr;</span></NavLink>
            <NavLink to="/logowanie"><span class="pr-5 block sm:hidden"><i class="fa fa-user bg-blue-500 hover:bg-blue-600 py-3.5 px-2 text-md ml-2"></i></span></NavLink>
          </div>
      </div>
    </>
  )
}

export default Header
