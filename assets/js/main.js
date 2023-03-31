darkMode = document.getElementById("toggle");
rootNode = document.querySelector(":root");

function dark(enable){
    if (enable){
        rootNode.classList.add('dark');
        darkMode.checked = true;
    }else{
        rootNode.classList.remove('dark');
        darkMode.checked = false;
    }
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    dark(true);
}
else{
    dark(false);
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
