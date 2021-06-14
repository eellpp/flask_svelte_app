
export function blurOnKey(event) {
    const { code } = event;
    if (code === "Enter" || code == "Escape" || code === "Tab") {
        event.target.blur();
    }
}


export function getUID(){
    return Math.random().toString(36).substr(2,10)
}