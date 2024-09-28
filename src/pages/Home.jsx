import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  return (
    <>
      <div>
        <section className="p-6 text-slate-200 sm:mt-10">
          <div className="flex justify-between gap-10 sm:mx-16">
            <img src="hero.svg" alt="" className="object-contain h-72 lg:h-96 mt-16 lg:mt-0 hidden md:block" />
            <div className="py-16">
              <span className="block mb-2 text-blue-500">Librea book system</span>
              <h1 className="text-5xl font-extrabold text-blue-600">Start your own library</h1>
              <p className="my-8">
                <span className="font-medium">Quick and easy.</span> Organise your books into different catalogues to access them as quick as possible!
              </p>
              <div className="flex">
                <button type="button" onClick={() => navigate('/login')} className="w-1/3 mr-2 py-2 font-semibold rounded bg-blue-700 text-gray-50">Log in</button>
                <button type="button" onClick={() => navigate('/register')} className="w-1/3 ml-2 py-2 font-semibold rounded border border-blue-700 text-gray-50 hover:bg-blue-700 transition px-2">Make an account</button>
              </div>
            </div>
          </div>
        </section>

        <div className='flex flex-wrap justify-evenly text-slate-200 w-full bg-blue-700 my-12'>
          <div className='text-center h-48 flex justify-center items-center flex-col hover:bg-blue-600 w-48'>
            <i className="fa fa-search text-3xl mb-3"></i>
            <p className='text-2xl'>Organised</p>
          </div>
          <div className='text-center h-48 flex justify-center items-center flex-col hover:bg-blue-600 w-48'>
            <i className="fa fa-comments text-3xl mb-3"></i>
            <p className='text-2xl'>Community</p>
          </div>
          <div className='text-center h-48 flex justify-center items-center flex-col hover:bg-blue-600 w-48'>
            <i className="fa fa-shapes text-3xl mb-3"></i>
            <p className='text-2xl'>Easy</p>
          </div>
          <div className='text-center h-48 flex justify-center items-center flex-col hover:bg-blue-600 w-48'>
            <i className="fa fa-binoculars text-3xl mb-3"></i>
            <p className='text-2xl'>Discover</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
