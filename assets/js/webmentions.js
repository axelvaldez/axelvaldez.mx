/** @preserve Based heavily on the work by Keith Grant (keithjgrant.com) **/

// IIFE to restrict global namespace
(function(){
    // link to the anonymous avatar
    const ANON_AVATAR = '/assets/img/anon.png';
    // cloudinary app code (remember to restrict to set domains in settings)
    const CLOUD_CODE = 'diddtfokm';

    // var to store the built HTML
    let webmentionHTML = `<div class='content-webmentions__inner'>`;

    function init(){
        // grab the URL of the current page
        let url = document.location.origin + document.location.pathname;
        console.log(url);

        // these are the url permutations we will check against
        const targets = getUrlPermutations(url);

        // build each script tag
        let script = document.createElement('script');
        let src = 'https://webmention.io/api/mentions?perPage=500&jsonp=parseWebmentions';

        // check the API for each domain
        targets.forEach(function(targetUrl) {
            src += `&target[]=${encodeURIComponent(targetUrl)}`;
        });
        // cachebuster
        src += `&_=${Math.random()}`;
        script.src = src;
        script.async = true;
        document.getElementsByTagName('head')[0].appendChild(script);
    }

    // build the permutations array to check the API for
    function getUrlPermutations(url) {
        const urls = [];
        // useful for local testing, populate localhost with live mentions
        url = url.replace('http://localhost:8080', 'https://axelvaldez.mx');
        urls.push(url);
        // check the non-https version too
        urls.push(url.replace('https://', 'http://'));
        // check a version of the URL without the trailing slash
        if (url.substr(-1) === '/') {
          var noslash = url.substr(0, url.length - 1);
          urls.push(noslash);
          urls.push(noslash.replace('https://', 'http://'));
        }
        // return array of permutations
        return urls;
    }

    // sort function used for incoming data
    function webmentionSort(a, b) {
        const dateA = getWebmentionDate(a);
        const dateB = getWebmentionDate(b);

        if (dateA < dateB) {
            return -1;
        } else if (dateB < dateA) {
            return 1;
        }
        return 0;
    }

    // return a date for the mention from published or verified
    function getWebmentionDate(webmention) {
        if (webmention.data.published) {
            return new Date(webmention.data.published);
        }
        return new Date(webmention.verified_date);
    }

    function parseWebmentions(data) {
        // if no mentions, hide the loader
        if(data.links.length == 0){
            document.querySelector('.content-webmentions__loader').classList.add('visually-hidden');
            return;
        }

        // sort the incoming data
        let links = data.links.sort(webmentionSort);

        // create three arrays to store our webmentions
        let likes = [];
        let repostsLinks = [];
        let replies = [];

        // map over the webmentions and sort the into arrays
        links.map(function(l) {
            // if no activity key, unknown type
            if (!l.activity || !l.activity.type) {
                console.warning('unknown link type', l);
                return;
            }
            // not verified, then not valid
            if (!l.verified) {
                return;
            }

            // depending on the type, push into an correct array
            switch (l.activity.type) {
                case 'like':
                    likes.push(l);
                    break;
                case 'repost':
                case 'link':
                    repostsLinks.push(l);
                    break;
                default:
                    replies.push(l);
                    break;
            }
        });

        // render the number of webmentions to the page
        webmentionHTML += renderWebmentionTotal(data.links.length);

        // render the form
        renderForm();

        // if we have replies, build the replies HTML
        if(replies.length){
            renderReplies(replies);
        }

        // if we have likes, build the like HTML
        if(likes.length){
            renderLikes(likes);
        }

        // if we have reposts, build the reposts HTML
        if(repostsLinks.length){
            renderRepostsLinks(repostsLinks);
        }

        // close the webmention container
        webmentionHTML += `</div>`;

        // now that the HTML is built, add it to the DOM (only a single insertion for optimal performance)
        document.querySelector('.content-webmentions').innerHTML = webmentionHTML;

        // setup the send webmention form interactions
        setupFormInteractions();
    }

    // add form events
    function setupFormInteractions(){
        // store the form element
        let formEle = document.querySelector('.content-webmentions__form');
        // listen for the submit event, execute once heard
        formEle.addEventListener('submit', formSubmit);
    }

    // handle the form submission
    function formSubmit(evt){
        // stop the default form submission
        evt.preventDefault();

        // store the page webmention endpoint
        let linkHref = document.querySelector('link[rel=webmention]').href;

        // store the two webmention URLS
        let target = document.querySelector('#webmention-target').value;
        let source = document.querySelector('#webmention-source').value;

        // setup new XMLHttpRequest for the POST
        let xhr = new XMLHttpRequest();

        // do the post
        xhr.open('POST', `${linkHref}`);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(encodeURI(`source=${source}&target=${target}`));

        // wait for the response
        xhr.onload = function() {
            let response = JSON.parse(xhr.responseText);
            if(xhr.status === 200 || xhr.status === 201){
                console.info(`XMLHttpRequest success: ${xhr.status}`);
            } else {
                console.warn(`XMLHttpRequest failed: ${xhr.status}`);
            }

            // feedback response to the user
            formMessages(response);
        };
    }

    // populate the feedback message for the user
    function formMessages(responseData){
        // message element
        let messageEle = document.querySelector('.content-webmentions__form-message');

        // messages
        let thanks = `Thank you for your submission!`;
        let error = `Looks like something went wrong:`;
        let message;

        // adjust content depending on the status
        switch(responseData.status){
            case 'queued':
            case 'success':
                message = `${thanks} ${responseData.summary}. <a href="${responseData.location}">View the current status.</a>`;
                break;
            default:
                message = `${error} ${responseData.summary}.`;
                break;
        }

        // set elements HTML to the message
        messageEle.innerHTML = message;

        // show the message
        messageEle.classList.remove('visually-hidden');
    }

    // set to global method for JSONP
    window.parseWebmentions = parseWebmentions;

    // human friendly month formats
    var months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ];

    // format the date
    function formatDate(date) {
        if (!date) {
            return '';
        }
        // e.g. 22 Oct 2019
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    // run the returned photos through cloudinary to reduce the size
    // 96 by 96 as resizing to 48 by 48, so 2x for high density devices
    function cloudifyPhoto(url){
        // if no URL, pass back the anonymous images
        return (url ? `https://res.cloudinary.com/${CLOUD_CODE}/image/fetch/w_96,h_96,q_auto/${url}` : ANON_AVATAR);
    }

    // simple function to look a 1 vs many results
    function renderWebmentionTotal(total){
        return `<h3 class="mt-0">${total + (total === 1 ? ' Webmention' : ' Webmentions')}</h3>`;
    }

    // if we have a url instead of an author, construct the link
    function getHostName(url) {
        let a = document.createElement('a');
        a.href = url;
        // remove the www for stylistic reasons
        return (a.hostname || '').replace('www.', '');
    }

    // render the webmention submit form
    function renderForm(){
        // generate the form HTML
        let formHTML = `<div class="content-webmentions__form">${formTemplate()}</div>`;

        // append the generated like HTML to the single set of HTML
        webmentionHTML += formHTML;
    }

    // render the webmention likes from the sorted array
    function renderLikes(likesArray){
        // build our likes HTML
        let likesHTML = `
            <div class="content-webmentions--likes">
                <h4>${likesArray.length} ${likesArray.length === 1 ? ' like' : ' likes'}</h4>
                <ul class='content-webmentions__list no-style'>`;

        // map over our likes, build the data object
        likesArray.map(function(l){
            let likeObj = {
                photo: cloudifyPhoto(l.data.author.photo),
                name: l.data.author.name,
                authorUrl: l.data.author.url,
                url: l.data.url,
                date: new Date(l.data.published || l.verified_date)
            }

            // create each like
            likesHTML += likeRepostLinkTemplate(likeObj);
        });

        // close the like HTML
        likesHTML +=
            `   </ul>
            </div>`;

        // append the generated like HTML to the single set of HTML
        webmentionHTML += likesHTML;
    }

    // function to render reposts and links
    function renderRepostsLinks(repostsArray){
        // build our repost / links HTML
        let repostLinksHTML = `
            <div class="content-webmentions--reposts">
                <h4>${repostsArray.length} ${repostsArray.length === 1 ? ' repost' : ' reposts'}</h4>
                <ul class='content-webmentions__list no-style'>`;

        // map over our reposts / likes, build the data object
        repostsArray.map(function(l){
            let repostLinkObj;
            // if a repost (has an author)
            if (l.data.author) {
                repostLinkObj = {
                    photo: cloudifyPhoto(l.data.author.photo),
                    name: l.data.author.name,
                    authorUrl: l.data.author.url,
                    url: l.data.url,
                    date: new Date(l.data.published || l.verified_date)
                }
            } else {
                // this is for a link
                repostLinkObj = {
                    photo: ANON_AVATAR,
                    name: getHostName(l.data.url) || 'inbound link',
                    authorUrl: l.data.url,
                    url: l.data.url,
                    date: new Date(l.data.published || l.verified_date),
                };
            }

            // create each like
            repostLinksHTML += likeRepostLinkTemplate(repostLinkObj);
        });

        // close the HTML
        repostLinksHTML +=
            `   </ul>
            </div>`;

        // append the generated like HTML to the single set of HTML
        webmentionHTML += repostLinksHTML;
    }

    // function to render replies
    function renderReplies(replyArray){
        // build the reply HTML
        let replyHTML = `
        <div class="content-webmentions--replies">
            <h4>${replyArray.length} ${replyArray.length === 1 ? ' reply' : ' replies'}</h4>
            <ul class='content-webmentions__list no-style'>`;

        // map over each reply,
        replyArray.map(function(l){
            let replyObj = {
                photo: cloudifyPhoto(l.data.author.photo),
                name: l.data.author.name,
                authorUrl: l.data.author.url,
                url: l.data.url,
                date: new Date(l.data.published || l.verified_date),
                content: l.data.content
            }

            replyHTML += replyTemplate(replyObj);
        });

        // close the HTML
        replyHTML +=
            `   </ul>
            </div>`;

        // append the generated HTML to the total
        webmentionHTML += replyHTML;
    }

    // reply HTML template
    function replyTemplate(replyObj){
        return `<li class="content-webmentions__list-item h-entry">
            <div class="comment">
                <div class="comment__author reply p-author webmention-container">
                    <a class="reply__avatar u-author bg-none" href="${replyObj.authorUrl}" title="${replyObj.name}">
                        <img class="u-photo webmention-img bg-acc" src="${replyObj.photo}" alt="${replyObj.name}">
                    </a>
                    <p class="reply__author reply__author p-author m-0">
                        <a class="reply__bar u-url" href="${replyObj.url}">${replyObj.name}</a>
                    </p>
                    <p class="reply__date m-0" href="">
                        <a class="reply__bar u-url" href="${replyObj.url}">${formatDate(replyObj.date)}</a>
                    </p>
                </div>
                <div class="comment__content e-entry ml-3">${replyObj.content}</div>
            </div>
        </li>`;
    }

    // like, repost, link HTML template
    function likeRepostLinkTemplate(likeObj){
        return `<li class="content-webmentions__list-item h-entry">
            <div class="reply h-card p-author webmention-container">
                <a class="reply__avatar u-author bg-none" href="${likeObj.authorUrl}" title="${likeObj.name}">
                    <img class="u-photo webmention-img bg-acc" src="${likeObj.photo}" alt="${likeObj.name}">
                </a>
                
                <p class="reply__author reply__author p-name m-0">
                    <a class="reply__bar u-url" href="${likeObj.url}">${likeObj.name}</a>
                </p>
            
            
                <p class="reply__date m-0 ml-auto" href="">
                    <a class="reply__bar u-url stealth" href="${likeObj.url}">${formatDate(likeObj.date)}</a>
                </p>
                
            </div>
        </li>`;
    }

    // template for the JS version of the form
    function formTemplate(){
        return `<div class="card bg-bg-muted rounded p-2"><form id="webmention-form" class="content-webmentions__form" method="post" action="https://webmention.io/nooshu.github.io/webmention">
                    <input id="webmention-target" type="hidden" name="target" value="${window.location.href}">

                    <label class="content-webmentions__form-label" for="webmention-source">Written a response to this post? Let me know the URL using the form below:</label>
                    <input class="bg-bg my-1" type="text" id="webmention-source" name="source" placeholder="https://example.com/my-post" class="content-webmentions__form-input">
                    <button type="submit" id="webmention-submit" class="btn content-webmentions__form-button">Send Webmention</button>

                    <p class="content-webmentions__form-message visually-hidden"></p>
                </form></div>`;
    }

    // start the dance
    init();
})();
