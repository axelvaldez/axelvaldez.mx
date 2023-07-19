(function(){
    // Check see if browser supports the intersection observer
    if ('IntersectionObserver' in window) {
        // assume browser supports ES6
        var supportsES6 = true;
        // check see if browser supports ES6 (https://gist.github.com/DaBs/89ccc2ffd1d435efdacff05248514f38)
        var str = 'class ಠ_ಠ extends Array {constructor(j = "a", ...c) {const q = (({u: e}) => {return { [`s${c}`]: Symbol(j) };})({});super(j, q, ...c);}}' +
        'new Promise((f) => {const a = function* (){return "\u{20BB7}".match(/./u)[0].length === 2 || true;};for (let vre of a()) {' +
        'const [uw, as, he, re] = [new Set(), new WeakSet(), new Map(), new WeakMap()];break;}f(new Proxy({}, {get: (han, h) => h in han ? han[h] ' +
        ': "42".repeat(0o10)}));}).then(bi => new ಠ_ಠ(bi.rd));';

        // run the ES6 test
        try {
            eval(str);
        } catch(e) {
            supportsES6 = false;
        }

        // abort script loading if ES6 not supported
        if(!supportsES6){
            return;
        }

        // Only allow the script loader to fire once
        let observerFired = false;

        // Setup observer options
        let observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 1.0
        }

        // append the webmentions script to the head
        function scriptLoader(){
            let script = document.createElement('script');
            script.src = '/assets/js/webmentions.js';
            document.head.appendChild(script);
        }

        function onChange(changes, observer){
            changes.forEach(change => {
                // if the comments wrapper is fully in view
                if (change.intersectionRatio == 1) {
                    // script already loaded so return
                    if(observerFired){
                        return;
                    }
                    // script now loaded, so set to true
                    observerFired = true;

                    // load the webmentions script
                    scriptLoader();

                    // show the loader while this is happening
                    // document.querySelector('.content-webmentions__loader').classList.remove('visually-hidden');
                }
            });
        }

        // the element we are looking to move into the viewport
        let mentionsWrapper = document.querySelector('.content-webmentions');

        // check see if the element is on the page, then setup the observer
        if(mentionsWrapper){
            let observer = new IntersectionObserver(onChange, observerOptions);
            observer.observe(mentionsWrapper);
        }
    }
})();
