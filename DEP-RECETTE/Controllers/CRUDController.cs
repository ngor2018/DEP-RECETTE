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
                case "TabBord":
                    fields["montant"] = objData.montant;
                    fields["Designation"] = objData.Designation;
                    fields["sens"] = objData.sens;
                    fields["valider"] = objData.valider;
                    fields["CAISSE"] = objData.caisse;
                    fields["dateSaisie"] = objData.dateSaisie;
                    fields["observation"] = objData.observation;
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
                case "TabBord":
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
                case "TabBord":
                    return new TABLES.MOPERCAISSE();
                case "Caisse":
                    return new TABLES.RCAISSES();
                default: return null;
            }
        }
        [HttpPost]
        public JsonResult SendExploitation(parameter objData)
        {
            DateTime d1 = Convert.ToDateTime(objData.dateDebut), d2 = Convert.ToDateTime(objData.dateFin);
            var debut = d1.ToString("dd-MM-yyyy");
            var fin = d2.ToString("dd-MM-yyyy");
            var compteur = Convert.ToInt32(objData.compteur);
            List<parameter> listData = new List<parameter>();

            EXPLOITATIONS.TableauBORD.structParametres structTabBord = new EXPLOITATIONS.TableauBORD.structParametres();
            EXPLOITATIONS.TableauBORD mExploitation = new EXPLOITATIONS.TableauBORD();
            structTabBord.structDate = new BDD.Abstraite.structInterValle
            {
                From = debut,
                To = fin
            };
            structTabBord.User = Session["LOGIN"].ToString();

            var isAllValid = true;
            var result = "";

            if (compteur > 0)
            {
                foreach (var item in objData.listOfCaisseAffect)
                {
                    structTabBord.arrCaisse.Add(item.code);
                }
            }
            switch (objData.sens)
            {
                case "N":
                    structTabBord.ENUMVALIDATION = EXPLOITATIONS.TableauBORD.ENUMVALIDATION.NONVALIDE;
                    break;
                case "V":
                    structTabBord.ENUMVALIDATION = EXPLOITATIONS.TableauBORD.ENUMVALIDATION.VALIDE;
                    break;
                case "R":
                    structTabBord.ENUMVALIDATION = EXPLOITATIONS.TableauBORD.ENUMVALIDATION.REFUS;
                    break;
                case "T":
                    structTabBord.ENUMVALIDATION = EXPLOITATIONS.TableauBORD.ENUMVALIDATION.TOUS;
                    break;
            }
            // Type d'édition
            structTabBord.enumEdition = EXPLOITATIONS.TableauBORD.enumEDITION.OPERATIONCAISSE;

            // Récupération des données
            DataTable dt = mExploitation.GETSOURCE(structTabBord);
            if (dt.Rows.Count == 0)
            {
                isAllValid = false;
            }
            else
            {
                foreach (DataRow row in dt.Rows)
                {
                    var dateC = row["Date"] == DBNull.Value || string.IsNullOrWhiteSpace(row["Date"].ToString())
                                        ? ""
                                        : DateTime.Parse(row["Date"].ToString()).ToString("dd/MM/yyyy");
                    listData.Add(new parameter()
                    {
                        caisse = row["CAISSE"].ToString(),
                        date1 = dateC,
                        Designation = row["Designation"].ToString(),
                        entree = row["RECETTE"].ToString(),
                        sortie = row["DEPENSE"].ToString(),
                        solde = row["SOLDE"].ToString(),
                        FLAG = row["FLAG"].ToString(),

                    });
                }
            }
            if (!isAllValid)
            {
                result = "Aucun enregistrement n'a été trouvé";
            }
            return Json(new { statut = isAllValid, message = result, donnee = listData }, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult GetDataParam(parameter tabData)
        {
            string page = tabData.page;
            string code = tabData.code;
            string sens = tabData.sens;
            string date1 = tabData.date1;
            string date2 = tabData.date2;
            var tab = tabData.listOfCaisseAffect; 
            string compteur = tabData.compteur;
            if (compteur == null)
            {
                compteur = "0";
            }
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
            if (groupe == "SAISIE")
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
                    break;
                case "TabBord":
                case "EditOperation":
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
                            if (groupe == "SAISIE")
                            {
                                filtre = $"sens = '{sens}' and CAISSE = '{code}' and UserCre = '{login}' and Valider = 'N'";
                            }
                            else
                            {
                                filtre = $"sens = '{sens}' and CAISSE = '{code}' and Valider = 'N'";

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
                                d1 = new DateTime(DateTime.Now.Year, 01, 01);
                            }
                            if (!DateTime.TryParse(date2, out d2))
                            {
                                d2 = new DateTime(DateTime.Now.Year, 12, 31);
                            }
                            string dateDebut = d1.ToString("dd-MM-yyyy");
                            string dateFin = d2.ToString("dd-MM-yyyy");
                            //if (code == "Tous" && (tab == null || tab.Count == 0) && compteur == 0)
                            if (compteur == "0")
                            {
                                if (groupe == "SAISIE")
                                {
                                    filtre = $"UserCre = '{login}' AND dateSaisie >= '{dateDebut}' AND dateSaisie <= '{dateFin}' and Valider = 'N'";
                                }
                                else
                                {
                                    filtre = $"dateSaisie >= '{dateDebut}' AND dateSaisie <= '{dateFin}'";
                                }
                            }
                            else
                            {
                                var caissesFiltrees = tab?.Select(t => $"CAISSE = '{t.code}'").ToList() ?? new List<string>();
                                var conditionCaisses = string.Join(" OR ", caissesFiltrees);


                                if (groupe == "SAISIE")
                                {
                                    filtre = $"({conditionCaisses}) AND UserCre = '{login}' AND dateSaisie >= '{dateDebut}' AND dateSaisie <= '{dateFin}' and Valider = 'N'";
                                }
                                else
                                {
                                    filtre = $"({conditionCaisses}) AND dateSaisie >= '{dateDebut}' AND dateSaisie <= '{dateFin}'";
                                }
                            }

                            objTab = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { filtre });
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
                            sens = row["sens"].ToString(),
                            observation = row["observation"].ToString()
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
                case "TabBord":
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
                case "TabBord":
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