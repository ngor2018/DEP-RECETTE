document.querySelectorAll("a[name]").forEach(link => {
    link.addEventListener("click", function (event) {
        event.preventDefault(); // Empêcher le lien de s'ouvrir normalement

        let pageName = this.getAttribute("name"); // Récupérer le name
        let classes = this.classList; // Récupérer la liste des classes
        let controller = null;

        // Vérifier à quel contrôleur appartient le lien en fonction des classes
        switch (true) {
            case classes.contains("Home"):
                controller = "Home";
                break;
            case classes.contains("Parametre"):
                controller = "Parametre";
                break;
            case classes.contains("Saisie"):
                controller = "Saisie";
                break;
            default:
                console.warn("Aucun contrôleur correspondant trouvé.");
                return;
        }
        let url = `/${controller}/${pageName}`; // Construire l'URL
        window.location.href = url; // Rediriger vers l'URL correspondante
    });
});