const darkMode = document.getElementById("toggle");
const rootNode = document.querySelector(":root");
const osPrefsDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? true : false;
const manualPref = localStorage.getItem("theme");

if( manualPref != "light" && manualPref != "dark"){
    dark(osPrefsDark);
}else if (manualPref == "light"){
    dark(false);
}else{
    dark(true);
}

function dark(enable){
    if (enable){
        rootNode.classList.add('dark');
        darkMode.checked = true;
        localStorage.setItem("theme", "dark");
    }else{
        rootNode.classList.remove('dark');
        darkMode.checked = false;
        localStorage.setItem("theme", "light");
    }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    const newColorScheme = event.matches ? 1 : 0;
    dark(newColorScheme);
});

toggle.addEventListener('change', function(){
    if (this.checked == true){
        dark(true);
    }else{
        dark(false);
    }
});
