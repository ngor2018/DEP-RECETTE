var pageName = $("#pageName").val();
var groupeUs = $("#groupeUs").val();
var isDelete = false;
var isEditing = false;
const today = new Date();
const yyyy = today.getFullYear();

parameter();
let canvas = null;
let signaturePad = null;
$(document).on('change', '#defaultCheck_Tous', function () {
    if ($(this).is(':checked')) {
        // Si "Tous" est coché, décocher les autres
        $('input[name="check"]').prop('checked', false);
    }
    compteurCheckBox();
});
$(document).on('change', 'input[name="check"]', function () {
    // Si au moins une caisse est cochée, décocher "Tous"
    if ($('input[name="check"]:checked').length > 0) {
        $('#defaultCheck_Tous').prop('checked', false);
    } else {
        // Si aucune caisse cochée, recocher "Tous"
        $('#defaultCheck_Tous').prop('checked', true);
    }
    compteurCheckBox();
});
switch (pageName) {
    case "Enregistrement":
        canvas = document.getElementById("signature");
        signaturePad = new SignaturePad(canvas);
        document.getElementById("clear").addEventListener("click", () => {
            signaturePad.clear();
            setErrorMessage("#signature", "", true);
        });
        break;
    case "TabBord":
    case "EditOperation":
        document.getElementById('debut').value = `${yyyy}-01-01`;
        document.getElementById('fin').value = `${yyyy}-12-31`;
        break;
}
$("#signature").click(function () {
    setErrorMessage("#signature", "", true);
})
$('.input_focus').keyup(function () {
    $(this).siblings('span.erreur').css('display', 'none');
})
$("#code").keyup(function () {
    this.value = this.value.toUpperCase();
})
$("#fermer").click(function () {
    document.getElementById('fullscreen_popup').style.display = "none";
    switch (pageName) {
        case "Enregistrement":
        case "Caisse":
            resetForm();
            break;
        case "TabBord":
        case "EditOperation":

            break;
    }
})
$("#tab_" + pageName + " tbody").on("click", "tr", function () {
    if (isEditing) return; // Désactiver si en mode édition
    $(this).toggleClass("selected").siblings(".selected").removeClass("selected");
    var nomTitre = "Editer ";
    switch (pageName) {
        case "Enregistrement":
            toggleForms("partieUnique");
            var caisse = $("#code1 option:selected").text();
            var sens = $("#code2 option:selected").text();
            nomTitre += ` ${sens} (${caisse})`;
            document.getElementById('signatureData').value = this.cells[4].innerHTML;
            const existingSignature = document.getElementById('signatureData');
            if (existingSignature && existingSignature.value) {
                signaturePad.fromDataURL(existingSignature.value);
            }
            $("#hiddenID").val(this.cells[0].innerHTML);
            document.getElementById('dateSaisie').value = afficherDateyyyyMMdd(this.cells[6].innerHTML);
            $("#montant").val(separateur_mil(this.cells[3].innerHTML));
            $("#description").val(separateur_mil(this.cells[2].innerHTML));

            document.getElementById('hiddenID').disabled = true;
            break;
        case "Caisse":
            toggleForms("partieUnique");
            nomTitre += " Caisse";
            $("#code").val(this.cells[0].innerHTML);
            $("#libelle").val(this.cells[1].innerHTML);
            document.getElementById('code').disabled = true;
            break;
        case "TabBord":
            toggleForms("partieUnique");
            formPopupTabBord(pageName);
            $("#caisse").empty(); // Vide le dropdown cible
            var IDcode = this.cells[1].innerHTML;
            $("#code").val(IDcode);
            nomTitre = "Pièce no " + IDcode;
            $("#caisse").empty(); // Vide d'abord la liste si nécessaire
            $("#tab_Caisse tr:gt(0)").each(function () {
                var inputVal = $(this).find("td:eq(0) input").val();
                var text = $(this).find("td:eq(3)").html();

                if (inputVal !== "Tous") {
                    $("#caisse").append(
                        $("<option>", {
                            value: inputVal,
                            text: text
                        })
                    );
                }
            });

            $("#caisse").val(this.cells[0].innerHTML).trigger('change');
            document.getElementById('dateSaisie').value = afficherDateyyyyMMdd(this.cells[2].innerHTML);
            var sens = this.cells[9].innerHTML;
            var montant = 0;
            if (sens == "S") {
                //cas S (sortie)
                montant = separateur_mil(this.cells[5].innerHTML);
                document.getElementById('SensDep').checked = true;
            } else {
                //case E (entree)
                montant = separateur_mil(this.cells[4].innerHTML);
                document.getElementById('SensRec').checked = true;
            }
            $("#montant").val(montant);
            $("#description").val(this.cells[3].innerHTML);
            $("#observation").val(this.cells[10].innerHTML);
            switch (this.cells[6].innerHTML) {
                case "N":
                    document.getElementById('non_valide').checked = true;
                    document.getElementById('Enregistrer').style.visibility = "visible";
                    document.getElementById('Supprimer').style.visibility = "visible";
                    break;
                case "V":
                    document.getElementById('_valide').checked = true;
                    document.getElementById('Enregistrer').style.visibility = "hidden";
                    document.getElementById('Supprimer').style.visibility = "hidden";
                    break;
                case "R":
                    document.getElementById('_refus').checked = true;
                    document.getElementById('Enregistrer').style.visibility = "visible";
                    document.getElementById('Supprimer').style.visibility = "visible";
                    break;
            }
            break;
    }
    $("#titleParam_").html(nomTitre);
    //document.getElementById('Supprimer').style.visibility = "visible";
})
$(".selectChoix").select2();
$("#code1").change(function () {
    switch (pageName) {
        case "Enregistrement":
            loadData(pageName);
            break;
    }
})
$("#code2").change(function () {
    loadData(pageName)
})

