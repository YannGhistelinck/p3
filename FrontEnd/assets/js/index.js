// Crée une set dans la constante allworks pour éviter les doublons dans les travaux
const allWorks = new Set()

// fonction pour initialiser la page au charchement, appelle tous les travaux et les filtres
async function init(){
    const works = await getAllDatabaseInfo("works")
    const categories = await getAllDatabaseInfo("categories")
    createGallery(works)
    createFilters(categories)
    createFilterListener()
}
init()


// Fonction qui récupère n'importe quel type de travaux
async function getAllDatabaseInfo(type){
    const response = await fetch("http://localhost:5678/api/"+type);
    if (response.ok) {
        return response.json()
    } else {
        console.log(response.error);
    }
}



/*
    AFFICHAGE DE LA GALERIE
*/

function createGallery(works) {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";

    // création d'un fragment pour récupérer toutes les cards du site pour ne faire qu'un seul reflow sur la page
    const fragment = document.createDocumentFragment()
    for (const work of works) {
        //Ajout de l'itération de works dans la Set allWorks
        allWorks.add(work)

        // Question à poser à Adrien, est-ce qu'on est obligé de passer par la const card pour le innerHTML ou on peut directement utiliser la const work comme j'ai fais ?

        //const card = work;
        const cardGallery = document.createElement("figure");
        //cardGallery.innerHTML = `<img src="${card.imageUrl}" alt="${card.title}">
        //<figcaption>${card.title}</figcaption>`

        cardGallery.innerHTML = `<img src="${work.imageUrl}" alt="${work.title}">
        <figcaption>${work.title}</figcaption>`
        

        //ne fait qu'un reflow
        fragment.appendChild(cardGallery)
    }

    gallery.appendChild(fragment);
}





/*
    AFFICHAGE DYNAMIQUE DES FILTRES
*/

function createFilters(categories){

    // récupération des différentes catégories dans un Set pour éviter les doublons
    const listCategories = new Set();
    for (const category of categories){
        listCategories.add(category);
    }

    // Triage des catégories dans l'ordre croissant (au cas où les catégories soient désordonnées)
    const sortedCategories = Array.from(listCategories);
    sortedCategories.sort(function(a, b){
        return a-b;
    });


    // Affichage des filtres
    const filterSection = document.querySelector(".filters");
    filterSection.innerHTML="";
    const filtersFragment = document.createDocumentFragment();

    //Création du bouton "TOUS"
    const filterButton = document.createElement("button");
    //Ajout des classes
    filterButton.classList.add("filterButton");
    filterButton.classList.add("active");
    filterButton.innerText="Tous";
    //ajout du data-id
    filterButton.dataset.id=0;
    //ajout du bouton au fragment
    filtersFragment.appendChild(filterButton);

    //Création de tous les autres boutons
    for(const cat of sortedCategories){
        const filterButton = document.createElement("button");
        filterButton.classList.add("filterButton");
        filterButton.innerText=cat.name;
        filterButton.dataset.id=cat.id;
        filtersFragment.appendChild(filterButton);
    }
    //Affichage du frament contenant les boutons dans la section .filters
    filterSection.appendChild(filtersFragment);
}   





/*
    Fonctionnement des filtres
*/

function createFilterListener() {
    const buttons = document.querySelectorAll(".filterButton")

    for (const button of buttons) {
        // le    (e) => {}    remplace le function(){} que j'utilisais avant.
        // le     e    est une variable liée à l'event.
        button.addEventListener("click", (e) => {
            const clickedButton = e.target
            document.querySelector(".active").classList.remove("active")
            clickedButton.classList.add("active")
            const selectedCategory = parseInt(clickedButton.dataset.id)
            // le   [...allWorks]  permet de transformer le Set en list. Comme un Array.from(allWorks)
            const sortedWork = [...allWorks].filter(function (hotels) {
                if (selectedCategory == 0) {
                    return hotels
                } else {
                    return hotels.categoryId == selectedCategory
                }
            });
            createGallery(sortedWork);
        })
    }
}
