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

                    table = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { filtre });
                    switch (statut)
                    {
                        //Ajout
                        case false:
                            if (table.Rows.Count > 0)
                            {
                                isAllValid = false;
                            }
                            else
                            {
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
                            }
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
                        if (isAllValid)
                        {
                            // Enregistrer si la méthode existe
                            enregistrerMethod?.Invoke(tableInstance, new object[] { table });
                        }
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
            switch (niveau)
            {
                case "Enregistrement":
                    fields["montant"] = objData.montant;
                    fields["Designation"] = objData.Designation;
                    fields["Signature"] = objData.Signature;
                    fields["sens"] = objData.sens;
                    fields["valider"] = objData.valider;
                    fields["CAISSE"] = objData.caisse;
                    fields["dateSaisie"] = objData.dateSaisie;
                    break;

                case "Caisse":
                    fields["code"] = objData.code;
                    fields["libelle"] = objData.Designation;
                    break;
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
                case "Enregistrement":
                case "Caisse":
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
                case "Enregistrement":
                    return new TABLES.MOPERCAISSE();
                case "Caisse":
                    return new TABLES.RCAISSES();
                default: return null;
            }
        }
        [HttpGet]
        public JsonResult GetDataParam(string page, string code,string sens,string date1,string date2)
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
            switch (page)
            {
                case "Enregistrement":
                    tableInstance = new TABLES.MOPERCAISSE();
                    if (dtUserCaisse.Rows.Count > 0)
                    {
                        DataRow firstRowCa = dtUserCaisse.Rows[0];
                        var FisrtCodeCa = firstRowCa["CODE"].ToString();
                        if (string.IsNullOrEmpty(code))
                        {
                            code = FisrtCodeCa;
                        }
                    }
                    break;
                case "TabBord":
                    tableInstance = new TABLES.MOPERCAISSE();
                    foreach (DataRow row in dtUserCaisse.Rows)
                    {
                        listCaisse.Add(new parameter()
                        {
                            code = row["code"].ToString(),
                            libelle = row["libelle"].ToString()
                        });
                    }
                    break;
                case "Caisse":
                    tableInstance = new TABLES.RCAISSES();
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
                        case "Enregistrement":
                            if (groupe == "USER")
                            {
                                filtre = $"sens = '{sens}' and CAISSE = '{code}' and UserCre = '{login}'";
                            }
                            else
                            {
                                filtre = $"sens = '{sens}' and CAISSE = '{code}'";

                            }
                            objTab = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { filtre });
                            break;
                        case "TabBord":
                            if (code == "" || code == null)
                            {
                                code = "Tout";
                            }
                            DateTime d1, d2;
                            if (!DateTime.TryParse(date1, out d1))
                            {
                                d1 = DateTime.Now;
                            }
                            if (!DateTime.TryParse(date2, out d2))
                            {
                                d2 = new DateTime(DateTime.Now.Year, 12, 31);
                            }
                            string dateDebut = d1.ToString("dd-MM-yyyy");
                            string dateFin = d2.ToString("dd-MM-yyyy");
                            if (code == "Tout")
                            {
                                if (groupe == "USER")
                                {
                                    filtre = $"UserCre = '{login}' AND dateSaisie >= '{dateDebut}' AND dateSaisie <= '{dateFin}'";
                                }
                                else
                                {
                                    filtre = $"dateSaisie >= '{dateDebut}' AND dateSaisie <= '{dateFin}'";
                                }
                            }
                            else
                            {
                                if (groupe == "USER")
                                {
                                    filtre = $"CAISSE = '{code}' AND UserCre = '{login}' AND dateSaisie >= '{dateDebut}' AND dateSaisie <= '{dateFin}'";
                                }
                                else
                                {
                                    filtre = $"CAISSE = '{code}' AND dateSaisie >= '{dateDebut}' AND dateSaisie <= '{dateFin}'";
                                }
                            }

                            try
                            {

                                objTab = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { filtre });
                            }
                            catch (Exception ex)
                            {

                                throw;
                            }
                            break;
                        case "Caisse":
                            objTab = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { "" });
                            break;
                    }
                }
            }
            // Remplissage de la liste
            int rowIndex = 1;
            switch (page)
            {
                case "Enregistrement":
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
                case "Caisse":
                    foreach (DataRow row in objTab.Rows)
                    {
                        listData.Add(new parameter()
                        {
                            code = row["code"].ToString(),
                            libelle = row["libelle"].ToString(),
                        });
                    }
                    break;
                case "TabBord":
                    foreach (DataRow row in objTab.Rows)
                    {
                        listData.Add(new parameter()
                        {
                            caisse = row["CAISSE"].ToString(),
                            code = row["code"].ToString(),
                            dateSaisie = DateTime.Parse(row["dateSaisie"].ToString()).ToString("dd/MM/yyyy"),
                            libelle = row["Designation"].ToString(),
                            montant = row["MONTANT"].ToString(),
                            statut = row["Valider"].ToString(),
                            login = row["UserCre"].ToString(),
                            sens = row["sens"].ToString()
                        });
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
        
        [HttpPost]
        public JsonResult DelParam(parameter objData)
        {
            string result = "";
            bool isAllValid = true, etat = false;
            var code = objData.code;
            var niveau = objData.niveau;
            object tableInstance = null;
            string tableType = "", filtre = "";
            DataTable table = new DataTable();

            switch (niveau)
            {
                case "Enregistrement":
                    tableInstance = new TABLES.MOPERCAISSE();
                    break;
                case "Caisse":
                    tableInstance = new TABLES.RCAISSES();
                    if (IsCodeCaisseAutorise(code) == true)
                    {
                        isAllValid = false;
                    }
                    break;
            }
            if (tableInstance != null)
            {
                tableType = tableInstance.GetType().Name;
            }
            string requete = "";
            switch (niveau)
            {
                case "Caisse":
                case "Enregistrement":
                    requete = "DELETE FROM " + tableType + " where CODE = '" + code + "'";
                    break;
            }
            if (isAllValid)
            {
                result = "Enregistrement supprimé avec succès ";
                con.Open();
                com.Connection = con;
                com.CommandText = requete;
                dr = com.ExecuteReader();
                con.Close();
            }
            else
            {
                result = "Suppression impossible : Codification rattachée !!!";
            }
            return Json(new { statut = isAllValid, message = result }, JsonRequestBehavior.AllowGet);
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
        public bool IsCodeCaisseAutorise(string codeCaisse)
        {
            // Vérification du paramètre
            if (string.IsNullOrWhiteSpace(codeCaisse)) return false;

            // Instancier rUser
            var objUser = new TABLES.rUser();
            DataTable dtUser = objUser.RemplirDataTable(); // On récupère tous les utilisateurs

            foreach (DataRow utilisateur in dtUser.Rows)
            {
                if (utilisateur["CAISSE"] == DBNull.Value) continue;

                string chaineCaisse = utilisateur["CAISSE"].ToString(); // exemple : "1;2;4"
                var codes = chaineCaisse.Split(';')
                                        .Select(c => c.Trim())
                                        .Where(c => !string.IsNullOrWhiteSpace(c));

                if (codes.Contains(codeCaisse))
                {
                    return true;
                }
            }

            return false;
        }


    }
}