function parameter() {
    formVue(pageName);
}
var Ajout = function () {
    toggleForms("partieUnique");
    var caisse = $("#code1 option:selected").text();
    var sens = $("#code2 option:selected").text();
    var nomTitre = "";
    switch (pageName) {
        case "Enregistrement":
            nomTitre = `${sens} (${caisse})`;
            break;
        case "Caisse":
            nomTitre = `Ajout Caisse`;
            break;
    }
    $("#titleParam_").html(nomTitre);
    resetForm();
}
var reloadTabBord = function () {
    var isAllValid = true;
    switch (pageName) {
        case "TabBord":
            const dateDebut = $("#debutPeriode").val();
            const dateFin = $("#FinPeriode").val();
            if (dateDebut.trim() == '') {
                isAllValid = false;
                $("#debutPeriode").siblings('span.erreur').html('Champ obligatoire').css('display', 'block');
            } else {
                const endDateD = document.getElementById('debutPeriode').value;

                const yearD = endDateD.split('-')[0];
                // Vérifier si l'année a 4 caractères
                if (yearD.length === 4 && !isNaN(yearD)) {
                    $("#debutPeriode").siblings('span.erreur').css('display', 'none');
                } else {
                    isAllValid = false;
                    $("#debutPeriode").siblings('span.erroeur').css('display', 'block').html('Revoir l\'année.');
                }
            }
            if (dateFin.trim() == '') {
                isAllValid = false;
                $("#FinPeriode").siblings('span.erreur').html('Champ obligatoire').css('display', 'block');
            } else {
                $("#FinPeriode").siblings('span.erreur').css('display', 'none');
                const startDate = document.getElementById('debutPeriode').value;
                const endDate = document.getElementById('FinPeriode').value;
                const resultElement = document.getElementById('messageStruct');
                const start = new Date(startDate);
                const end = new Date(endDate);

                const yearCloture = endDate.split('-')[0];
                // Vérifier si l'année a 4 caractères
                if (yearCloture.length === 4 && !isNaN(yearCloture)) {
                    resultElement.textContent = '';
                    if (end < start) {
                        isAllValid = false;
                        resultElement.textContent = 'La date fin doit être supérieure ou égale à la date début.';
                    }
                } else {
                    isAllValid = false;
                    $("#FinPeriode").siblings('span.erreur').css('display', 'block').html('Revoir l\'année.');
                }
            }
            if (isAllValid) {
                loadData(pageName);
            }
            break;
    }
}
var Enregistrer = function () {
    var isAllValid = true;
    var codeID = null, description = null, caisse = null, dateSaisie = null, montant = null
    observation = null, sens = null, typeValid = null;


    switch (pageName) {
        case "Enregistrement":
            caisse = $("#code1").val();
            sens = $("#code2").val();
            dateSaisie = $("#dateSaisie").val();
            montant = $("#montant").val().replace(/\s+/g, "");
            codeID = $("#hiddenID").val();
            description = $("#description").val();
            if (dateSaisie.trim() == '') {
                isAllValid = false;
                setErrorMessage("#dateSaisie", "champ obligatoire", isAllValid);
            } else {
                const endDateD = document.getElementById('dateSaisie').value;

                const yearD = endDateD.split('-')[0];
                // Vérifier si l'année a 4 caractères
                if (yearD.length === 4 && !isNaN(yearD)) {
                    $("#dateSaisie").siblings('span.error').css('display', 'none');
                } else {
                    isAllValid = false;
                    setErrorMessage("#dateSaisie", "Revoir l\'année.", isAllValid);
                }
            }
            if (montant.trim() == '' || montant == 0) {
                isAllValid = false;
                setErrorMessage("#montant", "champ obligatoire", isAllValid);
            }
            if (description.trim() == '') {
                isAllValid = false;
                setErrorMessage("#description", "champ obligatoire", isAllValid);
            }
            if (!signaturePad.isEmpty()) {
                let dataUrl = signaturePad.toDataURL();
                document.getElementById("signatureData").value = dataUrl;
            } else {
                isAllValid = false;
                setErrorMessage("#signature", "Veuillez signer avant de valider !", isAllValid);
            }
            break;
        case "Caisse":
            codeID = $("#code").val();
            description = $("#libelle").val();
            if (codeID.trim() == '') {
                isAllValid = false;
                setErrorMessage("#code", "champ obligatoire", isAllValid);
            }
            if (description.trim() == '') {
                isAllValid = false;
                setErrorMessage("#libelle", "champ obligatoire", isAllValid);
            }
            break;
        case "TabBord":
            caisse = $("#caisse").val();
            dateSaisie = $("#dateSaisie").val();
            montant = $("#montant").val().replace(/\s+/g, "");
            codeID = $("#code").val();
            description = $("#description").val();
            observation = $("#observation").val();
            sens = $(".typeSens:checked").val();
            typeValid = $(".typeValid:checked").val();
            if (dateSaisie.trim() == '') {
                isAllValid = false;
                setErrorMessage("#dateSaisie", "champ obligatoire", isAllValid);
            } else {
                const endDateD = document.getElementById('dateSaisie').value;

                const yearD = endDateD.split('-')[0];
                // Vérifier si l'année a 4 caractères
                if (yearD.length === 4 && !isNaN(yearD)) {
                    $("#dateSaisie").siblings('span.error').css('display', 'none');
                } else {
                    isAllValid = false;
                    setErrorMessage("#dateSaisie", "Revoir l\'année.", isAllValid);
                }
            }
            if (montant.trim() == '' || montant == 0) {
                isAllValid = false;
                setErrorMessage("#montant", "champ obligatoire", isAllValid);
            }
            if (description.trim() == '') {
                isAllValid = false;
                setErrorMessage("#description", "champ obligatoire", isAllValid);
            }
            break;
    }
    if (isAllValid) {
        var codeSignature = $("#signatureData").val();
        var EtatCod = null;
        var EtatValid = "";
        var etat = true;
        switch (pageName) {
            case "Enregistrement":
                EtatCod = document.getElementById('hiddenID');
                EtatValid = "N";
                break;
            case "Caisse":
                EtatCod = document.getElementById('code');
                break;
            case "TabBord":
                EtatValid = typeValid;
                EtatCod = document.getElementById('code');
                break;
        }
        switch (EtatCod.disabled) {
            case true:
                etat = true;
                break;
            default:
                etat = false;
                break;
        }
        const objData = {
            code: codeID,
            niveau: pageName,
            caisse: caisse,
            dateSaisie: dateSaisie,
            montant: montant,
            Designation: description,
            Signature: codeSignature,
            sens: sens,
            valider: EtatValid,
            etat: etat,
            observation: observation,
            typeValid: typeValid,
        }
        $.ajax({
            url: "/CRUD/Add_EditParam",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(objData),
            success: function (data) {
                switch (data.statut) {
                    case true:
                        $('.alert_Param').removeClass("hide");
                        $('.alert_Param').addClass("show");
                        $('.alert_Param').addClass("showAlert");
                        $(".result_Param").html('<font style="color:#ce8500">' + data.message + '</font>');
                        setTimeout(function () {
                            $('.alert_Param').addClass("hide");
                            $('.alert_Param').removeClass("show");
                            loadData(pageName);
                            switch (pageName) {
                                case "TabBord":
                                    document.getElementById('fermerTab').click();
                                    break;
                                default:
                                    document.getElementById('fermer').click();
                                    break;
                            }
                        }, 1500);
                        break;
                    default:
                        switch (pageName) {
                            case "Caisse":
                                $("#code").siblings('span.erreur').html(data.message).css('display', 'block');
                                break;
                        }
                        break;
                }
            },

            error: function (error) {
                alert("Erreur lors de l'envoi des données.");
                console.error(error);
            }
        });
    }
}
var Valider = function () {
    var isAllValid = true;
    var dateDebut = $("#debut").val();
    var dateFin = $("#fin").val();
    var nbreCocher = $("#valueTotalQualCheck").val();
    var validation = $(".validation:checked").val();
    if (dateDebut.trim() == '') {
        isAllValid = false;
        $("#debut").siblings('span.erreur').html('Champ obligatoire').css('display', 'block');
    } else {
        const endDateD = document.getElementById('debut').value;

        const yearD = endDateD.split('-')[0];
        // Vérifier si l'année a 4 caractères
        if (yearD.length === 4 && !isNaN(yearD)) {
            $("#debut").siblings('span.erreur').css('display', 'none');
        } else {
            isAllValid = false;
            $("#debut").siblings('span.erroeur').css('display', 'block').html('Revoir l\'année.');
        }
    }
    if (dateFin.trim() == '') {
        isAllValid = false;
        $("#fin").siblings('span.erreur').html('Champ obligatoire').css('display', 'block');
    } else {
        $("#fin").siblings('span.erreur').css('display', 'none');
        const startDate = document.getElementById('debut').value;
        const endDate = document.getElementById('fin').value;
        const resultElement = document.getElementById('messageStruct');
        const start = new Date(startDate);
        const end = new Date(endDate);

        const yearCloture = endDate.split('-')[0];
        // Vérifier si l'année a 4 caractères
        if (yearCloture.length === 4 && !isNaN(yearCloture)) {
            resultElement.textContent = '';
            if (end < start) {
                isAllValid = false;
                resultElement.textContent = 'La date fin doit être supérieure ou égale à la date début.';
            }
        } else {
            isAllValid = false;
            $("#fin").siblings('span.erreur').css('display', 'block').html('Revoir l\'année.');
        }
    }
    if (document.getElementById('defaultCheck_Tous').checked == false && nbreCocher == 0) {
        isAllValid = false;
        document.getElementById('erreurCheck').textContent = "Veuillez cocher au moins";
    }
    compteurCheckBox();
    if (isAllValid) {
        
        var objData = {};
        var listOfCaisseAffect = new Array();
        switch (pageName) {
            case "TabBord":
                loadData(pageName);
                break;
            case "EditOperation":
                $("#tab_Caisse").find("tr:gt(0)").each(function () {
                    var OrderDetailCaisseAffect = {};
                    if ($(this).find('td:eq(1) input').is(':checked') == true) {
                        OrderDetailCaisseAffect.code = $(this).find('td:eq(0) input').val();
                        listOfCaisseAffect.push(OrderDetailCaisseAffect);
                    }
                })
                objData.listOfCaisseAffect = listOfCaisseAffect;
                objData.dateDebut = dateDebut;
                objData.dateFin = dateFin;
                objData.compteur = nbreCocher;
                objData.sens = validation;

                $.ajax({
                    async: true,
                    type: 'POST',
                    dataType: 'JSON',
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify(objData),
                    url: '/CRUD/SendExploitation',
                    success: function (data) {
                        switch (data.statut) {
                            case true:
                                toggleForms("partieSecond");
                                document.getElementById('titleParam_').textContent = "Opération caisse du " + afficherDateddMMyyyy(dateDebut) + " au " + afficherDateddMMyyyy(dateFin);
                                $('#tab_' + pageName).DataTable().destroy();
                                $("#tab_" + pageName + " tbody").empty();

                                for (var i = 0; i < data.donnee.length; i++) {
                                    var item = data.donnee[i];
                                    var FLAG = item.FLAG;
                                    var entree = item.entree;
                                    var sortie = item.sortie;
                                    var solde = item.solde;
                                    if (entree == "0") {
                                        entree = "";
                                    } 
                                    if (sortie == "0") {
                                        sortie = "";
                                    } 
                                    if (solde == "0") {
                                        solde = "";
                                    } 
                                    var couleur = '';

                                    switch (FLAG) {
                                        case "C":
                                            couleur = "#00ffff"; // cyan
                                            break;
                                        case "D":
                                            couleur = "#fefefe"; // presque blanc
                                            break;
                                        case "T":
                                            couleur = "#ffdab9"; // pêche clair
                                            break;
                                        case "G":
                                            couleur = "#808000"; // olive
                                            break;
                                        default:
                                            couleur = "#ffffff"; // blanc par défaut
                                            break;
                                    }

                                    var list = `
                                                    <tr style="background-color: ${couleur}">
                                                        <td>${item.caisse}</td>
                                                        <td>${item.date1}</td>
                                                        <td>${item.Designation}</td>
                                                        <td style="text-align:right">${separateur_mil(entree)}</td>
                                                        <td style="text-align:right">${separateur_mil(sortie)}</td>
                                                        <td style="text-align:right">${separateur_mil(solde)}</td>
                                                    </tr>                                                
                                                `;
                                    $("#tab_" + pageName + " tbody").append(list);
                                }

                                break;
                            default:
                                document.getElementById('errorEditOper').textContent = data.message;
                                setTimeout(function () {
                                    document.getElementById('errorEditOper').textContent = "";
                                },2500)
                                break;
                        }
                    },
                    error: function (xhr, status, error) {
                        console.log('La réponse a échoué : ' + error);
                    }
                })
                break;
        }
    }
}
var Supprimer = function () {
    toggleForms("partieDelete");
    var nomTitre = "Suppression ";
    var nomTitreDel = "Voulez-vous supprimer ";
    var caisse = $("#code1 option:selected").text();
    var sens = $("#code2 option:selected").text();
    var code = null;
    switch (pageName) {
        case "Enregistrement":
            code = $("#hiddenID").val();
            nomTitre += `${sens} (${caisse})`;
            nomTitreDel += 'Code <strong><u>' + code + '</u></strong>';
            break;
        case "Caisse":
            code = $("#code").val();
            nomTitre += `Caisse ${code}`;
            nomTitreDel += 'Code <strong><u>' + code + '</u></strong>';
            break;
        case "TabBord":
            code = $("#code").val();
            nomTitre += `Pièce no ${code}`;
            nomTitreDel += 'la pièce no <strong><u>' + code + '</u></strong>';
            break;
    }
    $("#titreDel").html(nomTitre);
    $("#messageDel").html(nomTitreDel);
}
var validerDel = function () {
    var code = null;
    switch (pageName) {
        case "Enregistrement":
            code = $("#hiddenID").val();
            break;
        case "Caisse":
        case "TabBord":
            code = $("#code").val();
            break;
    }
    const objData = {
        code: code,
        niveau: pageName
    }
    $.ajax({
        url: "/CRUD/DelParam",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(objData),
        success: function (data) {
            switch (data.statut) {
                case true:
                    var table = document.getElementById('tab_' + pageName);
                    closeDel();
                    switch (pageName) {
                        case "TabBord":
                            document.getElementById('fermerTab').click();
                            for (var i = 1; i < table.rows.length; i++) {
                                var item = table.rows[i];
                                if (item.cells[1].innerHTML == code) {
                                    table.deleteRow(i); //Supprimer la ligne correspondante
                                    break; //Sort de la boucle apres supppression
                                }
                            }
                            break;
                        default:
                            for (var i = 1; i < table.rows.length; i++) {
                                var item = table.rows[i];
                                if (item.cells[0].innerHTML == code) {
                                    table.deleteRow(i); //Supprimer la ligne correspondante
                                    break; //Sort de la boucle apres supppression
                                }
                            }
                            document.getElementById('fermer').click();
                            break;
                    }
                    switch (pageName) {
                        case "Enregistrement":
                            var total = 0;
                            total = getColumnSum("tab_" + pageName, 3);
                            document.getElementById('sumDep').textContent = separateur_mil(total);
                            break;
                        case "TabBord":
                            var totalEntree = 0, totalSortie = 0;
                            totalEntree = getColumnSum("tab_" + pageName, 4);
                            document.getElementById('sumEntree').textContent = separateur_mil(totalEntree);

                            totalSortie = getColumnSum("tab_" + pageName, 5);
                            document.getElementById('sumSortie').textContent = separateur_mil(totalSortie);
                            break;
                    }
                    break;
                case false:
                    $("#errorCodif").html(data.message);
                    break;
            }
        },

        error: function (error) {
            alert("Erreur lors de l'envoi des données.");
            console.error(error);
        }
    });
}
var closeDel = function () {
    toggleForms("partieUnique");
    $("#errorCodif").html('');
}
function formVue(pageName) {
    let formHTML = "";
    switch (pageName) {
        case "Enregistrement":
        case "Caisse":
            formHTML = `
                        <div class="row">
                            <div class="col-md-12" style="padding-bottom:10px">
                                <div class="float-start" style="width:75%">
                                    <div id="partieSite">
                                    </div>
                                </div>
                                <div class="float-end">
                                    <button class="btn btn-sm btn-primary" id="Ajout" onclick="Ajout()"> <i class="fas fa-plus mr-2"></i>Ajouter</button>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-2 justify-content-center" style="text-align:center">
                            <div class="col-md-12">
                                <h4 id='messageStruct' style='color:red'></h4>
                            </div>
                        </div>
                        <div id="niveauFormTableau"></div>
                        `;
            break;
        case "TabBord":
        case "EditOperation":
            formHTML = `
                        <div class="row mb-2 justify-content-center" style="text-align:center">
                            <div class="col-md-12">
                                <h4 id='messageStruct' style='color:red'></h4>
                            </div>
                        </div>
                        <div id="niveauFormTableau"></div>
                        `;
            break;
    }
    $("#formParam").append(formHTML);
    formTableTOP(pageName);
    formTableau(pageName);
    formPopup(pageName);
    formPopupPartieSaisie(pageName);
    formDel();
    loadData(pageName);
}
function formTableTOP(pageName) {
    let formHTML = "";
    switch (pageName) {
        case "Enregistrement":
            formHTML = `
                    <div class="row">
                        <div class="col-md-2">
                            <label for="code1" id='labelCode1'>Caisse</label>
                        </div>
                        <div class="col-md-4">
                            <select id="code1" style="width:100%;z-index:2500px" class="selectChoix SurPageDrop">
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label for="code2" id='labelCode2'>Sens</label>
                        </div>
                        <div class="col-md-4">
                            <select id="code2" style="width:100%" class="selectChoix SurPageDrop">
                                <option value="E">Entrée</option>
                                <option value="S">Sortie</option>
                            </select>
                        </div>
                    </div>
                `;
            break;
        
    }
    $("#partieSite").append(formHTML);
}
function formTableau(pageName) {
    let formHTML = "";
    switch (pageName) {
        case "Enregistrement":
            formHTML = `
                            <div class="row">
                                <div class="col-sm-12">
                                    <div class="card">
                                        <div class="card-body">
                                            <div class="dt-responsive table-responsive">
                                                <table id="tab_${pageName}" class="tabList" style="width:100%">
                                                    <thead>
                                                        <tr>
                                                            <th hidden>CODE</th>
                                                            <th></th>
                                                            <th>Description</th>
                                                            <th>Montant</th>
                                                            <th hidden>Signature</th>
                                                            <th hidden>etat</th>
                                                            <th hidden>dateSaisie</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody></tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <th colspan='2' style="text-align:center">TOTAL</th>
                                                            <th style='text-align:right'><span id="sumDep" style="font-weight:bold;color:#fff"></span></th>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
            break;
        case "Caisse":
            formHTML = `
                            <div class="row">
                                <div class="col-sm-12">
                                    <div class="card">
                                        <div class="card-body">
                                            <div class="dt-responsive table-responsive">
                                                <table id="tab_${pageName}" class="tabList" style="width:100%">
                                                    <thead>
                                                        <tr>
                                                            <th>CODE</th>
                                                            <th>Libelle</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody></tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
            break;
        
        case "EditOperation":
            formHTML = `
                        <div class="row">
                                    <div class="col-md-12">
                                        <div class="row mb-2">
                                            <div class="col-md-3">
                                                <label for="debut">Période du :</label>
                                            </div>
                                            <div class="col-md-3">
                                                <input type="date" name="debut" value="" id="debut" class="input_focus" />
                                            </div>
                                            <div class="col-md-2">
                                                <label for="fin">Au </label>
                                            </div>
                                            <div class="col-md-3">
                                                <input type="date" name="fin" value="" id="fin" class="input_focus" />
                                            </div>
                                        </div>
                                        <div class="row mb-2 justify-content-center" style="text-align:center">
                                            <div class="col-md-12">
                                                <span id="messageStruct" style="color:red"></span>
                                            </div>
                                        </div>
                                        <div class="row justify-content-center" style="text-align:center">
                                            <div class="col-md-8" style="padding:2px;background-color:#808080;">
                                                <h5 style="color:#fff;letter-spacing:4px">Caisses</h5>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-4">
                                                <input type="hidden" disabled name="valueTotalQualCheck" value="0" id="valueTotalQualCheck" class="form-control" style="background-color:#000;color:#fff" />
                                            </div>
                                        </div>
                                        <div class="row justify-content-center" style="text-align:center">
                                            <div class="col-md-12">
                                                <span id="erreurCheck" style="color:red"></span>
                                            </div>
                                        </div>
                                        <div class="row justify-content-center" style="text-align:center">
                                            <div class="col-md-6">
                                                <div class="Alltab_">
                                                    <table class="tabEdit" id="tab_Caisse">
                                                        <thead hidden>
                                                            <tr>
                                                                <td>CODE</td>
                                                                <td>Etat</td>
                                                                <td>Libelle</td>
                                                            </tr>
                                                        </thead>

                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row" style="padding-top:10px">
                                            <div class="col-md-10" style="padding:10px;border:1px solid #cec8c8;border-radius:5px">
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <h5><u>Validation</u></h5>
                                                    </div>
                                                </div>
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <div class="form-check form-check-inline">
                                                            <input class="form-check-input validation" type="radio" checked name="validation" id="valid_1" value="N">
                                                            <label class="form-check-label" for="valid_1">Non Validé</label>
                                                        </div>
                                                        <div class="form-check form-check-inline">
                                                            <input class="form-check-input validation" type="radio" name="validation" id="valid_2" value="V">
                                                            <label class="form-check-label" for="valid_2">Validé</label>
                                                        </div>
                                                        <div class="form-check form-check-inline">
                                                            <input class="form-check-input validation" type="radio" name="validation" id="valid_3" value="R">
                                                            <label class="form-check-label" for="valid_3">Refus</label>
                                                        </div>
                                                        <div class="form-check form-check-inline">
                                                            <input class="form-check-input validation" type="radio" name="validation" id="valid_4" value="T">
                                                            <label class="form-check-label" for="valid_4">Tous</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row justify-content-center" style="text-align:center"> 
                                            <div class="col-md-12"> 
                                                <span id="errorEditOper" style="color:red"></span> 
                                            </div> 
                                        </div> 
                                        <div class="row justify-content-center" style="text-align:center;padding-top:15px">
                                            <div class="col-md-12">
                                                <button class="btn btn-sm btn-success" id="valider" onclick="Valider()">Valider</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        `;
            break;
        case "TabBord":
            formHTML = `
                        <div class="row">
                                    <div class="col-md-12">
                                        <div class="row mb-2">
                                            <div class="col-md-3">
                                                <label for="debut">Période du :</label>
                                            </div>
                                            <div class="col-md-3">
                                                <input type="date" name="debut" value="" id="debut" class="input_focus" />
                                            </div>
                                            <div class="col-md-2">
                                                <label for="fin">Au </label>
                                            </div>
                                            <div class="col-md-3">
                                                <input type="date" name="fin" value="" id="fin" class="input_focus" />
                                            </div>
                                        </div>
                                        <div class="row mb-2 justify-content-center" style="text-align:center">
                                            <div class="col-md-12">
                                                <span id="messageStruct" style="color:red"></span>
                                            </div>
                                        </div>
                                        <div class="row justify-content-center" style="text-align:center">
                                            <div class="col-md-8" style="padding:2px;background-color:#808080;">
                                                <h5 style="color:#fff;letter-spacing:4px">Caisses</h5>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-4">
                                                <input type="hidden" disabled name="valueTotalQualCheck" value="" id="valueTotalQualCheck" class="form-control" style="background-color:#000;color:#fff" />
                                            </div>
                                        </div>
                                        <div class="row justify-content-center" style="text-align:center">
                                            <div class="col-md-12">
                                                <span id="erreurCheck" style="color:red"></span>
                                            </div>
                                        </div>
                                        <div class="row justify-content-center" style="text-align:center">
                                            <div class="col-md-6">
                                                <div class="Alltab_">
                                                    <table class="tabEdit" id="tab_Caisse">
                                                        <thead hidden>
                                                            <tr>
                                                                <td>CODE</td>
                                                                <td>Etat</td>
                                                                <td>Libelle</td>
                                                                <td hidden>Libelle ok</td>
                                                            </tr>
                                                        </thead>

                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row justify-content-center" style="text-align:center;padding-top:15px">
                                            <div class="col-md-12">
                                                <button class="btn btn-sm btn-success" id="valider" onclick="Valider()">Valider</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        `;
            break;
    }
    $("#niveauFormTableau").append(formHTML);
}
function formPopup(pageName) {
    var formHtml = "";
    switch (pageName) {
        case "Enregistrement":
        case "Caisse":
        //case "TabBord":
            formHtml = `
                    <div class="row justify-content-center" style="padding-top:4%">
                        <div class="col-md-8 pageView">
                            <div class="row">
                                <div class="col-md-12" style="padding-bottom: 10px;border-bottom:1px solid #bdb8b8">
                                    <div class="float-start">
                                        <strong id="titleParam_"></strong>
                                    </div>
                                    <div class="float-end">
                                        <button class="btn btn-sm  btn-danger me-1 mb-1" id="fermer">&times;Fermer</button>
                                    </div>
                                </div>
                            </div>
                            <div class="row justify-content-center" style="text-align:center">
                                <div class="col-md-12">
                                    <div class="alert_Param hide">
                                        <span class="fas fa-exclamation-circle"></span>
                                        <span class="result_Param"></span>
                                    </div>
                                </div>
                            </div>
                            <div class="form_padd">
                                <div id="zoneSaisie"></div>
                                <div class="row justify-content-end" style="text-align:right;padding-top:15px">
                                    <div class="col-md-12">
                                        <button class="btn btn-sm btn-success me-1 mb-1" id="Enregistrer" onclick="Enregistrer()">Enregistrer</button>
                                        <button class="btn btn-sm btn-danger me-1 mb-1" id="Supprimer" onclick="Supprimer()">Supprimer</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            $("#partieUnique").append(formHtml);
            break;
        case "TabBord":
            formHtml = `
                           <div class="row justify-content-center" style="padding-top:4%">
                                <div class="col-md-11 pageView">
                                    <div class="row">
                                        <div class="col-md-12" style="padding-bottom: 10px;border-bottom:1px solid #bdb8b8">
                                            <div class="float-start">
                                                <strong id="titleParam_"></strong>
                                            </div>
                                            <div class="float-end">
                                                <button class="btn btn-sm  btn-danger me-1 mb-1" id="fermer">&times;Fermer</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-sm-12">
                                            <div class="card">
                                                <div class="card-body">
                                                    <div class="dt-responsive table-responsive">
                                                        <table id="tab_${pageName}" class="tabList" style="width:100%">
                                                            <thead>
                                                                <tr>
                                                                    <th>CAISSE</th>
                                                                    <th>CODE</th>
                                                                    <th>Date</th>
                                                                    <th>Désignation</th>
                                                                    <th>Entrée</th>
                                                                    <th>Sortie</th>
                                                                    <th>Statut</th>
                                                                    <th>Saisi par</th>
                                                                    <th>Date Saisie</th>
                                                                    <th hidden>sens</th>
                                                                    <th hidden>observation</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody></tbody>
                                                            <tfoot>
                                                                <tr>
                                                                    <th colspan='4' style="text-align:center">Total</th>
                                                                    <th style='text-align:right'><span id="sumEntree" style="font-weight:bold;color:#fff"></span></th>
                                                                    <th style='text-align:right'><span id="sumSortie" style="font-weight:bold;color:#fff"></span></th>
                                                                    <th colspan='3'></th>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> 
                        `;
            $("#partieSecond").append(formHtml);
            break;
        case "EditOperation":
            formHtml = `
                           <div class="row justify-content-center" style="padding-top:4%">
                                <div class="col-md-11 pageView">
                                    <div class="row">
                                        <div class="col-md-12" style="padding-bottom: 10px;border-bottom:1px solid #bdb8b8">
                                            <div class="float-start">
                                                <strong id="titleParam_"></strong>
                                            </div>
                                            <div class="float-end">
                                                <button class="btn btn-sm  btn-danger me-1 mb-1" id="fermer">&times;Fermer</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-sm-12">
                                            <div class="card">
                                                <div class="card-body">
                                                    <div class="dt-responsive table-responsive" style="max-height: 250px; overflow-y: auto">
                                                        <table id="tab_${pageName}" class="tabList" style="width:100%">
                                                            <thead class="sticky-top bg-white">
                                                                <tr>
                                                                    <th>CAISSE</th>
                                                                    <th>Date</th>
                                                                    <th>Désignation</th>
                                                                    <th>Entrée</th>
                                                                    <th>Sortie</th>
                                                                    <th>Solde</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody></tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row justify-content-end" style="text-align:right">
                                        <div class="col-md-12">
                                            <button class="btn btn-sm btn-success" onclick="ImprimerEdit()">
                                                <i class="fa fa-print">Imprimer</i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div> 
                        `;
            $("#partieSecond").append(formHtml);
            break;
    }
}
function formPopupPartieSaisie(pageName) {
    let formHTML = "";
    switch (pageName) {
        case "Enregistrement":
            formHTML = `
                        <div class="row">
                            <div class="col-md-12">
                                <div class="row">
                                    <div class="col-md-3">
                                        <label for="dateSaisie">Date</label>
                                    </div>
                                    <div class="col-md-6">
                                        <input type="date" name="dateSaisie" value="" id="dateSaisie" class="input_focus"/>
                                        <span class="erreur"></span>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-3">
                                        <label for="montant">Montant</label>
                                    </div>
                                    <div class="col-md-9">
                                        <input type="text" name="montant" value="" maxlength="12" id="montant" class="input_focus"/>
                                        <span class="erreur"></span>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-3">
                                        <label for="description">Description</label>
                                    </div>
                                    <div class="col-md-9">
                                        <input type="text" name="description" value="" maxlength="250" id="description" class="input_focus"/>
                                        <span class="erreur"></span>
                                    </div>
                                </div>
                                <div class="row" style="padding-top:10px;">
                                    <div class="col-md-3">
                                        <label for="signature">Signature</label>
                                    </div>
                                    <div class="col-md-7">
                                        <canvas id="signature" class="input_focus" style="border:1px solid #c8c6c6; width: 350px; height: 150px;"></canvas>
                                        <span class="erreur"></span>
                                    </div>
                                    <div class="col-md-2">
                                        <button class="btn btn-sm btn-danger" id="clear">Effacer</button>
                                    </div>
                                </div>
                                <input type="hidden" name="hiddenID" value="" id="hiddenID"/>
                                <input type="hidden" id="signatureData" name="signatureBase64" />
                            </div>
                        </div>
                        `;
            break;
        case "Caisse":
            formHTML = `
                        <div class="row">
                            <div class="col-md-3">
                                <label for="code">CODE</label>
                            </div>
                            <div class="col-md-4">
                                <input type="text" name="code" value="" id="code" maxlength="2" class="input_focus"/>
                                <span class="erreur"></span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3">
                                <label for="libelle">Libellé</label>
                            </div>
                            <div class="col-md-6">
                                <input type="text" name="libelle" value="" id="libelle" maxlength="250" class="input_focus"/>
                                <span class="erreur"></span>
                            </div>
                        </div>
                        `;
            break;
        
    }
    $("#zoneSaisie").append(formHTML);
    switch (pageName) {
        case "Enregistrement":
        //case "TabBord":
            var montant = document.getElementById('montant');
            formatChiffreInput(montant);
            var VueCheck = "";
            switch (groupeUs) {
                case "SAISIE":
                    VueCheck = `
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input typeValid" type="radio" name="validation_" id="non_valide" value="N">
                                            <label class="form-check-label" for="non_valide">Non validé</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input typeValid" type="radio" name="validation_" id="_valide" value="V">
                                            <label class="form-check-label" for="_valide">Validé</label>
                                        </div>
                                    </div>
                                </div>
                                `;
                    break;
                default:
                    VueCheck = `
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input typeValid" type="radio" name="validation_" id="non_valide" value="N">
                                            <label class="form-check-label" for="non_valide">Non validé</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input typeValid" type="radio" name="validation_" id="_valide" value="V">
                                            <label class="form-check-label" for="_valide">Validé</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input typeValid" type="radio" name="validation_" id="_refus" value="R">
                                            <label class="form-check-label" for="_refus">Refus</label>
                                        </div>
                                    </div>
                                </div>
                                `;
                    break;
            }
            $("#userVue").append(VueCheck);
            break;
    }
}
function formPopupTabBord(pageName) {
    let formHTML = "";
    switch (pageName) {
        case "TabBord":
            formHTML = `
                        <div class="row justify-content-center" style="padding-top:4%">
                            <div class="col-md-8 pageView">
                                <div class="row">
                                    <div class="col-md-12" style="padding-bottom: 10px;border-bottom:1px solid #bdb8b8">
                                        <div class="float-start">
                                            <strong id="titleParam_"></strong>
                                        </div>
                                        <div class="float-end">
                                            <button class="btn btn-sm  btn-danger me-1 mb-1" id="fermerTab">&times;Fermer</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="row justify-content-center" style="text-align:center">
                                    <div class="col-md-12">
                                        <div class="alert_Param hide">
                                            <span class="fas fa-exclamation-circle"></span>
                                            <span class="result_Param"></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="form_padd">
                                    <div id="zoneSaisie">
                                        <div class="row" style="padding-top:10px">
                                            <div class="col-md-3">
                                                <input type="hidden" name="code" disabled value="" id="code" class="input_focus" />
                                            </div>
                                        </div>
                                        <div class="row" style="padding-top:10px">
                                            <div class="col-md-3">
                                                <label for="caisse">Caisses</label>
                                            </div>
                                            <div class="col-md-6">
                                                <select id="caisse" style="width:100%" class="selectChoix">
                                                </select>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-12">
                                                <div class="row">
                                                    <div class="col-md-3">
                                                        <label for="dateSaisie">Date</label>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <input type="date" name="dateSaisie" value="" id="dateSaisie" class="input_focus" />
                                                        <span class="erreur"></span>
                                                    </div>
                                                </div>
                                                <div class="row">
                                                    <div class="col-md-3">
                                                        <label for="montant">Montant</label>
                                                    </div>
                                                    <div class="col-md-9">
                                                        <input type="text" name="montant" value="" maxlength="12" id="montant" class="input_focus" />
                                                        <span class="erreur"></span>
                                                    </div>
                                                </div>
                                                <div class="row">
                                                    <div class="col-md-3">
                                                        <label for="description">Description</label>
                                                    </div>
                                                    <div class="col-md-9">
                                                        <input type="text" name="description" value="" maxlength="250" id="description" class="input_focus" />
                                                        <span class="erreur"></span>
                                                    </div>
                                                </div>
                                                <div class="row" style="padding-top:10px">
                                                    <div class="col-md-5" style="border:1px solid #ccc0c0">
                                                        <div class="row">
                                                            <div class="col-md-12">
                                                                <h6>Sens</h6>
                                                            </div>
                                                        </div>
                                                        <div class="row">
                                                            <div class="col-md-12">
                                                                <div class="form-check form-check-inline">
                                                                    <input class="form-check-input typeSens" type="radio" name="sens_" id="SensDep" value="S">
                                                                    <label class="form-check-label" for="SensDep">Dépense</label>
                                                                </div>
                                                                <div class="form-check form-check-inline">
                                                                    <input class="form-check-input typeSens" type="radio" name="sens_" id="SensRec" value="E">
                                                                    <label class="form-check-label" for="SensRec">Recette</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-1">

                                                    </div>
                                                    <div class="col-md-5" style="border:1px solid #ccc0c0">
                                                        <div class="row">
                                                            <div class="col-md-12">
                                                                <h6>Validation</h6>
                                                            </div>
                                                        </div>
                                                        <div id="userVue">
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="row" style="padding-top:10px">
                                                    <div class="col-md-2">
                                                        <label for="observation">Observation</label>
                                                    </div>
                                                    <div class="col-md-10">
                                                        <input type="text" name="observation" value="" id="observation" maxlength="250" class="input_focus" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row justify-content-end" style="text-align:right;padding-top:15px">
                                        <div class="col-md-12">
                                            <button class="btn btn-sm btn-success me-1 mb-1" id="Enregistrer" onclick="Enregistrer()">Enregistrer</button>
                                            <button class="btn btn-sm btn-danger me-1 mb-1" id="Supprimer" onclick="Supprimer()">Supprimer</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
            break;
    }
    $("#partieUnique").append(formHTML);
    switch (pageName) {
        case "TabBord":
            var montant = document.getElementById('montant');
            formatChiffreInput(montant);
            var VueCheck = "";
            switch (groupeUs) {
                case "SAISIE":
                    VueCheck = `
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input typeValid" type="radio" name="validation_" id="non_valide" value="N">
                                            <label class="form-check-label" for="non_valide">Non validé</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input typeValid" type="radio" name="validation_" id="_valide" value="V">
                                            <label class="form-check-label" for="_valide">Validé</label>
                                        </div>
                                    </div>
                                </div>
                                `;
                    break;
                default:
                    VueCheck = `
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input typeValid" type="radio" name="validation_" id="non_valide" value="N">
                                            <label class="form-check-label" for="non_valide">Non validé</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input typeValid" type="radio" name="validation_" id="_valide" value="V">
                                            <label class="form-check-label" for="_valide">Validé</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input typeValid" type="radio" name="validation_" id="_refus" value="R">
                                            <label class="form-check-label" for="_refus">Refus</label>
                                        </div>
                                    </div>
                                </div>
                                `;
                    break;
            }
            $("#userVue").append(VueCheck);
            break;
    }

    $("#fermerTab").click(function () {
        switch (pageName) {
            case "TabBord":
                toggleForms("partieSecond");
                $("#partieUnique").empty();
                break;
        }
    })
    $("#caisse").select2();
}
function formDel() {
    let container = document.getElementById("partieDelete");
    container.innerHTML = "";
    let formHTML = `
            <div class="row justify-content-center" style="padding-top:12%">
                <div class="col-md-4 pageView">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="float-start">
                                <strong id="titreDel"></strong>
                            </div>
                            <div class="float-end">
                                <button class="btn btn-sm btn-danger closeDel" onclick="closeDel()">&times;</button>
                            </div>
                        </div>
                    </div><hr />
                    <div class="row justify-content-center" style="text-align:center;padding-top:20px;padding-bottom:20px">
                        <div class="col-md-12">
                            <img src="../../images/question.png" style="width:20px" /><span id="messageDel"></span>
                        </div>
                    </div>
                    <div class="row justify-content-center" style="text-align:center;padding-top:8px;padding-bottom:8px">
                        <div>
                            <span id="errorCodif" style="color:red"></span>
                        </div>
                    </div>
                    <hr />
                    <div class="row justify-content-end" style="text-align:right">
                        <div class="col-md-12">
                            <button class="btn btn-sm btn-success" onclick="validerDel()">Oui</button>
                            <button class="btn btn-sm btn-danger closeDel" onclick="closeDel()">Non</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    container.insertAdjacentHTML("beforeend", formHTML);
}

function isValidDate(dateStr) {
    // Format attendu : YYYY-MM-DD (HTML5 input type="date")
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;

    const dateObj = new Date(dateStr);
    const year = dateObj.getFullYear();

    // L’année doit avoir 4 chiffres entre 1900 et 2100 par exemple
    return year >= 1900 && year <= 2100;
}
function setTodayToDateSaisie(dateInput) {
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Mois de 01 à 12
        const dd = String(today.getDate()).padStart(2, '0');      // Jour de 01 à 31

        const formattedDate = `${yyyy}-${mm}-${dd}`;
        dateInput.value = formattedDate;
    }
}
function setLastToDateSaisie(dateInput) {
    if (dateInput) {
        const currentYear = new Date().getFullYear();
        const formattedDate = `${currentYear}-12-31`; // Dernier jour de l’année
        dateInput.value = formattedDate;
    }
}

function afficherDateyyyyMMdd(date) {
    const [day, month, year] = date.split("/");
    const formatDate = `${year}-${month}-${day}`;
    return formatDate;
}
function afficherDateddMMyyyy(date) {
    const today = new Date(date);
    const jour = String(today.getDate()).padStart(2, '0'); // Jour sur 2 chiffres
    const mois = String(today.getMonth() + 1).padStart(2, '0'); // Mois (0-indexé, donc +1)
    const annee = today.getFullYear(); // Année

    // Format jj/MM/yyyy
    const dateFormattee = `${jour}/${mois}/${annee}`;

    return dateFormattee;
}
function toggleForms(showId) {
    // Liste des IDs des formulaires
    let forms = ["partieUnique", "partieDelete", "partieSecond"];
    document.getElementById('fullscreen_popup').style.display = "block";
    forms.forEach(id => {
        let elem = document.getElementById(id);
        if (elem) {
            if (id === showId) {
                elem.classList.add("active");
                elem.classList.remove("hidden");
            } else {
                elem.classList.remove("active");
                elem.classList.add("hidden");
            }
        }
    });
}
function resetForm() {
    $('.input_focus').siblings('span.erreur').css('display', 'none');
    switch (pageName) {
        case "Enregistrement":
            $(".input_focus").val('');
            signaturePad.clear();
            $("#signatureData").val('');
            $("#hiddenID").val('');
            document.getElementById('hiddenID').disabled = false;
            var dateSaisie = document.getElementById("dateSaisie");
            setTodayToDateSaisie(dateSaisie);
            break;
        case "Caisse":
            $(".input_focus").val('');
            $("#code").val('');
            $("#libelle").val('');
            document.getElementById('code').disabled = false;
            break;
        case "TabBord":
            toggleForms("partieSecond");
            break;
    }
    document.getElementById('Supprimer').style.visibility = "hidden";
}

function setErrorMessage(selector, message, isValid) {
    if (!isValid) {
        $(selector).siblings('span.erreur').html(message).css('display', 'block');
    } else {
        $(selector).siblings('span.erreur').css('display', 'none');
    }
}

// Fonction pour formater les entrées alphanumériques seulement number
function formatChiffreInput(input) {
    input.addEventListener('keydown', function (event) {
        const key = event.key;
        const isNumber = /^[0-9]$/.test(key);
        const isAllowedKey = (
            isNumber ||
            key === 'Backspace' ||
            key === 'Delete' ||
            key === 'ArrowLeft' ||
            key === 'ArrowRight' ||
            key === 'ArrowUp' ||
            key === 'ArrowDown' ||
            key === 'Tab'
        );

        if (!isAllowedKey) {
            event.preventDefault();
        }
    });
    // Ajoute les séparateurs de milliers lors de la saisie
    input.addEventListener('input', function (event) {
        let value = input.value.replace(/\s/g, ''); // Enlève les espaces existants
        if (!isNaN(value)) {
            input.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        }
    });
}
function loadData(pageName) {
    var code1 = null, sens = null, date1 = null, date2 = null, nbreCocher = null;
    var listOfCaisseAffect = new Array();
    switch (pageName) {
        case "Enregistrement":
            code1 = $("#code1").val();
            sens = $("#code2").val();
            break;
        case "TabBord":
            date1 = $("#debut").val();
            date2 = $("#fin").val();
            $("#tab_Caisse").find("tr:gt(0)").each(function () {
                var OrderDetailCaisseAffect = {};
                if ($(this).find('td:eq(1) input').is(':checked') == true) {
                    OrderDetailCaisseAffect.code = $(this).find('td:eq(0) input').val();
                    listOfCaisseAffect.push(OrderDetailCaisseAffect);
                }
            })
            nbreCocher = $("#valueTotalQualCheck").val();
            break;
    }
    var objData = {};

    objData.page = pageName;
    objData.code = code1;
    objData.sens = sens;
    objData.date1 = date1;
    objData.date2 = date2;
    objData.compteur = nbreCocher;
    objData.listOfCaisseAffect = listOfCaisseAffect;
    $.ajax({
        async: true,
        type: 'POST',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(objData),
        url: "/CRUD/GetDataParam",
        success: function (data) {
            reportData(data);
        }
    })
}
function reportData(data) {
    switch (pageName) {
        case "Enregistrement":
            if (data.listCaisse.length == 0) {
                document.getElementById('Ajout').disabled = true;
            } else {
                document.getElementById('Ajout').disabled = false;
            }
            break;
        case "EditOperation":
        case "TabBord":
            const table = document.querySelector("#tab_Caisse");
            
            if (table && table.rows.length == 1) {
                var listCaisse = $("#tab_Caisse");
                listCaisse.empty(); // Nettoie le tableau avant ajout

                // ➕ Ajout de la ligne "Tous" en premier
                var ligneTous = `
                <tr>
                    <td hidden>
                        <input type='text' name='name' value="Tous" />
                    </td>
                    <td>
                        <div class='form-check'>
                            <input class='form-check-input cursorPointer' type='checkbox' checked name='' value='' id='defaultCheck_Tous'>
                        </div>
                    </td>
                    <td style="text-align:left">
                        <div class='form-check'>
                            <label class='form-check-label cursorPointer' for='defaultCheck_Tous'>
                                Tous
                            </label>
                        </div>
                    </td>
                </tr>
            `;
                listCaisse.append(ligneTous);

                // 🔁 Ajout des autres caisses
                for (var i = 0; i < data.listCaisse.length; i++) {
                    var item = data.listCaisse[i];
                    var list = `
                    <tr>
                        <td hidden>
                            <input type='text' name='name' value="${item.code}" />
                        </td>
                        <td>
                            <div class='form-check'>
                                <input class='form-check-input cursorPointer' type='checkbox' name='check' value='' id='defaultCheck_${item.code}'>
                            </div>
                        </td>
                        <td style="text-align:left">
                            <div class='form-check cursorPointer'>
                                <label class='form-check-label' for='defaultCheck_${item.code}'>
                                    ${item.libelle}
                                </label>
                            </div>
                        </td>
                        <td hidden>${item.libelle}</td>
                    </tr>
                `;
                    listCaisse.append(list);
                }
            }
            break;
    }
    if ($("#code1").val() == "" || $("#code1").val() == null) {
        $('#code1').empty();
        //switch (pageName) {
        //    case "TabBord":
        //        $("#code1").append("<option value='Tout'>Tout</option>");
        //        break;
        //}
        $.each(data.listCaisse, function (index, row) {
            $("#code1").append("<option value='" + row.code + "'>" + row.libelle + "</option>");
        })
    } 
    DataTable(pageName, data);
}
function DataTable(code, data) {
    if ($.fn.DataTable.isDataTable('#tab_' + code)) {
        $('#tab_' + code).DataTable().destroy();
        $("#tab_" + code + " tbody").empty();
    }
    let list = "";
    if (data.listData.length == 0) {
        switch (pageName) {
            case "Enregistrement":
                document.getElementById('sumDep').textContent = "0";
                isEditing = true;
                break;
        }
    } else {
        isEditing = false;
        data.listData.forEach(item => {
            switch (code) {
                case "Enregistrement":
                    list = `<tr>
                           <td hidden>${item.code}</td>
                           <td style='text-align:right'>${item.rowIndex}</td>
                           <td>${item.Designation}</td>
                           <td style='text-align:right'>${separateur_mil(item.montant)}</td>
                           <td hidden>${item.Signature}</td>
                           <td hidden>${item.valider}</td>
                           <td hidden>${item.dateSaisie}</td>
                        </tr>`;
                    break;
                case "Caisse":
                    list = `<tr>
                                <td>${item.code}</td>
                                <td>${item.libelle}</td>
                            </tr>`;
                    break;
                case "TabBord":
                    var entree = "", sortie = "";
                    if (item.sens == "S") {
                        sortie = separateur_mil(item.montant);
                    } else {
                        sortie = "";
                    }
                    if (item.sens == "E") {
                        entree = separateur_mil(item.montant);
                    } else {
                        entree = "";
                    }
                    list = `<tr>
                                <td>${item.caisse}</td>
                                <td>${item.code}</td>
                                <td>${item.dateSaisie}</td>
                                <td>${item.libelle}</td>
                                <td style="text-align:right">${entree}</td>
                                <td style="text-align:right">${sortie}</td>
                                <td>${item.statut}</td>
                                <td>${item.login}</td>
                                <td>${item.dateSaisie}</td>
                                <td hidden>${item.sens}</td>
                                <td hidden>${item.observation}</td>
                            </tr>`;
                    break;
            }

            // Ajouter la ligne générée au tableau
            $("#tab_" + code + " tbody").append(list);
            switch (code) {
                case "Enregistrement":
                    var total = 0;
                    total = getColumnSum("tab_" + pageName, 3);
                    document.getElementById('sumDep').textContent = separateur_mil(total);
                    break;
                case "TabBord":
                    var totalEntree = 0, totalSortie = 0;
                    totalEntree = getColumnSum("tab_" + pageName, 4);
                    document.getElementById('sumEntree').textContent = separateur_mil(totalEntree);

                    totalSortie = getColumnSum("tab_" + pageName, 5);
                    document.getElementById('sumSortie').textContent = separateur_mil(totalSortie);
                    break;
            }
        });
    }
    // Initialisation de DataTable
    $('#tab_' + code).DataTable({
        "pageLength": 10,
        "lengthMenu": [[10, 50, 100, 150, 200, -1], [10, 50, 100, 150, 200, "Tous"]],
        "responsive": false,
        "lengthChange": true,
        "ordering": false,
        "language": {
            "lengthMenu": "Afficher _MENU_ entrées",
            "emptyTable": "Aucun élément trouvé",
            "info": "Affichage _START_ à _END_ de _TOTAL_ entrées",
            "loadingRecords": "Chargement...",
            "processing": "En cours...",
            "search": '<i class="fa fa-search" aria-hidden="true"></i>',
            "searchPlaceholder": "Rechercher...",
            "zeroRecords": "Aucun élément correspondant trouvé",
            "paginate": {
                "first": "Premier",
                "last": "Dernier",
                "next": "Suivant",
                "previous": "Précédent"
            }
        }
    });
    $("#tab_" + pageName).removeClass("dataTable"); // Supprime la classe après l'initialisation
    $("#tab_" + code + " colgroup").remove();
}
function getColumnSum(tableId, columnIndex) {
    let table = document.getElementById(tableId);
    let sum = 0;

    if (table) {
        let rows = table.getElementsByTagName("tbody")[0].rows; // Sélectionne les lignes du tbody
        for (let i = 0; i < rows.length; i++) {
            let cellValue = rows[i].cells[columnIndex].textContent.trim(); // Récupère la valeur de la cellule
            // 📌 Nettoyer les séparateurs de milliers (ex: "1 000", "2.500" → "1000", "2500")
            cellValue = cellValue.replace(/\s/g, "").replace(/,/g, "").replace(/\./g, "");
            let num = parseFloat(cellValue) || 0; // Convertit en nombre (0 si NaN)
            sum += num;
        }
    }
    return sum;
}
function separateur_mil(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ' ' + '$2');
    }
    return x1 + x2;
}
function compteurCheckBox() {
    var dbRes = [];
    var nbre_check = 0;
    var dbEl = document.getElementsByName("check");
    for (i = 0; i < dbEl.length; i++) {
        if (dbEl[i].checked) {
            dbRes.push(dbEl[i].value);
            nbre_check++;
        }
    }
    $("#valueTotalQualCheck").val(nbre_check);
    //console.log(`Il y a ${nbre_check} cases à cocher cochées.`);
}