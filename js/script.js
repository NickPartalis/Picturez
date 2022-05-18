'use strict'
const API_KEY = "H9HTD1I_fCBhHYUoIVzWaZ28yMBrPPFOfBkgUz31pj0";
let currentPage = 1;
let globalQuery = '';
let totalPages = 1;

let search = async (query, page, perPage) => {
    window.scroll(0,0);
    globalQuery = query;
    let data = await fetch(`https://api.unsplash.com/search/photos/?query=${query}&page=${page}&per_page=${perPage}`, {
        method: 'GET',
        headers: {
            'Authorization': `Client-ID ${API_KEY}`
        }
    });
    data = await data.json();
    totalPages = data.total_pages;
    generateResults(data.results);
}

let generateResults = (data) => {
    let html = "";
    data.forEach((d)=>{
        let date = new Date(d.updated_at);
        let formattedDate = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ${date.getHours()}:${('0'+date.getMinutes()).slice(-2)}`; //H:MM

        //Getting favorites
        let cardID = `card_${d.id}`;
        let favoriteStatus, favoriteText = '';
        let favArr = JSON.parse(localStorage.getItem("favorites"));
        if(!favArr){favArr = [];} //In case localstorage is empty
        if(favArr.includes(cardID)){
            favoriteStatus = "favorite";
            favoriteText = "Remove from Favorites"
        }else {
            favoriteStatus = "";
            favoriteText = "Add to Favorites";
        }

        html += `
        <div class="column is-one-quarter-desktop is-full-mobile">
            <div class="card ${favoriteStatus}" id="${cardID}" >
                <div class="card-image">
                    <figure class="image is-4by3">
                        <a href="${d.urls.full}"><img src="${d.urls.small}" alt="${d.urls.small}"></a>
                    </figure>
                </div>
                <div class="card-content">
                    <div class="media">
                        <div class="media-left">
                            <figure class="image is-48x48">
                                <img src="${d.user.profile_image.medium}" alt="${d.user.profile_image.medium}">
                            </figure>
                        </div>
                        <div class="media-content">
                            <p class="title is-4">${d.user.name?d.user.name:''}</p>
                            <p class="subtitle is-6">@${d.user.instagram_username}</p>
                        </div>
                    </div>
                    <div class="content">
                        <p><em>${d.description?d.description:(d.alt_description?d.alt_description:'')}</em></p>
                        <p class="subtitle is-7 is-spaced"><time datetime="${formattedDate}">Uploaded: ${formattedDate}</time></p>
                    </div>
                    <footer class="card-footer">
                        <a href="javascript:;" class="card-footer-item" onclick="favorite('${cardID}')">${favoriteText}</a>
                    </footer>
                </div>
            </div>
        </div>`;
    });
    document.querySelector("#search-results").innerHTML = html;
    pagination(totalPages);

}

let favorite = function(id) {
    let card = document.querySelector(`#${id}`);
    let link = document.querySelector(`#${id} .card-footer-item`);

    let favArr = JSON.parse(localStorage.getItem("favorites"));

    if(!favArr){favArr = [];} //In case localstorage is empty

    if(card.classList.contains("favorite")){
        card.classList.remove("favorite");
        let temp = favArr.filter(x => x !== id);
        localStorage.setItem("favorites", JSON.stringify(temp));
        link.innerHTML = "Add to Favorites";
    }else{
        card.classList.add("favorite");
        favArr.push(id);
        localStorage.setItem("favorites", JSON.stringify(favArr));
        link.innerHTML = "Remove from Favorites";
    }
}

let pagination = (total) => {
    let pageArr = [];
    for(let i=1; i<=total; i++){
        if(i == 1) pageArr.push(1);
        if(i > 1 && i >= currentPage-2 && i <= currentPage+2 && i < total) pageArr.push(i);
        if(i == total && total > 1) pageArr.push(total);
    }
    let html = '';
    pageArr.forEach((p, pindex) => {
        html += `<li><a class="pagination-link ${p == currentPage?'is-current':''}" data-page="${p}" aria-label="Goto page ${p}">${p}</a></li>`;
        if(pindex == 0 && pageArr[1] - pageArr[0] > 1){
        html += `<li><span class="pagination-ellipsis">&hellip;</span></li>`
        }
        if(pindex == pageArr.length - 2 && pindex > 1 && pageArr[pageArr.length-1] - pageArr[pageArr.length-2] > 1){
        html += `<li><span class="pagination-ellipsis">&hellip;</span></li>`
        }
    });
    document.querySelector("#myPagination").innerHTML = html;
    document.querySelectorAll('.pagination-link').forEach(btn => {
        btn.addEventListener('click', function(event){
            currentPage = parseInt(this.getAttribute('data-page'));
            let perPage = document.querySelector("#resultsPerPage").value;
            search(globalQuery, currentPage, perPage);
        })
    })
    // Enable/Disable Previous button
    if(currentPage > 1) document.querySelector(".pagination-previous").classList.remove("disabled");
    else document.querySelector(".pagination-previous").classList.add("disabled");
    // Enable/Disable Next button
    if(currentPage < total) document.querySelector(".pagination-next").classList.remove("disabled");
    else document.querySelector(".pagination-next").classList.add("disabled");
}

//Get random pictures
let getRandom = async () => {
    let data = await fetch(`https://api.unsplash.com//photos/random/?count=${12}`, {
        method: 'GET',
        headers: {
            'Authorization': `Client-ID ${API_KEY}`
        }
    });
    data = await data.json();
    generateResults(data);
}
//Event Listeners
//Previous/Next buttons
document.querySelector(".pagination-previous").addEventListener('click', function(e){
    currentPage--;
    let perPage = document.querySelector("#resultsPerPage").value;
    search(globalQuery, currentPage, perPage);
});

document.querySelector(".pagination-next").addEventListener('click', function(e){
    currentPage++;
    let perPage = document.querySelector("#resultsPerPage").value;
    search(globalQuery, currentPage, perPage);
});
// Search bar
document.querySelector("#search-btn").addEventListener('click',(e)=>{
    let query = document.querySelector("#search-box").value;
    let perPage = document.querySelector("#resultsPerPage").value;
    search(query, currentPage, perPage);
});
document.querySelector('#search-box').addEventListener('keyup',function(e){
    if(e.key == 'Enter'){
        let perPage = document.querySelector("#resultsPerPage").value;
        search(this.value, 1, perPage);
    }
});


getRandom(); //Initial random pictures when first opening site

