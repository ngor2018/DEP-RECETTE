$(function () {
    $('.inputUp').keyup(function () {
        document.getElementById('erreur_authentif').textContent = "";
    })
    $("#password").focus(function () {
        var login = $("#login").val();
        if (login.trim() != '') {
            const objData = {
                login: login,
            }
            $.ajax({
                url: "/Home/checkLoginPasswod",
                type: "POST",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(objData),
                success: function (data) {
                    switch (data.statut) {
                        case 1:
                            document.getElementById('divConfirmPWD').style.display = "block";
                            break;
                        case 2:
                            document.getElementById('divConfirmPWD').style.display = "none";
                            break;
                        default:
                            document.getElementById('divConfirmPWD').style.display = "none";
                            break;
                    }
                },
                error: function (error) {
                    console.error(error);
                }
            });
        } else {
            document.getElementById('divConfirmPWD').style.display = "none";
            $("#Confirmpassword").val('');
        }
    })
})
function SeConnecter() {
    var isAllValid = true;
    var login = $("#login").val().trim();
    var password = $("#password").val().trim();
    var Confirmpassword = $("#Confirmpassword").val().trim();
    const form = document.getElementById('divConfirmPWD');
    const currentDisplay = window.getComputedStyle(form).display;
    switch (currentDisplay) {
        case "none":
            if (!login || !password) {
                isAllValid = false;
                document.getElementById('erreur_authentif').textContent = "Tous les champs doivent être remplis.";
            }
            break;
        case "block":
            if (!login || !password || !Confirmpassword) {
                isAllValid = false;
                document.getElementById('erreur_authentif').textContent = "Tous les champs doivent être remplis.";
            }
            // Vérification des critères de mot de passe
            // Au moins un chiffre, une majuscule, et 6 caractères
            var passwordPattern = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
            if (!passwordPattern.test(password)) {
                document.getElementById('erreur_authentif').textContent = "Au moins 6 caractères(une majuscule, et un chiffre compris)";
                isAllValid = false;
            }
            if (password !== Confirmpassword) {
                isAllValid = false;
                document.getElementById('erreur_authentif').textContent = "Les nouveaux mots de passe ne correspondent pas !";
            }
            break;
    }
    if (isAllValid) {
        const objData = {
            login: login,
            password: password,
        }
        $.ajax({
            url: "/Home/login",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(objData),
            success: function (data) {
                switch (data.statut) {
                    case true:
                        window.location.href = '/Home/account';
                        break;
                    default:
                        $("#erreur_authentif").hide().html(data.message).fadeIn('slow');
                        break;
                }
            }
        })
    }
}