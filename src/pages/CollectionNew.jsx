function CollectionNew() {
  return (
    <>
      <div className="mt-10 w-full lg:w-1/2 float-left p-5">
        <div className="bg-neutral-700  h-full w-full p-5">
          <h1 className="text-white text-3xl">New collection</h1>
          <input type="text" className="mt-4 outline-none text-lg border text-sm rounded-lg block w-full p-2.5 bg-neutral-600 border-neutral-500 placeholder-gray-400 text-white" placeholder="Name" maxLength={200}/>
          <input type="text" className="mt-4 outline-none text-lg border text-sm rounded-lg block w-full p-2.5 bg-neutral-600 border-neutral-500 placeholder-gray-400 text-white" placeholder="Description" maxLength={1000}/> 
          <button className='bg-blue-600 text-white px-10 text-lg p-3 mb-10 mt-4 block hover:bg-blue-700'>Add book</button>
        </div>
      </div>
      <div className="px-10 mt-10 w-1/2 float-left flex justify-center hidden lg:block">
        <img src="/collection.svg" className="h-[550px]"></img>
      </div>
    </>
  )
}

export default CollectionNew
