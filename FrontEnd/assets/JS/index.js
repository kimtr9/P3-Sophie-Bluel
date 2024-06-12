
//Variables globales 
let works = [];
let categories = [];
const token = localStorage.getItem('token')


//////**************PAGE DE PRESENTATION********************/////


//Récupération des travaux de l'API
async function getWorks () {
    try {
        const response = await fetch ('http://localhost:5678/api/works');
        works = await response.json(); 
    } catch (error) {
        console.log('Erreur fetch works', error);

    }}

// Récupération des catégories 
async function getCategories() {
    try {
        const response = await fetch('http://localhost:5678/api/categories')
        categories = await response.json();
    } catch(error) {
        console.log('Erreur fetch des catégories', error)

    }
}


// Affichage des travaux dans la galerie

//même fonction pour afficher works ou filteredWorks//
function displayGallery(filteredWorks = works, container = '.gallery')  {
    //vider la galerie HTML
    const HTMLgallery = document.querySelector(container);
    HTMLgallery.innerHTML = '';

    //création de la galerie
    filteredWorks.forEach(work => {
        const figure = document.createElement('figure');
        figure.dataset.imgId = work.id;
        figure.dataset.category = work.categoryId;

        const image = document.createElement('img');
        image.src = work.imageUrl;
        image.alt = work.title;

        const figcaption = document.createElement('figcaption')
        figcaption.textContent = work.title;
    
        //ajout de l'icône de suppression pour la modale
        if (container === '.modal-gallery') {

            const imageContainer = document.createElement('div'); 
            imageContainer.classList.add('image-container');

            const deleteIcon = document.createElement('i');
            deleteIcon.classList.add('fa-solid', 'fa-trash-can', 'delete-icon');

            imageContainer.appendChild(image);
            imageContainer.appendChild(deleteIcon);

            figure.appendChild(imageContainer);
        }else {
            figure.appendChild(image);
        }
        
        figure.appendChild(figcaption);
        HTMLgallery.appendChild(figure);
    });
     // Attacher les écouteurs de clic pour les icônes de suppression
     if (container === '.modal-gallery') {
        attachListenerstoDeleteIcons();
    }
}
    

//Création des boutons de filtre
function createFilterButtons() {
    const filterBar = document.querySelector('.filter-buttons');
    filterBar.innerHTML = '';

    //Bouton toutes catégories
    const allButton = document.createElement('button');
    allButton.innerText= 'Tous';
    allButton.addEventListener('click', () => displayGallery(works));
    filterBar.appendChild(allButton);

    //Boutons des autres catégories
    categories.forEach(category => {
        const button = document.createElement('button');
        button.innerText = category.name;
        button.addEventListener('click', () => {
            const filteredWorks = works.filter(work => work.categoryId === category.id);
            displayGallery(filteredWorks);
        });
        filterBar.appendChild(button);
    });
}

// Fonction pour lancer la galerie
async function startGallery() {
    await getWorks();
    await getCategories();
    createFilterButtons();
    displayGallery();
}
startGallery();





//**********************Mode édition************************///

//Fonction gestion de mise à jour d'affichage  quand l'utilisateur est connecté (mode édition)
function updateToEditionMode() {
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token; // Vérifie si le token existe

    const editionBar = document.querySelector('.edition-mode-bar');
    const editProjectsButton = document.querySelector('.projects button');
    const logInLink = document.querySelector('.login-link')
    const filterBar = document.querySelector('.filter-buttons');

    if (editionBar && editProjectsButton) { // Vérifie que les éléments existent
        if (isLoggedIn) {
            console.log('Utilisateur connecté');
            editionBar.style.display = 'block';
            editProjectsButton.style.display = 'block';
            filterBar.style.display = 'none';
            logInLink.innerText = 'logout'
            logInLink.href = '#';

            logInLink.addEventListener('click', (event) => {
                event.preventDefault();
                localStorage.removeItem('token');
                 window.location.reload();
            })
        } else {
            console.log('Utilisateur deconnecté')
            editionBar.style.display = 'none';
            editProjectsButton.style.display = 'none';
            filterBar.style.display = 'flex';
            logInLink.innerText = 'login';
            logInLink.href = 'login.html';
        }
} else {
    console.error('Eléments non trouvés');
}}


document.addEventListener('DOMContentLoaded', () => {
    updateToEditionMode();
});



/////*******************MODALE ***********************//////

//Ouvrir la boîte modale 
let modal = null 

const openModal = function (e) {
    e.preventDefault();
    const target = document.querySelector(e.target.getAttribute('href'))
    target.style.display = null;
    target.removeAttribute('aria-hidden')
    target.setAttribute('aria-modal', 'true')
    modal = target;
    modal.addEventListener('click', closeModal)
    //Affichage de la galerie
    displayGallery(works, '.modal-gallery');
    modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation)
   

     // Attacher le click à l'icône X
     const closeButton = document.getElementById('close-modal');
     if (closeButton) {
         closeButton.addEventListener('click', closeModal);
     }
}

document.querySelector('.open-modal').addEventListener('click', openModal)


// Fermer la modale
const closeModal = function (e) {
    if(modal === null) return;
    e.preventDefault();
    modal.style.display = "none"
    modal.setAttribute('aria-hidden', 'true')
    modal.removeAttribute('aria-modal')
    modal.removeEventListener('click', closeModal)
    modal.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation)
    modal = null;

}

const stopPropagation = function (e) {
    e.stopPropagation();
}
    
window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' ||  e.key === 'Esc') {
        closeModal(e)
    }
})

// Fonction pour attacher les écouteurs sur toutes les icônes
function  attachListenerstoDeleteIcons() {
    document.querySelectorAll('.delete-icon').forEach(icon => {
        icon.addEventListener('click', async (e) => {
            e.preventDefault();
            await deleteWork(e);
        });
    });
}


//Fonction de suppression de l'imagee
async function deleteWork(event) {
    const figure = event.target.closest('figure');
    const imgId = figure.dataset.imgId;

    if (!imgId) {
        console.error('id image non trouvé')
        return;
    }

   try {
    //Requête à l'API
       const response = await fetch(`http://localhost:5678/api/works/${imgId}`, {
           method: 'DELETE',
           headers: {
               Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
       });

       if (response.ok) {
           figure.remove();
           await getWorks();
           displayGallery()
       } else {
        console.error('Erreur suppression image')
       }

    } catch (error) {
        console.error('Erreur', error);
    } 
}
   
