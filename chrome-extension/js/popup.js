/* global updateScript */
var chrome = chrome || {};
var Mediator = Mediator || {};
var View = View || {};

document.addEventListener("DOMContentLoaded", () => {
    
    var DEBUG = false;
    if(!DEBUG){
        if(!window.console) window.console = {};
        var methods = ["log", "debug", "warn", "info"];
        for(var i=0;i<methods.length;i++){
            console[methods[i]] = function(){};
        }
    }
    
    window.mediator = new Mediator();

    //palliative solution for storage sync issue
    updateScript.run().then(() => {
        View.Main.init();
    });

        
});
