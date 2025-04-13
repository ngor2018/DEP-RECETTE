var pageName = $("#pageName").val();
loadData(pageName);
window.onmousemove = mousemoved;
function mousemoved() {
    compteurCheckBox();
    document.getElementById('erreurCheck').textContent = "";
}

$(document).on('change', '#defaultCheck_Tous', function () {
    if ($(this).is(':checked')) {
        // Si "Tous" est coché, décocher les autres
        $('input[name="check"]').prop('checked', false);
    }
});

$(document).on('change', 'input[name="check"]', function () {
    // Si au moins une caisse est cochée, décocher "Tous"
    if ($('input[name="check"]:checked').length > 0) {
        $('#defaultCheck_Tous').prop('checked', false);
    } else {
        // Si aucune caisse cochée, recocher "Tous"
        $('#defaultCheck_Tous').prop('checked', true);
    }
});
const today = new Date();
const yyyy = today.getFullYear();
document.getElementById('debut').value = `${yyyy}-01-01`;
document.getElementById('fin').value = `${yyyy}-12-31`;

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
    if (isAllValid) {
        var objData = {};
        var listOfCaisseAffect = new Array();
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
               alert('Mario')
            },
            error: function (xhr, status, error) {
                clearInterval(interval); // Arrêter la simulation

                // Indiquer l'échec
                progressBar.css("width", "100%").css("background-color", "red").text("Erreur");
                console.log('La réponse a échoué : ' + error);
            }
        })
    }
}
function loadData(pageName) {
    $.ajax({
        async: true,
        type: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',
        data: {
            page: pageName,
        },
        url: '/CRUD/GetDataParam',
        success: function (data) {
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
                    </tr>
                `;
                listCaisse.append(list);
            }
        }
    });
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