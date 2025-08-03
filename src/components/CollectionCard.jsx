import { NavLink } from 'react-router-dom';
function CollectionCard(props) {
  let collection = props.collection
  let light = props.light || false
  let bg;
  light ? bg = "bg-neutral-600 hover:bg-neutral-500" : bg = "bg-neutral-700 hover:bg-neutral-600"
  return (
    <>
      <NavLink to={"/collection/"+collection.id} key={collection.id}><div className={bg+' p-5 shadow-lg'}>
                  <div className='grid grid-cols-2'>
                  <img className="h-20 w-20 object-cover border border-neutral-500" src={"/uploads/"+collection.books[0].okladka} onError={(e) => e.target.src = "/default.jpg"}></img>
                  {collection.books.length > 1 &&
                    <img className="h-20 w-20 object-cover border border-neutral-500" src={"/uploads/"+collection.books[1].okladka} onError={(e) => e.target.src = "/default.jpg"}></img>
                  }
                  {collection.books.length > 2 &&
                    <img className="h-20 w-20 object-cover border border-neutral-500" src={"/uploads/"+collection.books[2].okladka} onError={(e) => e.target.src = "/default.jpg"}></img>
                  }
                  {collection.books.length > 3 &&
                    <img className="h-20 w-20 object-cover border border-neutral-500" src={"/uploads/"+collection.books[3].okladka} onError={(e) => e.target.src = "/default.jpg"}></img>
                  }
                  {collection.books.length == 1 &&
                    <>
                    <img className="h-20 w-20 object-cover border border-neutral-500" src="/default.jpg"></img>
                    <img className="h-20 w-20 object-cover border border-neutral-500" src="/default.jpg"></img>
                    <img className="h-20 w-20 object-cover border border-neutral-500" src="/default.jpg"></img>
                    </>
                  }
                  {collection.books.length == 2 &&
                    <>
                    <img className="h-20 w-20 object-cover border border-neutral-500" src="/default.jpg"></img>
                    <img className="h-20 w-20 object-cover border border-neutral-500" src="/default.jpg"></img>
                    </>
                  }
                  {collection.books.length == 3 &&
                    <>
                    <img className="h-20 w-20 object-cover border border-neutral-500" src="/default.jpg"></img>
                    </>
                  }
                  </div>
                  <p className="text-white mt-3 text-xl">{collection.name}</p>
                  <p className="text-slate-200 mt-1 text-lg">by: {collection.user}</p>
                </div></NavLink>
    </>
  )
}

export default CollectionCard
