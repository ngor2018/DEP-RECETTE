using DBINSTALL;
using DEP_RECETTE.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace DEP_RECETTE.Controllers
{
    public class UtilitairesController : Controller
    {
        // GET: Utilitaires
        SqlCommand com = new SqlCommand();
        SqlDataReader dr;
        SqlConnection con = new SqlConnection(GetConnexion.GetConnectionString());
        parameter parametre = new parameter();
        public ActionResult Sauvegarde()
        {
            if (Session["LOGIN"] == null)
            {
                return RedirectToAction("Index", "Home");
            }
            else
            {
                return View();
            }
        }
        public ActionResult Restauration()
        {
            if (Session["LOGIN"] == null)
            {
                return RedirectToAction("Index", "Home");
            }
            else
            {
                return View();
            }
        }

        [HttpPost]
        public JsonResult SauvegarderBase(string racine)
        {
            string login = Convert.ToString(Session["LOGIN"]);
            BDD.Connexion.Serveur = BDD.Connexion.enumServeur.WEB;
            FinproConfig objConfig = new FinproConfig();
            FinproXmlFile objFinproXml = new FinproXmlFile();
            System.Web.UI.Page Page = new System.Web.UI.Page();
            var path = System.Web.Hosting.HostingEnvironment.MapPath("/Configuration.config");

            objFinproXml = objConfig.DecrypterFichierConfig(path, DBINSTALL.FinproConfig.enumTypeFile.FINPRONET);
            bool a = objFinproXml.MultiProjets;
            int typeProjet = a ? 1 : 0;
            string nomServeur="", numUtilisateur="", motDePasse="", nomBase="";
            switch (typeProjet)
            {
                //Multi projet
                case 1:
                    //nomServeur = Session["NomServeur"].ToString();
                    //nomBase = Session["NomBase"].ToString();
                    //numUtilisateur = Session["NomUtilisateur"].ToString();
                    //motDePasse = Session["MotDePasse"].ToString();
                    break;
                default:
                    //mono projet
                    nomServeur = objFinproXml.NomServeur;
                    numUtilisateur = objFinproXml.NomUtilisateur;
                    motDePasse = objFinproXml.MotdePasse;
                    nomBase = objFinproXml.NomBase;
                    break;
            }
            try
            {
                // Créer le dossier s’il n'existe pas
                if (!Directory.Exists(racine))
                {
                    try
                    {
                        Directory.CreateDirectory(racine);
                    }
                    catch (Exception dirEx)
                    {
                        return Json(new { success = false, message = $"Erreur lors de la création du dossier : {dirEx.Message}" });
                    }
                }

                string connectionString = $"Server={nomServeur};Database=master;User Id={numUtilisateur};Password={motDePasse};";

                string cheminSauvegarde = Path.Combine(racine, $"{nomBase}_{DateTime.Now:yyyyMMdd_HHmmss}_User_{login}.bak");

                string backupQuery = $@"
                                        BACKUP DATABASE [{nomBase}]
                                        TO DISK = N'{cheminSauvegarde}'
                                        WITH INIT, FORMAT;";

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand(backupQuery, connection))
                    {
                        command.ExecuteNonQuery();
                    }
                }

                //return Json(new { success = true, message = $"Sauvegarde terminée : {cheminSauvegarde}" });
                return Json(new { success = true, message = "Sauvegarde effectuée, Consultez dossier de téléchargements", chemin = cheminSauvegarde });

            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        public FileResult TelechargerSauvegarde(string chemin)
        {
            byte[] fileBytes = System.IO.File.ReadAllBytes(chemin);
            string fileName = Path.GetFileName(chemin);

            // Force le téléchargement
            return File(fileBytes, "application/octet-stream", fileName);
        }
        public (string LogicalDataName, string LogicalLogName) GetLogicalFileNames(string cheminBak, string connectionStringMaster)
        {
            using (SqlConnection conn = new SqlConnection(connectionStringMaster))
            {
                conn.Open();
                string fileListQuery = $"RESTORE FILELISTONLY FROM DISK = N'{cheminBak}'";

                using (SqlCommand cmd = new SqlCommand(fileListQuery, conn))
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    string logicalDataName = null;
                    string logicalLogName = null;

                    while (reader.Read())
                    {
                        string type = reader["Type"].ToString();
                        string logicalName = reader["LogicalName"].ToString();

                        if (type == "D") logicalDataName = logicalName;
                        else if (type == "L") logicalLogName = logicalName;
                    }

                    return (logicalDataName, logicalLogName);
                }
            }
        }
        public string GetNomBaseDepuisHeader(string cheminBak, string connectionStringMaster)
        {
            using (SqlConnection conn = new SqlConnection(connectionStringMaster))
            {
                conn.Open();
                string query = $"RESTORE HEADERONLY FROM DISK = N'{cheminBak}'";
                using (SqlCommand cmd = new SqlCommand(query, conn))
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        return reader["DatabaseName"].ToString(); // => "BASEPRODACTODAY"
                    }
                }
            }
            return null;
        }
        [HttpPost]
        public JsonResult RestaurerBase(parameter objData)
        {
            var login = Convert.ToString(Session["LOGIN"].ToString());
            var fileBDD = objData.fileBDD;
            if (fileBDD == null || Path.GetExtension(fileBDD.FileName).ToLower() != ".bak")
                return Json(new { success = false, message = "Le fichier doit être au format .bak" });

            string dossierTemp = @"C:\SQLBackupsDEPREC\Restauration";
            if (!Directory.Exists(dossierTemp))
            {
                Directory.CreateDirectory(dossierTemp);
            }

            string nomSansExtension = Path.GetFileNameWithoutExtension(fileBDD.FileName);
            string nomAvecHorodatage = $"{nomSansExtension}_{DateTime.Now:yyyyMMdd_HHmmss}.bak";
            string tempPath = Path.Combine(dossierTemp, nomAvecHorodatage);


            if (!Directory.Exists(Path.GetDirectoryName(tempPath)))
            {
                Directory.CreateDirectory(Path.GetDirectoryName(tempPath));
            }

            fileBDD.SaveAs(tempPath);


            BDD.Connexion.Serveur = BDD.Connexion.enumServeur.WEB;
            FinproConfig objConfig = new FinproConfig();
            FinproXmlFile objFinproXml = new FinproXmlFile();
            System.Web.UI.Page Page = new System.Web.UI.Page();
            var path = System.Web.Hosting.HostingEnvironment.MapPath("/Configuration.config");

            objFinproXml = objConfig.DecrypterFichierConfig(path, DBINSTALL.FinproConfig.enumTypeFile.FINPRONET);
            bool a = objFinproXml.MultiProjets;
            int typeProjet = a ? 1 : 0;
            string nomServeur = "", user = "", mdp = "", nomBase = "";
            switch (typeProjet)
            {
                //Multi projet
                case 1:
                    //nomServeur = Session["NomServeur"].ToString();
                    //user = Session["NomUtilisateur"].ToString();
                    //mdp = Session["MotDePasse"].ToString();
                    break;
                default:
                    //mono projet
                    nomServeur = objFinproXml.NomServeur;
                    user = objFinproXml.NomUtilisateur;
                    mdp = objFinproXml.MotdePasse;
                    break;
            }




            string connStrMaster = $"Server={nomServeur};Database=master;User Id={user};Password={mdp};";

            var (logicalDataName, logicalLogName) = GetLogicalFileNames(tempPath, connStrMaster);
            //nomBase = logicalDataName; // Par convention, on suppose que le LogicalName du .mdf correspond au nom de la base
            nomBase = GetNomBaseDepuisHeader(tempPath, connStrMaster);
            try
            {
                using (SqlConnection conn = new SqlConnection(connStrMaster))
                {
                    conn.Open();

                    // 1. Vérifier si la base existe déjà
                    string checkDbQuery = $"SELECT COUNT(*) FROM sys.databases WHERE name = '{nomBase}'";
                    using (SqlCommand cmd = new SqlCommand(checkDbQuery, conn))
                    {
                        int exists = (int)cmd.ExecuteScalar();
                        if (exists > 0)
                        {
                            //return Json(new { success = false, message = $"La base '{nomBase}' existe déjà." });

                            // Sauvegarder l’ancienne base
                            var racineOldBase = @"C:\SQLBackupsDEPREC\OldBaseRestore";
                            if (!Directory.Exists(racineOldBase))
                            {
                                Directory.CreateDirectory(racineOldBase);
                            }
                            string cheminSauvegardeOdl = Path.Combine(racineOldBase, $"{nomBase}_{DateTime.Now:yyyyMMdd_HHmmss}_User_{login}.bak");

                            string backupQueryOld = $@"
                                        BACKUP DATABASE [{nomBase}]
                                        TO DISK = N'{cheminSauvegardeOdl}'
                                        WITH INIT, FORMAT;";

                            //string backupQueryOld = $@"
                            //            BACKUP DATABASE [{nomBase}]
                            //            TO DISK = N'{cheminSauvegardeOdl}'
                            //            //WITH INIT, FORMAT, COMPRESSION;";
                            //            WITH INIT, FORMAT, COMPRESSION;";

                            using (SqlConnection connection = new SqlConnection(connStrMaster))
                            {
                                connection.Open();
                                using (SqlCommand command = new SqlCommand(backupQueryOld, connection))
                                {
                                    command.ExecuteNonQuery();
                                }
                            }

                            // 1.2 Fermer toutes les connexions et supprimer la base
                            //⚠️ Supprimer l'ancienne base après sauvegarde
                            try
                            {
                                string singleUserQuery = $@"ALTER DATABASE [{nomBase}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;";
                                string dropDbQuery = $@"DROP DATABASE [{nomBase}];";

                                using (SqlCommand cmdSingleUser = new SqlCommand(singleUserQuery, conn))
                                    cmdSingleUser.ExecuteNonQuery();

                                using (SqlCommand cmdDrop = new SqlCommand(dropDbQuery, conn))
                                    cmdDrop.ExecuteNonQuery();
                            }
                            catch (Exception dropEx)
                            {
                                return Json(new { success = false, message = $"Erreur lors de la suppression de la base existante : {dropEx.Message}" });
                            }
                        }
                    }

                    // 2. Vérifier la version du .bak
                    string restoreFileList = $"RESTORE HEADERONLY FROM DISK = N'{tempPath}'";
                    using (SqlCommand cmd = new SqlCommand(restoreFileList, conn))
                    {
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                string backupVersion = reader["SoftwareVersionMajor"].ToString();
                                string serverVersion = conn.ServerVersion.Split('.')[0];

                                if (int.Parse(backupVersion) > int.Parse(serverVersion))
                                {
                                    return Json(new
                                    {
                                        success = false,
                                        message = $"Version incompatible : le fichier a été créé sous SQL Server {backupVersion}, le serveur actuel est {serverVersion}"
                                    });
                                }
                            }
                        }
                    }
                    // 3. Restaurer la base
                    string dataFile = Path.Combine(dossierTemp, $"{nomBase}.mdf");
                    string logFile = Path.Combine(dossierTemp, $"{nomBase}_log.ldf");

                    string restoreQuery = $@"
                                            RESTORE DATABASE [{nomBase}]
                                            FROM DISK = N'{tempPath}'
                                            WITH MOVE '{logicalDataName}' TO N'{dataFile}',
                                                 MOVE '{logicalLogName}' TO N'{logFile}',
                                                 REPLACE";


                    using (SqlCommand cmd = new SqlCommand(restoreQuery, conn))
                    {
                        cmd.ExecuteNonQuery();
                    }

                    return Json(new { success = true, message = $"Restauration de la base '{nomBase}' terminée." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Erreur de restauration : {ex.Message}" });
            }
        }
    }
}