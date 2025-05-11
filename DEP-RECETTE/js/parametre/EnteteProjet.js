var etatImg1 = false;
var etatImg2 = false;
$(function () {
    $('.select_').select2();
    GetDataSociete();
    $("#resetImg").click(function () {
        $("#profilePic").attr("src", "../images/user.png");
        $("#error_img_2").html('');
        etatImg1 = true;
    })
    $("#resetImg_2").click(function () {
        $("#profilePic_2").attr("src", "../images/user.png");
        $("#error_img_2").html('');
        etatImg2 = true;
    })
    document.getElementById("profileUpload").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file && (file.size <= 100 * 1024)) { //100 Ko
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById("profilePic").src = e.target.result;
            };
            reader.readAsDataURL(file);
            document.getElementById('error_img').textContent = "";
        } else {
            var message = 'La taille de la 1ère image ne doit pas dépasser 100 Ko.';
            document.getElementById('error_img').textContent = message;
            event.target.value = "";
        }
    });
    document.getElementById("profileUpload_2").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file && (file.size <= 100 * 1024)) { //100 Ko
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById("profilePic_2").src = e.target.result;
            };
            reader.readAsDataURL(file);
            document.getElementById('error_img_2').textContent = "";
        } else {
            var message = 'La taille de la 2ème image ne doit pas dépasser 100 Ko.';
            document.getElementById('error_img_2').textContent = message;
            event.target.value = "";
        }
    });
    $('.closeForm').click(function () {
        document.getElementById('fullscreen_popup').style.display = "none";
    })
})
var Enregistrer = function () {
    if (!validerChamps()) return;
    var TableData = new FormData();
    collecterDonneesFormulaire(TableData);

    $.ajax({
        type: "POST",
        url: "/CRUD/SendSociete",
        data: TableData,
        contentType: false,
        processData: false,
        success: function (data) {
            afficherMessage(data.message);
        },
        error: function () {
            alert("Erreur lors de l'envoi des données.");
        }
    });
}

function validerChamps() {
    let isValid = true;

    const champs = [
        { id: "#libelleProjet", nom: "libelleProjet" },
        { id: "#sigle", nom: "sigle" },
    ];

    champs.forEach(c => {
        const val = $(c.id).val().trim();
        if (!val) {
            isValid = false;
            $(c.id).siblings("span.erreur").html("champ obligatoire").show();
        } else {
            $(c.id).siblings("span.erreur").html("").hide();
        }
    });

    // Vérifier si la taille de l'image est inférieure à 100 Ko
    const input1 = document.querySelector('#profileUpload');
    const input2 = document.querySelector('#profileUpload_2');

    if (input1 && input1.files.length > 0) {
        const tailleImg_1 = input1.files[0].size / 1024;
        if (tailleImg_1 > 100) {
            isValid = false;
            $("#error_img").html("La taille de la 1ère image ne doit pas dépasser 100 Ko.");
        } else {
            $("#error_img").html("");
        }
    }

    if (input2 && input2.files.length > 0) {
        const tailleImg_2 = input2.files[0].size / 1024;
        if (tailleImg_2 > 100) {
            isValid = false;
            $("#error_img_2").html("La taille de la 2ème image ne doit pas dépasser 100 Ko.");
        } else {
            $("#error_img_2").html("");
        }
    }

    return isValid;
}

function collecterDonneesFormulaire(TableData) {
    TableData.append("etatImg1", etatImg1);
    TableData.append("etatImg2", etatImg2);
    TableData.append("raisonSociale_1", $("#libelleProjet").val());
    TableData.append("raisonSociale_2", $("#libelleProjet2").val());
    TableData.append("sigle", $("#sigle").val());
    TableData.append("adresse_1", $("#adresse1").val());
    TableData.append("adresse_2", $("#adresse2").val());
    TableData.append("ville", $("#ville").val());
    TableData.append("pays", $("#pays").val());
    TableData.append("telephone_1", $("#telephone").val());
    TableData.append("faxe_1", $("#fax").val());
    TableData.append("boitePostale_1", $("#BoitePostale").val());
    TableData.append("email_1", $("#email").val());
    TableData.append("ninea_1", $("#ninea").val());
    TableData.append("rc_1", $("#rc").val());
    TableData.append("compteBanque_1", $("#compteBanc").val());
    TableData.append("siteWeb_1", $("#siteWeb").val());

    TableData.append("raisonSociale_3", $("#raisonSocial").val());
    TableData.append("adresse_3", $("#adresseTranport").val());
    TableData.append("telephone_2", $("#TelTranport").val());
    TableData.append("faxe_2", $("#faxTranport").val());
    TableData.append("boitePostale_2", $("#BoitePostalTranport").val());
    TableData.append("email_2", $("#EmailTranport").val());
    TableData.append("ninea_2", $("#nineaTranport").val());
    TableData.append("rc_2", $("#RCTranport").val());
    TableData.append("compteBanque_2", $("#CpteBancTranport").val());
    TableData.append("siteWeb_2", $("#SiteWebTranport").val());

    TableData.append("ImageUpload_1", $("#profileUpload").get(0).files[0]);
    TableData.append("ImageUpload_2", $("#profileUpload_2").get(0).files[0]);
}
function afficherMessage(message) {
    $('.alert_Param').removeClass("hide").addClass("show showAlert");
    $(".result_Param").html(`<font style="color: #ce8500;">${message}</font>`);
    setTimeout(() => {
        $('.alert_Param').addClass("hide").removeClass("show");
    }, 1000);
}
function GetDataSociete() {
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: {},
        url: '/CRUD/GetRprojet',
        success: function (data) {
            $("#libelleProjet").val(data.social_1);
            $("#libelleProjet2").val(data.social_2);
            $("#adresse1").val(data.adresse_1);
            $("#adresse2").val(data.adresse_2);
            $("#ville").val(data.ville);
            $("#pays").val(data.pays).trigger('change');
            $("#pays").val(data.pays);
            $("#telephone").val(data.phone_1);
            $("#fax").val(data.faxe_1);
            $("#BoitePostale").val(data.postale_1);
            $("#email").val(data.email_1);
            $("#ninea").val(data.ninea_1);
            $("#rc").val(data.rc_1);
            $("#compteBanc").val(data.compte_1);
            $("#siteWeb").val(data.web_1);
            $("#raisonSocial").val(data.sociale_3);
            $("#adresseTranport").val(data.adresse_3);
            $("#TelTranport").val(data.phone_2);
            $("#faxTranport").val(data.faxe_2);
            $("#BoitePostalTranport").val(data.postale_2);
            $("#EmailTranport").val(data.email_2);
            $("#nineaTranport").val(data.ninea_2);
            $("#RCTranport").val(data.rc_2);
            $("#CpteBancTranport").val(data.compte_2);
            $("#SiteWebTranport").val(data.web_2);

            $("#sigle").val(data.sigle);
            if (data.image1 == null || data.image1 == "") {
                $("#profilePic").attr("src", "../images/user.png");
            } else {
                $("#profilePic").attr("src", data.image1);
            }
            if (data.image2 == null || data.image2 == "") {
                $("#profilePic_2").attr("src", "../images/user.png");
            } else {
                $("#profilePic_2").attr("src", data.image1);
            }
        }
    })
}