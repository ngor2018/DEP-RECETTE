var pageName = $("#pageName").val();
var isDelete = false;
var isEditing = false;
$(function () {
    parameter();
})
function parameter() {
    formVue(pageName)
}
function formVue(pageName) {
    let formHTML = "";
    switch (pageName) {
        case "Depense":
        case "Recette":
            formHTML = `
                        <div class="row">
                            <div class="col-md-12" style="padding-bottom:10px">
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
            formTableau(pageName);
            formPopup(pageName);
            formDel();
            break;
    }
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
                                                            <th>CODE</th>
                                                            <th>Description</th>
                                                            <th>Etat</th>
                                                            <th>Montant</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody></tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <th colspan='3' style="text-align:right">Total</th>
                                                            <th>10000</th>
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

            break;
    }
    $("#partieUnique").append(formHtml);
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
function loadData(pageName) {
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: {
            code: pageName,
        },
        url: '/CRUD/GetDataParam',
        success: function (data) {
            reportData(data);
        }
    })
}
function reportData(data) {
    DataTable(pageName, data);
}
function DataTable(code, data) {
    switch (code) {
        default:
            // Vérifier si la table existe déjà et la réinitialiser
            if ($.fn.DataTable.isDataTable('#' + code)) {
                $('#tab_' + code).DataTable().destroy();
                $("#tab_" + code + " tbody").empty();
            }
            // Configuration des colonnes pour chaque type de table
            const config = {
                default: { columns: ["code", "libelle"], styles: {} },
                Exercices: {
                    columns: ["annee", "dateDebut", "dateFin", "statut", "dateCloture"],
                    styles: {
                        annee: "text-align: right;",
                        dateDebut: "text-align: center;",
                        dateFin: "text-align: center;",
                        dateCloture: "text-align: right;",
                        statut: "text-align: center;"
                    }
                },
                Monnaie: {
                    columns: ["code", "libelle", "libelleM", "nbreDecimale"],
                    styles: {
                        code: "text-align: left;",
                        libelle: "text-align: left;",
                        libelleM: "text-align: left;",
                        nbreDecimale: "text-align: right;",
                    }
                }
            };

            // Générer une ligne HTML en fonction des colonnes définies
            function generateRow(item, columns, styles) {
                return `<tr>` +
                    columns.map(col => {
                        let style = styles[col] ? ` style='${styles[col]}'` : "";
                        return `<td${style}>${col === "statut" ? generateEtatCheckbox(item[col]) : item[col] || ""}</td>`;
                    }).join('') +
                    `</tr>`;
            }

            // Générer un champ checkbox pour l'état (statut)
            function generateEtatCheckbox(status) {
                return `<input class="" disabled type="checkbox" ${status ? "checked" : ""} />`;
            }
            // Déterminer les colonnes et styles à utiliser
            const { columns, styles } = config[code] || config.default;

            // Générer les lignes et les insérer dans le tableau
            const rows = data.listData.map(item => generateRow(item, columns, styles)).join('');
            $("#" + code + " tbody").append(rows);

            // Initialisation de DataTable
            $('#' + code).DataTable({
                "pageLength": 10,
                "lengthMenu": [[10, 50, 100, 150, 200, -1], [10, 50, 100, 150, 200, "Tous"]],
                "responsive": true,
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

            break;
    }
}