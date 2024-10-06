function NoMatch() {
  return (
    <>
      <div className="h-screen w-full flex flex-col justify-center items-center">
        <img src="/404.svg" className="h-96 -mt-16"></img>
        <span className="text-white text-center text-4xl mt-10">No matches found, sorry!</span>
      </div>
    </>
  )
}

export default NoMatch
