using DEP_RECETTE.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace DEP_RECETTE.Controllers
{
    public class CRUDController : Controller
    {
        // GET: CRUD
        SqlCommand com = new SqlCommand();
        SqlDataReader dr;
        SqlConnection con = new SqlConnection(GetConnexion.GetConnectionString());
        parameter parametre = new parameter();
        public ActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public JsonResult Add_EditParam(parameter objData)
        {
            string result = "";
            bool isAllValid = true;
            var niveau = objData.niveau;
            bool statut = objData.etat;
            DataTable table = new DataTable();
            DataRow row;
            var extraFields = SetExtraFields(niveau, objData);
            var filtre = GetFiltre(objData);
            var tableInstance = GetTableInstance(niveau);
            // Vérification et enregistrement
            if (tableInstance != null)
            {
                var tableType = tableInstance.GetType();
                var remplirDataTableMethod = tableType.GetMethod("RemplirDataTable", new Type[] { typeof(string) });
                var enregistrerMethod = tableType.GetMethod("Enregistrer", new Type[] { typeof(DataTable) });
                if (remplirDataTableMethod != null)
                {
                    try
                    {
                        table = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { filtre });
                    }
                    catch (Exception ex)
                    {

                        throw;
                    }
                    switch (statut)
                    {
                        //Ajout
                        case false:
                                table = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { "" });
                                row = table.NewRow();
                                // Ajout des champs supplémentaires s'ils existent
                                if (extraFields != null)
                                {
                                    foreach (var field in extraFields)
                                    {
                                        row[field.Key] = field.Value;
                                    }
                                }
                                table.Rows.Add(row);
                            break;
                        //Edition
                        default:
                            row = table.Rows[0];
                            row.BeginEdit();
                            foreach (var field in extraFields)
                            {
                                row[field.Key] = field.Value;
                            }
                            row.EndEdit();
                            break;
                    }
                    try
                    {
                        // Enregistrer si la méthode existe
                        enregistrerMethod?.Invoke(tableInstance, new object[] { table });
                        result = statut ? "Enregistrement modifié avec succès" : (isAllValid ? "Enregistrement ajouté avec succès" : "Code existe déjà");
                    }
                    catch (Exception ex)
                    {
                        result = ex.Message;
                    }
                }
            }

            return Json(new { statut = isAllValid, message = result }, JsonRequestBehavior.AllowGet);
        }
        // Génère les champs supplémentaires en fonction du niveau
        private Dictionary<string, object> SetExtraFields(string niveau, parameter objData)
        {
            var fields = new Dictionary<string, object>();

            if (new[] { "Depense","Recette" }.Contains(niveau))
            {
                fields["montant"] = objData.montant;
                fields["Designation"] = objData.Designation;
                fields["Signature"] = objData.Signature;
                fields["sens"] = objData.sens;
                fields["valider"] = objData.valider;
                fields["CAISSE"] = objData.caisse;
                fields["dateSaisie"] = DateTime.Now;
            }
            return fields;
        }
        // Génère le filtre SQL en fonction du niveau
        private string GetFiltre(parameter objData)
        {
            string niveau = objData.niveau,
                code = objData.code;
            switch (niveau)
            {
                case "Depense":
                case "Recette":
                    return $"CODE = '{code}'";
                default:
                    return "";
            }
        }
        // Retourne l'instance de la table en fonction du niveau
        private object GetTableInstance(string niveau)
        {
            switch (niveau)
            {
                case "Depense":
                case "Recette":
                    return new TABLES.MOPERCAISSE();
                default: return null;
            }
        }
        [HttpGet]
        public JsonResult GetDataParam(string page, string code)
        {
            List<parameter> listData = new List<parameter>();
            List<parameter> listCaisse = new List<parameter>();
            DataTable objTab = new DataTable();
            object tableInstance = null;
            var filtre = "";
            TABLES.rUser rUser = new TABLES.rUser();
            TABLES.RCAISSES rCAISSES = new TABLES.RCAISSES();
            var login = Convert.ToString(Session["LOGIN"]);
            var groupe = Convert.ToString(Session["GROUPE"]);
            DataTable dtUserCaisse = new DataTable();
            if (groupe == "USER")
            {
                //dtUserCaisse = rUser.GetUserCaisse(login);
                dtUserCaisse = GetUsCaisse(login);
            }
            else
            {
                dtUserCaisse = rCAISSES.RemplirDataTable();
            }
            foreach (DataRow row in dtUserCaisse.Rows)
            {
                listCaisse.Add(new parameter()
                {
                    code = row["code"].ToString(),
                    libelle = row["libelle"].ToString()
                });
            }
            if (dtUserCaisse.Rows.Count > 0)
            {
                DataRow firstRowCa = dtUserCaisse.Rows[0];
                var FisrtCodeCa = firstRowCa["CODE"].ToString();
                if (string.IsNullOrEmpty(code))
                {
                    code = FisrtCodeCa;
                }
            }
            switch (page)
            {
                case "Depense":
                case "Recette":
                    tableInstance = new TABLES.MOPERCAISSE();
                    break;
            }
            if (tableInstance != null)
            {
                var tableType = tableInstance.GetType();
                var remplirDataTableMethod = tableType.GetMethod("RemplirDataTable", new Type[] { typeof(string) });
                if (remplirDataTableMethod != null)
                {
                    switch (page)
                    {
                        case "Depense":
                            if (groupe == "USER")
                            {
                                filtre = $"sens = 'D' and CAISSE = '{code}' and UserCre = '{login}'";
                            }
                            else
                            {
                                filtre = $"sens = 'D' and CAISSE = '{code}'";
                            }
                            objTab = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { filtre });
                            break;
                        case "Recette":
                            if (groupe == "USER")
                            {
                                filtre = $"sens = 'R' and CAISSE = '{code}' and UserCre = '{login}'";
                            }
                            else
                            {
                                filtre = $"sens = 'R' and CAISSE = '{code}'";
                            }
                            objTab = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { filtre });
                            break;
                        default:
                            objTab = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { "" });
                            break;
                    }
                }
            }
            // Remplissage de la liste
            int rowIndex = 1;
            switch (page)
            {
                case "Depense":
                case "Recette":
                    foreach (DataRow row in objTab.Rows)
                    {
                        var dateValid = row["dateValidation"] == DBNull.Value || string.IsNullOrWhiteSpace(row["dateValidation"].ToString())
                                            ? null
                                            : DateTime.Parse(row["dateValidation"].ToString()).ToString("dd/MM/yyyy");
                        listData.Add(new parameter()
                        {
                            rowIndex = rowIndex,
                            code = row["code"].ToString(),
                            montant = row["montant"].ToString(),
                            Designation = row["Designation"].ToString(),
                            dateSaisie = DateTime.Parse(row["dateSaisie"].ToString()).ToString("dd/MM/yyyy"),
                            dateValid = dateValid,
                            Signature = row["signature"].ToString(),
                            valider = row["valider"].ToString(),
                        });
                        rowIndex++;
                    }
                    break;
            }
            var data = new
            {
                listCaisse = listCaisse,
                listData = listData
            };
            return Json(data, JsonRequestBehavior.AllowGet);
        }
        public DataTable GetUsCaisse(string login)
        {
            DataTable dtResult = new DataTable();
            dtResult.Columns.Add("code");
            dtResult.Columns.Add("libelle");

            // Instancier rUser
            var objUser = new TABLES.rUser();
            DataTable dtUser = objUser.RemplirDataTable($"LOGIN = '{login}'");
            var utilisateur = dtUser.AsEnumerable().FirstOrDefault();
            if (utilisateur == null || utilisateur["CAISSE"] == DBNull.Value) return dtResult;

            string chaineCaisse = utilisateur["CAISSE"].ToString(); // exemple : "1;2"
            if (string.IsNullOrWhiteSpace(chaineCaisse)) return dtResult;

            var codes = chaineCaisse.Split(';').Select(c => c.Trim()).Where(c => !string.IsNullOrWhiteSpace(c)).ToList();

            // Charger toutes les caisses
            TABLES.RCAISSES rCaisse = new TABLES.RCAISSES();
            DataTable allCaisses = rCaisse.RemplirDataTable();

            // Filtrer les caisses autorisées
            var filtered = allCaisses.AsEnumerable()
                .Where(row => codes.Contains(row["code"].ToString()));

            if (filtered.Any())
                return filtered.CopyToDataTable();

            return dtResult;
        }


    }
}