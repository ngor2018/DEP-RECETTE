$("#AnnulerRestaure").click(function () {
    document.getElementById('contenue_Confirm_GenerePaie').style.display = "none";
    $('.alert_Rub').addClass("hide");
    $('.alert_Rub').removeClass("show");
})
function sauvegarder() {
    var racine = $("#racine").val();
    document.getElementById('sauvegarder').disabled = true;
    $.ajax({
        url: '/Utilitaires/SauvegarderBase',
        type: 'POST',
        data: { racine: racine },
        success: function (res) {
            document.getElementById('sauvegarder').disabled = false;
            if (res.success) {
                $('.alert_Param').removeClass("hide");
                $('.alert_Param').addClass("show");
                $('.alert_Param').addClass("showAlert");
                $('.result_Param').html(res.message);
                setTimeout(function () {
                    $('.alert_Param').addClass("hide");
                    $('.alert_Param').removeClass("show");
                }, 2500)
                // Force le téléchargement avec la boîte "Enregistrer sous"
                window.location.href = '/Utilitaires/TelechargerSauvegarde?chemin=' + encodeURIComponent(res.chemin);
            } else {
                alert("Erreur : " + res.message);
            }
        },
        error: function () {
            alert("Erreur technique lors de la sauvegarde.");
        }
    });
}
function LanceRestaurer() {
    var fichier = $("#fileBDD")[0].files[0];
    var isAllValid = true;
    if (!fichier) {
        isAllValid = false;
        $("#fileBDD").siblings('span.erreur').html("Veuillez sélectionner un fichier .bak !").css('display', 'block');
    }

    if (!fichier.name.toLowerCase().endsWith(".bak")) {
        isAllValid = false;
        $("#fileBDD").siblings('span.erreur').html("Le fichier doit être au format .bak !").css('display', 'block');
    }
    if (isAllValid) {
        $("#fileBDD").siblings('span.erreur').css('display', 'none');
        document.getElementById('contenue_Confirm_GenerePaie').style.display = "block";
        var message = `Cette opération est irréversible.Vérifier que vous disposez d'une sauvegarde.
                        La restauration entraînera une déconnexion de l'application.
                        Voulez-vous continuer ?`;
        $("#messageGener").html(message);
    }
}
function ValiderRestauration() {
    var fichier = $("#fileBDD")[0].files[0];
    var formData = new FormData();
    formData.append("fileBDD", fichier);
    $('.alert_Param').addClass("hide");
    $('.alert_Param').removeClass("show");
    document.getElementById('ValiderRestauration').disabled = true;
    $.ajax({
        url: '/Utilitaires/RestaurerBase',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function (res) {
            document.getElementById('ValiderRestauration').disabled = false;
            $('.alert_Param').removeClass("hide");
            $('.alert_Param').addClass("show");
            $('.alert_Param').addClass("showAlert");
            $('.result_Param').innerHTML(res.message);
            switch (res.success) {
                case false:

                    break;
                default:
                    window.location.replace('/Home/Logout');
                    break;
            }
        },
        error: function () {
            alert("Erreur technique lors de la restauration.");
        }
    });
}

