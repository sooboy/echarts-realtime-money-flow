class Stop {
    private _stop = false;
    private _temp:Function | null  = null

    constructor(private dom:HTMLElement){
        this.listen()
    }
    async isStop(){
        return new Promise((resolve,reject)=>{
            if(!this._stop){
                resolve(false)
            }else{
                this._temp = resolve
            }
        })
    }

    listen(){
        this.dom.addEventListener('keyup',(event)=>{
           if (event.code === 'Space'){
               this._stop = !this._stop
               if(!this._stop && this._temp){
                   this._temp(true)
                   this._temp = null
               }
           }
        })
    }
}