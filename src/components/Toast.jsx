function Toast(props) {
  let msg = props.msg
  return (
    <>
      <div className="shadow fixed bottom-4 z-50 right-4 min-w-64">
        <div className={"flex justify-between rounded-lg shadow-lg p-4 border "+(msg.type == "error" ? "bg-red-500 border-red-600" : "bg-green-500 border-green-600")}>
          <p className="text-white text-lg mr-5 dark:text-slate-200">{ msg.text }</p>
          <button onClick={() => props.closeToast()} className="text-white dark:text-slate-200 focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}

export default Toast
