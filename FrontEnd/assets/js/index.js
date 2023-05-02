// Create e Set to get all Works and categories without duplicate items
const allWorks = new Set()
const allCategories = new Set()
// Collect the login token. If there's no token, the const will be empty
const token = window.localStorage.getItem("token")
// Variables declarations
let modal = null, previousModal = null;
const focusableSelector = "button, a, input, textarea";
let focusables = []; 
let previouslyFocusedElement = null 
let imgData //changer imgUrl en img (binaire)

// Initialize the page on load. Calls all works and filters.
async function init(){
    const works = await getAllDatabaseInfo("works")
    for (const work of works) {
        allWorks.add(work)
    }
    const categories = await getAllDatabaseInfo("categories")
    for (const category of categories) {
        allCategories.add(category)
    }
    createGallery()
    if(token == null){
        createFilters()
        //document.querySelector("#logout").classList.add("hidden");
        document.querySelector("#logout").style.display = "none";
    }else{
        document.querySelector("#adminBloc").style.display = "flex";
        document.querySelector("#login").classList.add("hidden");
        document.querySelector("#modificationDescription").classList.remove("hidden");
        document.querySelector("#modificationProjects").classList.remove("hidden");
        document.querySelector("#modificationImageDescription").classList.remove("hidden");
        initModal()
    }
    
}
init()



// Function taking any type of work
async function getAllDatabaseInfo(type){
    const response = await fetch("http://localhost:5678/api/"+type);
    if (response.ok) {
        return response.json()
    } else {
        console.log(response.error);
    }
}



/*
    GALLERY DISPLAY
*/

function createGallery(works = allWorks) {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";

    // create un fragment to take all website's cards.
    const fragment = document.createDocumentFragment()
    for (const work of works) {

        const cardGallery = document.createElement("figure");
        cardGallery.id = "figure-"+work.id

        cardGallery.innerHTML = `<img src="${work.imageUrl}" alt="${work.title}">
        <figcaption>${work.title}</figcaption>`

        fragment.appendChild(cardGallery)
    }
    // Doing only one reflow of the gallery/
    gallery.appendChild(fragment);
}



/*
    DYNAMIC DISPLAY OF FILTERS
*/

function createFilters(){
    document.querySelector(".filters").innerHTML="";
    // Sorting categories in ascending order (in case it hasn't already been done)
    const sortedCategories = Array.from(allCategories);
    sortedCategories.sort(function(a, b){
        return a-b;
    });

    // Display filters
    const filterSection = document.querySelector(".filters");
    filterSection.innerHTML="";
    const filtersFragment = document.createDocumentFragment();

    // Creating filter button "TOUS"
    const filterButton = document.createElement("button");
    // Adding class on button "TOUS"
    filterButton.classList.add("filterButton");
    filterButton.classList.add("active");
    filterButton.innerText="Tous";
    // Adding data-id on the class 
    filterButton.dataset.id=0;
    // Adding button in the fragment
    filtersFragment.appendChild(filterButton);

    //Createing the others buttons filters
    for(const cat of sortedCategories){
        const filterButton = document.createElement("button");
        filterButton.classList.add("filterButton");
        filterButton.innerText=cat.name;
        filterButton.dataset.id=cat.id;
        filtersFragment.appendChild(filterButton);
    }

    // Adding fragment containing buttons in .filter section. (doing a single reflow of .filter section)
    filterSection.appendChild(filtersFragment);
    createFilterListener()
}   


/*
    Display and operations of filters 
*/

function createFilterListener() {
    const buttons = document.querySelectorAll(".filterButton")

    for (const button of buttons) {
        button.addEventListener("click", (e) => {
            const clickedButton = e.target
            document.querySelector(".active").classList.remove("active")
            clickedButton.classList.add("active")
            const selectedCategory = parseInt(clickedButton.dataset.id)
            let sortedWorks = allWorks
            if (selectedCategory != 0) {
                sortedWorks = [...allWorks].filter(work => work.categoryId == selectedCategory)
            }
            createGallery(sortedWorks);
        })
    }
}


function logout(){
    const buttonLogout = document.querySelector("#logout")
    buttonLogout.addEventListener("click", (e) => {
        window.localStorage.removeItem("token")
        token = null;
        init();
    })
}
logout();


