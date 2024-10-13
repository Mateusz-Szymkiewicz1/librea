export function useDecision() {
  return new Promise(function (resolve, reject) {
    let decision = document.createElement("div");
    decision.className = "decision bg-neutral-800 text-slate-200 border-blue-500";
    decision.innerHTML = `<span>Are you sure?</span><br /><button id="button_tak">Yes</button><button id="button_nie">No</button>`;
    document.querySelector('body').appendChild(decision);
    decision.style.animation = "slideInDown 0.5s ease";
    document.querySelector("#button_tak").addEventListener("click", function () {
        resolve();
    })
    document.querySelector("#button_nie").addEventListener("click", function () {
        reject();
    })
  })
}
