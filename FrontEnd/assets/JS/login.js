//Récupération du formulaire
const loginForm = document.querySelector('.login-form')
// Ecouteur d'évènement au moment du submit
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = loginForm.querySelector("#email").value
    const password = loginForm.querySelector("#password").value

    // Requête POST à l'API
    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
             method: "POST",
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify( {
                "email": email,
                "password": password
             })
        });

        const data = await response.json()

        if(!response.ok) {
            alert(data.message || 'Erreur dans l’identifiant ou le mot de passe');
            return;
        }
        console.log('Réponse: ', data);

        // Stockage du token dans le localStorage
        localStorage.setItem("token", data.token)
        // redirection vers page d'accueil 
        window.location.href = "index.html";
        
        
    } catch (error) {
        console.log('Erreur: ', error)
    }
});

