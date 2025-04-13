var pageName = $("#pageName").val();
var isDelete = false;
var isEditing = false;
parameter();
let canvas = null;
let signaturePad = null;
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
        setTodayToDateSaisie(document.getElementById('debutPeriode'));
        setLastToDateSaisie(document.getElementById('FinPeriode'));
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
    resetForm();
})
$("#tab_" + pageName + " tbody").on("click", "tr", function () {
    if (isEditing) return; // Désactiver si en mode édition
    $(this).toggleClass("selected").siblings(".selected").removeClass("selected");
    toggleForms("partieUnique");
    var nomTitre = "Editer ";
    switch (pageName) {
        case "Enregistrement":
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
            nomTitre += " Caisse";
            $("#code").val(this.cells[0].innerHTML);
            $("#libelle").val(this.cells[1].innerHTML);
            document.getElementById('code').disabled = true;
            break;
    }
    $("#titleParam_").html(nomTitre);
    document.getElementById('Supprimer').style.visibility = "visible";
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
//$('#debutPeriode, #FinPeriode').on('change blur', mousemovedTabBord);
function parameter() {
    formVue(pageName)
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
    var codeID = null;
    var description = null;

    switch (pageName) {
        case "Enregistrement":
            var caisse = $("#code1").val();
            var sens = $("#code2").val();
            var dateSaisie = $("#dateSaisie").val();
            var montant = $("#montant").val().replace(/\s+/g, "");
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
            etat: etat
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
                            document.getElementById('fermer').click();
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

var Supprimer = function () {
    toggleForms("partieDelete");
    var nomTitre = "Suppression ";
    var nomTitreDel = "Voulez-vous supprimer Code ";
    var caisse = $("#code1 option:selected").text();
    var sens = $("#code2 option:selected").text();
    var code = null;
    switch (pageName) {
        case "Enregistrement":
            code = $("#hiddenID").val();
            nomTitre += `${sens} (${caisse})`;
            break;
        case "Caisse":
            code = $("#code").val();
            nomTitre += `Caisse ${code}`;
            break;
    }
    nomTitreDel += '<strong><u>' + code + '</u></strong>';
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
                    for (var i = 1; i < table.rows.length; i++) {
                        var item = table.rows[i];
                        if (item.cells[0].innerHTML == code) {
                            table.deleteRow(i); //Supprimer la ligne correspondante
                            break; //Sort de la boucle apres supppression
                        }
                    }
                    closeDel();
                    document.getElementById('fermer').click();
                    var total = 0;
                    total = getColumnSum("tab_" + pageName, 3);
                    document.getElementById('sumDep').textContent = separateur_mil(total);
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
        case "TabBord":
            formHTML = `
                        <div class="row">
                            <div class="col-md-12" style="padding-bottom:10px">
                                <div class="float-start" style="width:75%">
                                    <div id="partieSite">
                                    </div>
                                </div>
                                <div class="float-end">
                                    <button class="btn btn-sm btn-primary" id="reloadTabBord" onclick="reloadTabBord()"> <i class="fas fa-reload mr-2"></i>Actualiser</button>
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
            $("#formParam").append(formHTML);
            formTableTOP(pageName);
            formTableau(pageName);
            formPopup(pageName);
            formPopupPartieSaisie(pageName);
            formDel();
            break;
    }
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
                            <select id="code1" style="width:100%" class="selectChoix">
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label for="code2" id='labelCode2'>Sens</label>
                        </div>
                        <div class="col-md-4">
                            <select id="code2" style="width:100%" class="selectChoix">
                                <option value="E">Entrée</option>
                                <option value="S">Sortie</option>
                            </select>
                        </div>
                    </div>
                `;
        case "TabBord":
            formHTML = `
                    <div class="row">
                        <div class="col-md-3">
                            <label for="debutPeriode">Période du :</label>
                        </div>
                        <div class="col-md-3">
                            <input type="date" name="debutPeriode" value="" id="debutPeriode" class="input_focus"/>
                            <span class="erreur"></span>
                        </div>
                        <div class="col-md-2">
                            <label for="FinPeriode">Au :</label>
                        </div>
                        <div class="col-md-3">
                            <input type="date" name="FinPeriode" value="" id="FinPeriode" class="input_focus"/>
                            <span class="erreur"></span>
                        </div>
                    </div>
                    <div class="row" style="padding-top:10px">
                        <div class="col-md-3">
                            <label for="code1">Caisses</label>
                        </div>
                        <div class="col-md-6">
                            <select id="code1" style="width:100%" class="selectChoix">
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
        case "TabBord":
            formHTML = `
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
    }
    $("#niveauFormTableau").append(formHTML);
}
function formPopup(pageName) {
    var formHtml = "";
    switch (pageName) {
        case "Enregistrement":
        case "Caisse":
        case "TabBord":
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
            break;
    }
    $("#partieUnique").append(formHtml);
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
            var montant = document.getElementById('montant');
            formatChiffreInput(montant);
            break;
    }
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
    let forms = ["partieUnique", "partieDelete"];
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
    $(".input_focus").val('');
    $('.input_focus').siblings('span.erreur').css('display', 'none');
    switch (pageName) {
        case "Enregistrement":
            signaturePad.clear();
            $("#signatureData").val('');
            $("#hiddenID").val('');
            document.getElementById('hiddenID').disabled = false;
            var dateSaisie = document.getElementById("dateSaisie");
            setTodayToDateSaisie(dateSaisie);
            break;
        case "Caisse":
            $("#code").val('');
            $("#libelle").val('');
            document.getElementById('code').disabled = false;
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
    var code1 = null, sens = null, date1 = null, date2 = null;
    switch (pageName) {
        case "Enregistrement":
            code1 = $("#code1").val();
            sens = $("#code2").val();
            break;
        case "TabBord":
            code1 = $("#code1").val();
            date1 = $("#debutPeriode").val();
            date2 = $("#FinPeriode").val();
            break;
    }
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: {
            code: code1,
            sens: sens,
            page: pageName,
            date1: date1,
            date2: date2,
        },
        url: '/CRUD/GetDataParam',
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
    }
    if ($("#code1").val() == "" || $("#code1").val() == null) {
        $('#code1').empty();
        switch (pageName) {
            case "TabBord":
                $("#code1").append("<option value='Tout'>Tout</option>");
                break;
        }
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
                                <td>${entree}</td>
                                <td>${sortie}</td>
                                <td>${item.statut}</td>
                                <td>${item.login}</td>
                                <td>${item.dateSaisie}</td>
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