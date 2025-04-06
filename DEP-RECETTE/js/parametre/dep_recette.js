var pageName = $("#pageName").val();
var isDelete = false;
var isEditing = false;
parameter();
const canvas = document.getElementById("signature");
const signaturePad = new SignaturePad(canvas);

document.getElementById("clear").addEventListener("click", () => {
    signaturePad.clear();
    setErrorMessage("#signature", "", true);
});
$("#signature").click(function () {
    setErrorMessage("#signature", "", true);
})
$('.input_focus').keyup(function () {
    $(this).siblings('span.erreur').css('display', 'none');
})
$("#fermer").click(function () {
    document.getElementById('fullscreen_popup').style.display = "none";
    resetForm();
})
$("#tab_" + pageName + " tbody").on("click", "tr", function () {
    $(this).toggleClass("selected").siblings(".selected").removeClass("selected");
    toggleForms("partieUnique");
    var nomTitre = "Editer ";
    switch (pageName) {
        case "Depense":
            nomTitre += " Dépense";
            document.getElementById('signatureData').value = this.cells[4].innerHTML;
            const existingSignature = document.getElementById('signatureData');
            if (existingSignature && existingSignature.value) {
                signaturePad.fromDataURL(existingSignature.value);
            }
            break;
        case "Recette":
            nomTitre += " Recette";
            break;
    }
    $("#titleParam_").html(nomTitre);
    $("#hiddenID").val(this.cells[0].innerHTML);
    $("#montant").val(separateur_mil(this.cells[3].innerHTML));
    $("#description").val(separateur_mil(this.cells[2].innerHTML));
    document.getElementById('hiddenID').disabled = true;
})
$(".selectChoix").select2();
$("#code1").change(function () {
    loadData(pageName)
})
function parameter() {
    formVue(pageName)
}
var Ajout = function () {
    toggleForms("partieUnique");
    var nomTitre = "Ajout ";
    switch (pageName) {
        case "Depense":
            nomTitre = "Dépense";
            break;
        case "Recette":
            nomTitre = "Recette";
            break;
    }
    $("#titleParam_").html(nomTitre);
    resetForm();
}
var Enregistrer = function () {
    var isAllValid = true;
    var montant = $("#montant").val().replace(/\s+/g, "");
    var description = $("#description").val();
    if (montant.trim() == '' || montant == 0) {
        isAllValid = false;
        setErrorMessage("#montant", "champ obligatoire", isAllValid);
    }
    if (description.trim() == '') {
        isAllValid = false;
        setErrorMessage("#description", "champ obligatoire", isAllValid);
    }
    switch (pageName) {
        case "Depense":
            if (!signaturePad.isEmpty()) {
                let dataUrl = signaturePad.toDataURL();
                document.getElementById("signatureData").value = dataUrl;
            } else {
                isAllValid = false;
                setErrorMessage("#signature", "Veuillez signer avant de valider !", isAllValid);
            }
            break;
    }
    if (isAllValid) {
        var codeSignature = $("#signatureData").val();
        var EtatCod = null;
        var type = "";
        var EtatValid = "";
        var etat = true;
        EtatCod = document.getElementById('hiddenID');
        switch (pageName) {
            case "Depense":
                type = "D";
                EtatValid = "En attente";
                break;
            case "Recette":
                type = "R";
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
            niveau: pageName,
            montant: montant,
            Designation: description,
            Signature: codeSignature,
            sens: type,
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
                        alert('Code existant');
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
function formVue(pageName) {
    let formHTML = "";
    switch (pageName) {
        case "Depense":
        case "Recette":
            formHTML = `
                        <div class="row">
                            <div class="col-md-12" style="padding-bottom:10px">
                                <div class="float-start" style="width:50%">
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
        case "Depense":
        case "Recette":
            formHTML = `
                    <div class="row">
                        <div class="col-md-3">
                            <label for="code1" id='labelCode1'>Caisse</label>
                        </div>
                        <div class="col-md-9">
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
        case "Depense":
        case "Recette":
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
    }
    $("#niveauFormTableau").append(formHTML);
}
function formPopup(pageName) {
    var formHtml = "";
    switch (pageName) {
        case "Depense":
        case "Recette":
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
        case "Depense":
            formHTML = `
                        <div class="row">
                            <div class="col-md-12">
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
                                        <canvas id="signature" style="border:1px solid #c8c6c6; width: 350px; height: 150px;"></canvas>
                                        <span class="erreur"></span>
                                    </div>
                                    <div class="col-md-2">
                                        <button class="btn btn-sm btn-danger" id="clear">Effacer</button>
                                    </div>
                                </div>
                                <input type="text" name="hiddenID" value="" id="hiddenID"/>
                                <input type="text" id="signatureData" name="signatureBase64" />
                            </div>
                        </div>
                        `;
            break;
    }
    $("#zoneSaisie").append(formHTML);
    var montant = document.getElementById('montant');
    formatChiffreInput(montant);
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
    switch (pageName) {
        case "Depense":
            signaturePad.clear();
            $("#signatureData").val('')
            break;
        default:
    }
    $("#hiddenID").val('');
    document.getElementById('hiddenID').disabled = false;
    $(".input_focus").val('');
    $('.input_focus').siblings('span.erreur').css('display', 'none');
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
    var code1 = $("#code1").val();
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: {
            code: code1,
            page: pageName,
        },
        url: '/CRUD/GetDataParam',
        success: function (data) {
            reportData(data);
        }
    })
}
function reportData(data) {
    if ($("#code1").val() == "" || $("#code1").val() == null) {
        $('#code1').empty();
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
        document.getElementById('sumDep').textContent = "0";
    } else {
        data.listData.forEach(item => {
            switch (code) {
                case "Depense":
                    list = `<tr>
                           <td hidden>${item.code}</td>
                           <td style='text-align:right'>${item.rowIndex}</td>
                           <td>${item.Designation}</td>
                           <td style='text-align:right'>${separateur_mil(item.montant)}</td>
                           <td hidden>${item.Signature}</td>
                           <td hidden>${item.valider}</td>
                        </tr>`;
                    break;
            }

            // Ajouter la ligne générée au tableau
            $("#tab_" + code + " tbody").append(list);
            var total = 0;
            total = getColumnSum("tab_Depense", 3);
            document.getElementById('sumDep').textContent = separateur_mil(total)
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