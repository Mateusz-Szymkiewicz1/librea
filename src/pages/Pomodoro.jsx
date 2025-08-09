import Countdown from 'react-countdown';
import { useEffect, useRef, useState } from "react"

function Pomodoro(props) {
  const countdown = useRef(null);
  const [timerStatus, setTimerStatus] = useState('stopped');
  const [time, setTime] = useState(Date.now() + 1500)
  const [tab, setTab] = useState('pomodoro');

  const renderer = ({ hours, minutes, seconds, completed }) => {
    if(minutes < 10){
      minutes = `0${minutes}`;
    }
    if(seconds < 10){
      seconds = `0${seconds}`;
    }
    const title = tab == "pomodoro" ? 'Pomodoro' : 'Break'
    document.title = `${minutes}:${seconds} ${title} | Librea`
    return <span className='text-7xl block text-center'>{minutes}:{seconds}</span>;
  };

  const toggleTimer = (e) => {
    if(timerStatus == 'stopped') {
      e.target.classList.remove('bg-blue-600');
      e.target.classList.add('bg-red-600');
      e.target.querySelector('i').classList.remove('fa-play');
      e.target.querySelector('i').classList.add('fa-pause');
      countdown.current.start();
      setTimerStatus('running');
    }else{
      e.target.classList.add('bg-blue-600');
      e.target.classList.remove('bg-red-600');
      e.target.querySelector('i').classList.add('fa-play');
      e.target.querySelector('i').classList.remove('fa-pause');
      countdown.current.pause();
      setTimerStatus('stopped');
    }
  }
  const resetTimer = () => {
    document.querySelector('#btn1').classList.add('bg-blue-600');
      document.querySelector('#btn1').classList.remove('bg-red-600');
      document.querySelector('#btn1').querySelector('i').classList.add('fa-play');
      document.querySelector('#btn1').querySelector('i').classList.remove('fa-pause');
      setTimerStatus('stopped');
    countdown.current.stop();
    if(tab == 'pomodoro') {
      setTime(Date.now() + 1500000);
    }
    if(tab == 'short') {
      setTime(Date.now() + 300000);
    }
    if(tab == 'long') {
      setTime(Date.now() + 900000);
    }
  }
  useEffect(() => {
    resetTimer()
    if(tab == 'pomodoro') {
      setTime(Date.now() + 1500000);
    }
    if(tab == 'short') {
      setTime(Date.now() + 300000);
    }
    if(tab == 'long') {
      setTime(Date.now() + 900000);
    }
  }, [tab]);
  const complete = () => {
    if(tab == "pomodoro"){
      props.setToast({type: "msg", text: "Time completed! Now have a break!"})
      setTab("short")
    }else{
      props.setToast({type: "error", text: "Break ended!"})
      setTab('pomodoro')
    }
  }
  return (
    <>
      <h1 className="text-center text-3xl font-semibold mt-10">Pomodoro timer</h1>
      <p className="text-slate-200 px-16 md:px-32 my-3 text-center">Use this timer to organize your time reading. Start reading sessions and breaks using pomodoro technique, to ensure getting through books as effective as possible.</p>
      <div className="min-h-96 bg-neutral-700 shadow-xl relative m-5 flex justify-center items-center flex-col">
        <Countdown onComplete={complete} controlled={false} ref={countdown} date={time} daysInHours={true} autoStart={false} renderer={renderer}></Countdown>
        <div className='flex justify-center gap-2'>
          <div id="btn1" onClick={toggleTimer} className="shadow rounded-md ml-2 my-5 px-5 cursor-pointer text-white bg-blue-600 float-left p-3"><i className="fa fa-play mr-3"></i>{timerStatus == "running" ? 'Stop' : "Start"}</div>
          <div onClick={resetTimer} className="shadow rounded-md ml-2 my-5 px-5 cursor-pointer text-white bg-orange-600 float-left p-3"><i className="fa fa-arrows-rotate mr-3"></i>Reset</div>
        </div>
        <p>{tab == "pomodoro" ? "Time to read!" : "Now have a break!"}</p>
        <div className='absolute top-0 w-full bg-blue-600 h-14 flex items-center justify-center gap-2'>
          <button onClick={() => setTab('pomodoro')} className={tab == "pomodoro" ? 'bg-red-600 shadow h-fit p-2  underline' : 'bg-neutral-700 shadow h-fit p-2'}>Pomodoro</button>
          <button onClick={() => setTab('short')} className={tab == "short" ? 'bg-orange-600 shadow h-fit p-2 underline' : 'bg-neutral-700 shadow h-fit p-2'}>Short break</button>
          <button onClick={() => setTab('long')} className={tab == "long" ? 'bg-green-600 h-fit shadow p-2 underline' : 'bg-neutral-700 h-fit p-2 shadow'}>Long break</button>
        </div>
      </div>
    </>
  )
}

export default Pomodoro
