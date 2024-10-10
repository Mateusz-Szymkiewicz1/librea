function Profile() {
  let search = window.location.href.split('/').at(-1)
  return (
    <>
      <div className="px-5 mt-5">
        {search}
      </div>
    </>
  )
}

export default Profile