/*
    OPEN AND CLOSE MODALS
*/
const initModal = async function(){
    // Listen a "click" with a link with "js-modal" class
    document.querySelectorAll(".js-modal").forEach(a => {
        a.addEventListener("click", openModal);
    });

    // Listen keyboard to close modal or keep the focus inside the modal
    window.addEventListener("keydown", function (e){
        if(e.key === "Escape" || e.key === "Esc"){
            closeModal(e);
        }
        if(e.key === "Tab" && modal != null){
            focusInModal(e);
        }
    });

    formSendWork()
}


const openModal = async function(e){
    let href
    if(e instanceof Event){
        e.preventDefault()
        const target = e.target
        
        if(target.tagName != "A"){
            href = target.closest("a").getAttribute("href")
        } else {
            href = target.getAttribute("href")
        }
    }else{
        href = e
    }

    modal = document.querySelector(href);
    
    if(previousModal != null){
        previousModal.setAttribute("aria-hidden", true);
        previousModal.removeAttribute("aria-modal");
        previousModal.style.display ="none";
    }
    
    focusables = Array.from(modal.querySelectorAll(focusableSelector))
    previouslyFocusedElement = document.querySelector(":focus");
    focusables[0].focus()

    modal.style.display = "flex"
    modal.setAttribute("aria-hidden", false);
    modal.setAttribute("aria-modal", true);
    
    modal.addEventListener("click", closeModal);
    modal.querySelector(".js-modal-close").addEventListener("click", closeModal);
    modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);

    if(modal.id == "modal") afficherGalleryModal(allWorks)
    if(modal.id == "modalSendPicture"){
        createFormCategories(allCategories)
        newPicture()
    } 
    previousModal = modal
}


const closeModal = function(e){
    if (modal === null) return

    modal.setAttribute("aria-hidden", true);
    modal.removeAttribute("aria-modal");

    modal.removeEventListener("click", closeModal);
    modal.querySelector(".js-modal-close").removeEventListener("click", closeModal);
    modal.querySelector(".js-modal-stop").removeEventListener("click", stopPropagation);

    if(previouslyFocusedElement != null) previouslyFocusedElement.focus()

    const hideModal = function(){
        modal.style.display ="none";
        modal.removeEventListener("animationend", hideModal);
        modal = null;
    }
    modal.addEventListener("animationend", hideModal);
    previousModal = null;
}


const stopPropagation = function(e){
    e.stopPropagation();
}

// Function that encloses the focus inside the modal
const focusInModal = function (e){
    e.preventDefault();
    let index = focusables.findIndex(f => f === modal.querySelector(":focus"));
    if (e.shiftKey === true){
        index --
    }else{
        index ++
    }

    if (index >= focusables.length -1){
        index=0
    }
    if (index < 0){
        index = focusables.length - 2
    }
    focusables[index].focus()
}


const afficherGalleryModal = function(works){
    const modalGallery = document.querySelector("#modalGallery");
    modalGallery.innerHTML="";
    const fragmentModal = document.createDocumentFragment();

    for(const work of works){
        const modalCard = document.createElement("figure");
        modalCard.id="figureModal-"+work.id
        modalCard.innerHTML = `<button class="buttonDelete js-delete" data-id="${work.id}"><img src="./assets/icons/delete.svg" alt="supprimer"></button>
        <img src="${work.imageUrl}" alt="${work.title}">
        <figcaption>éditer</figcaption>`
        fragmentModal.appendChild(modalCard)
    }
    modalGallery.appendChild(fragmentModal)
    deleteListener()
}


/*
    Delete Work(s)
*/

async function deleteListener() {
    document.querySelectorAll(".js-delete").forEach(btn => {
        btn.addEventListener("click", async function (e) {
            e.preventDefault()
            let idToBeDeleted
            if(e.target.dataset.id == -1){
                idToBeDeleted = e.target.dataset.id
            }else{
                idToBeDeleted = e.target.closest("button").dataset.id
            }

            
            if (idToBeDeleted == -1) {
                for (work of allWorks) {                    
                    const result = await deleteImg(work.id)
                    if(result == 1){
                        document.querySelector("#figureModal-"+work.id).remove()
                        document.querySelector("#figure-"+work.id).remove()
                    }else console.log("erreur de suppression")
                }
            } else {
                const result = await deleteImg(idToBeDeleted)   
                if(result == 1){
                    e.target.closest("figure").remove()
                    document.querySelector("#figure-"+idToBeDeleted).remove()
                }else console.log("erreur de suppression")
                
            }
            
        })
    })
}

