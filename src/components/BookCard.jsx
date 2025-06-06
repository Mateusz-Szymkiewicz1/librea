import { NavLink } from 'react-router-dom';
function BookCard(props) {
  let book = props.book
  let light = props.light || false
  let bg;
  if(light){
    bg = "bg-neutral-600 hover:bg-neutral-500"
  }else{
    bg = "bg-neutral-700 hover:bg-neutral-600"
  }
  return (
    <>
      <NavLink to={"/book/"+book.id}><div className={bg+" p-5"}>
        <img className="h-72 w-48 border border-neutral-500" src={"/uploads/"+book.okladka} onError={(e) => e.target.src = "/default.jpg"}></img>
        <p className="text-white mt-3 text-xl">{book.tytul}</p>
        <p className="text-slate-200 mt-1 text-lg">{book.autor}</p>
        <p className="text-xl mt-1"><i className="fa fa-star text-yellow-300 mr-1"></i>{ (book.suma_ocen/book.ilosc_ocen).toFixed(1) } ({book.ilosc_ocen})</p>
      </div></NavLink>
    </>
  )
}

export default BookCard
