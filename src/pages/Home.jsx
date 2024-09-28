function Home() {
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
                <button type="button" className="w-1/3 mr-2 py-2 font-semibold rounded bg-blue-700 text-gray-50">Log in</button>
                <button type="button" className="w-1/3 ml-2 py-2 font-semibold rounded border border-blue-700 text-gray-50 hover:bg-blue-700 transition px-2">Make an account</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Home