const deleteImg = async function(idToBeDeleted){
    // Fetch function to delete a work by the API
    const response = await fetch("http://localhost:5678/api/works/"+idToBeDeleted,{
    method: "DELETE",
    headers : {
        accept : "*\/*",
        authorization : `Baerer ${window.localStorage.getItem("token")}`
    }
    })
    
    if(response.ok){
        for(const work of allWorks){
            if(work.id == idToBeDeleted) {
                allWorks.delete(work)
            }
        }
        return 1
    }else{
        console.log(response.status)
        return 0
    }
}


/*
    SENDING A NEW WORK
*/



const createFormCategories = function(categories){
    const select = document.querySelector("#imgCategory")
    select.innerHTML=""
    const fragment = document.createDocumentFragment()
    for(category of categories){
        const newCategory = document.createElement("option");
        newCategory.value = category.id
        newCategory.innerHTML=category.name
        fragment.appendChild(newCategory)
    }
    select.appendChild(fragment)
}

const newPicture = function(){
    document.getElementById('addImgFile').addEventListener('change', function(){
        imgData = this.files[0]
        if (imgData) {
            var picture = new FileReader();
            const sizePicture = this.files[0].size
            const typePicture = this.files[0].type
            const maxSizePicture = 1024*1024*1024

            picture.readAsDataURL(this.files[0]);

            if((sizePicture <= 4096000) & (typePicture == "image/jpeg" || typePicture == "image/png")){
                picture.addEventListener('load', function(e) {
                    document.querySelector(".pictureLoader").style.display = "none"
                    document.getElementById('uploadedImage').setAttribute('src', e.target.result);
                    document.querySelector('.uploadedImageContainer').style.display="flex"

              });
            }else{
                //document.querySelector(".pictureLoader p").style.color = "red"
                if(sizePicture > 4096000){
                    document.querySelector(".wrongSizePicture").innerHTML="La taille de l'image dépasse 4Mo, merci de choisir un fichier moins volumineux."
                }
                if(typePicture != "image/jpeg" & typePicture != "image/png"){
                    document.querySelector(".wrongTypePicture").innerHTML="Format de fichier incorrect. Merci de choisir un fichier au format jpg ou png uniquement."
                }
                imgData = null
            }

        }
        
    });
}

const formSendWork = async function(){    
    
    const newWork = document.querySelector("#formNewWork")
    newWork.addEventListener("submit", async (e) => {
        
        e.preventDefault()
        const title = newWork.imgTitle.value
        const category = newWork.imgCategory.value

        if(title!=null && category!=null && imgData.size <= 4096000 && (imgData.type == "image/jpeg" || imgData.type == "image/png")){
            sendWork(title, category)
        }else{
            console.log("error")
        }
        
    })
}

const sendWork = async function(title, category){

    // Creation of a FormData to prepare the new project's informations to be sent
    const pictureInformations = new FormData()
    pictureInformations.append("image", imgData)
    pictureInformations.append("title", title)
    pictureInformations.append("category", category)

    const sendingWork = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: { 
            authorization : `Baerer ${window.localStorage.getItem("token")}`
        },
        body: pictureInformations
    })
    
    if(sendingWork.ok){
        const newWorkValue = await sendingWork.json()
        console.log("sendingWork : ", newWorkValue)
        allWorks.add(newWorkValue)
        
        // Clear modal form
        document.getElementById("imgTitle").value=""
        document.querySelector(".pictureLoader").style.display = "flex"
        document.getElementById('uploadedImage').removeAttribute('src');
        document.querySelector('.uploadedImageContainer').style.display="none"

        // Reopening 1st modal
        openModal("#modal")

        // Update Gallery
        createGallery()

        /* ne fonctionne pas... mais serait mieux que de rappeler la fonction createGallery
        const addingWork = document.createElement("figure")
        
        addingWork.id = "figure-"+newWorkValue.id
        addingWork.innerHTML = `<img src="${newWorkValue.imageUrl}" alt="${newWorkValue.title}">
        <figcaption>${newWorkValue.title}</figcaption>`

        document.querySelector("#gallery").appendChild(addingWork)
        */

    }else{
        console.log(sendingWork.status)
    }
}